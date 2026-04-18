// ==UserScript==
// @name         WebAuthn Virtual Authenticator Vault
// @namespace    https://utility.clspd.top/go.html?product=webauthnvault
// @version      1.0.0
// @description  A local WebAuthn virtual authenticator vault for userscript managers.
// @match        https://*/*
// @require      https://unpkg.com/add-css-constructed@1.1.3/dist/umd.js#sha256-d0FJH11iwMemcFgueP8rpxVl9RdFyd3V8WJXX9SmB5I=
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @license      GPL-3.0-or-later
// ==/UserScript==

(() => {
  'use strict';

  const STORAGE_KEY = 'webauthn_virtual_authenticator_state_v1';
  const SCHEMA_VERSION = 1;
  const PBKDF2_ITERATIONS = 1_000_000;
  const MASTER_KEY_LENGTH_BYTES = 32;
  const PIN_SALT_LENGTH_BYTES = 16;
  const AES_GCM_IV_LENGTH_BYTES = 12;
  const CREATION_TIMEOUT_MS = 60_000;

  const te = new TextEncoder();
  const td = new TextDecoder();

  const hasCrypto = !!(globalThis.crypto?.subtle && globalThis.crypto?.getRandomValues);
  const hasGM = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';

  const memory = {
    unlocked: false,
    masterKey: null,
    vault: null,
    state: null,
    unlockPromise: null,
    panel: null,
  };

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'closed' });
  addCSS(':host { all: initial !important; }', shadow);

  const nativeCredentials = navigator.credentials;
  const nativeCreate = nativeCredentials?.create?.bind(nativeCredentials);
  const nativeGet = nativeCredentials?.get?.bind(nativeCredentials);

  const STATUS = {
    LOCKED: 'Locked',
    UNLOCKED: 'Unlocked',
    UNINITIALIZED: 'Not initialized',
  };

  function createPopoverContainer() {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;box-sizing:border-box;border:0;padding:0;width:100%;height:100%;background:transparent;cursor:not-allowed';
    container.popover = 'manual';
    shadow.appendChild(container);
    memory.popoverContainer = container;
    return container;
  }

  function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? '#aa3344' : type === 'warn' ? '#d7a84d' : '#2b7cff';
    toast.style.cssText = `position:fixed;bottom:16px;right:16px;z-index:2147483647;padding:12px 16px;border-radius:10px;background:${bgColor};color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:13px;max-width:320px;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;`;
    toast.appendChild(document.createTextNode(message));
    const container = createPopoverContainer();
    container.appendChild(toast);
    shadow.appendChild(container);
    container.showPopover();
    setTimeout(() => container.remove(), 3000);
  }

  addCSS('.confirm-dialog button { padding: 8px 16px; border-radius: 5px; cursor: pointer; }', shadow);
  function confirm(message) {
    return new Promise((resolve) => {
      const dlg = document.createElement('dialog');
      dlg.classList.add('confirm-dialog');
      const content = document.createElement('div');
      content.style.fontSize = 'large';
      content.style.marginBottom = '10px';
      content.appendChild(document.createTextNode(message));
      dlg.appendChild(content);
      const btnGroup = document.createElement('div');
      btnGroup.style.display = 'flex';
      btnGroup.style.justifyContent = 'flex-end';
      btnGroup.style.gap = '8px';
      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'Confirm';
      confirmBtn.addEventListener('click', () => (resolve(true), dlg.close()));
      btnGroup.appendChild(confirmBtn);
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => dlg.close());
      btnGroup.appendChild(cancelBtn);
      dlg.appendChild(btnGroup);
      dlg.addEventListener('close', () => resolve((dlg.remove(), false)));
      shadow.appendChild(dlg);
      dlg.showModal();
    });
  }

  function bytesToBase64(bytes) {
    let binary = '';
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (let i = 0; i < view.length; i++) {
      binary += String.fromCharCode(view[i]);
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    if (value == null) return new Uint8Array();
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (typeof value !== 'string') value = String(value);

    let normalized = value.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4) normalized += '=';
    const binary = atob(normalized);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i) & 0xff;
    return out;
  }

  function bytesToBase64Url(bytes) {
    return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64UrlToBytes(value) {
    if (value == null) return new Uint8Array();
    if (typeof value !== 'string') value = String(value);
    let normalized = value.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4) normalized += '=';
    const binary = atob(normalized);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i) & 0xff;
    return out;
  }

  function toUint8(value) {
    if (value == null) return new Uint8Array();
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (typeof value === 'string') return te.encode(value);
    throw new TypeError('Unsupported buffer source type');
  }

  function concatBytes(...chunks) {
    const total = chunks.reduce((sum, c) => sum + toUint8(c).byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      const view = toUint8(chunk);
      out.set(view, offset);
      offset += view.byteLength;
    }
    return out;
  }
  
  function toArrayBuffer(bytes) {
    const view = toUint8(bytes);
    return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
  }

  function randomBytes(length) {
    const out = new Uint8Array(length);
    crypto.getRandomValues(out);
    return out;
  }

  async function sha256(bytes) {
    const digest = await crypto.subtle.digest('SHA-256', toUint8(bytes));
    return new Uint8Array(digest);
  }

  function utf8Json(value) {
    return te.encode(JSON.stringify(value));
  }

  function bytesToHex(bytes) {
    return Array.from(toUint8(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function derivePinKey(pin, saltBytes) {
    const pinKey = await crypto.subtle.importKey(
      'raw',
      te.encode(pin),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: toUint8(saltBytes),
        iterations: PBKDF2_ITERATIONS,
      },
      pinKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function importAesKey(rawBytes) {
    return crypto.subtle.importKey('raw', toUint8(rawBytes), { name: 'AES-GCM' }, true, [
      'encrypt',
      'decrypt',
    ]);
  }

  async function encryptWithKey(plainBytes, key) {
    const iv = randomBytes(AES_GCM_IV_LENGTH_BYTES);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, toUint8(plainBytes));
    return {
      ivB64: bytesToBase64(toUint8(iv)),
      dataB64: bytesToBase64(new Uint8Array(ciphertext)),
    };
  }

  async function decryptWithKey(ivB64, dataB64, key) {
    const iv = base64ToBytes(ivB64);
    const data = base64ToBytes(dataB64);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new Uint8Array(plain);
  }

  function readState() {
    if (!hasGM) return null;
    const raw = GM_getValue(STORAGE_KEY, null);
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  }

  function writeState(state) {
    if (!hasGM) throw new Error('GM storage is not available');
    GM_setValue(STORAGE_KEY, JSON.stringify(state));
  }

  function deleteState() {
    if (hasGM && typeof GM_deleteValue === 'function') GM_deleteValue(STORAGE_KEY);
  }

  function cloneVault(vault) {
    return JSON.parse(JSON.stringify(vault));
  }

  function now() {
    return Date.now();
  }

  function normalizeRpIdFromOrigin(origin) {
    try {
      return new URL(origin).hostname;
    } catch {
      return location.hostname;
    }
  }

  function isRpMatch(storedRpId, host) {
    if (!storedRpId || !host) return false;
    if (storedRpId === host) return true;
    return host === storedRpId || host.endsWith('.' + storedRpId);
  }

  function isB64Like(value) {
    return typeof value === 'string' && /^[A-Za-z0-9+/_=-]+$/.test(value);
  }

  function decodeFlexibleBase64(value) {
    if (value == null) return new Uint8Array();
    if (typeof value !== 'string') value = String(value);
    return base64ToBytes(value);
  }

  function encodeExportBase64(bytes) {
    return bytesToBase64(toUint8(bytes));
  }

  function credentialIdToString(bytes) {
    return bytesToBase64Url(toUint8(bytes));
  }

  function stringToCredentialId(value) {
    return base64UrlToBytes(value);
  }

  function normalizeImportedFieldBytes(value) {
    if (value == null) return null;
    if (typeof value === 'string' && isB64Like(value)) return bytesToBase64(base64ToBytes(value));
    if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return bytesToBase64(toUint8(value));
    if (typeof value === 'string') return bytesToBase64(te.encode(value));
    return bytesToBase64(te.encode(String(value)));
  }

  function normalizeRecordShape(record) {
    const credentialId = record.credentialId || record.id;
    const user = record.user || {};

    return {
      type: 'public-key',
      id: record.id || credentialId,
      credentialId,
      rpId: record.rpId || normalizeRpIdFromOrigin(record.origin || location.origin),
      origin: record.origin || location.origin,
      counter: Number(record.counter ?? 0) >>> 0,
      createdAt: Number(record.createdAt ?? now()),
      prfKey: record.prfKey ?? null,
      publicKeySpki: record.publicKeySpki || null,
      publicKey: record.publicKey || null,
      privateKey: record.privateKey || null,
      alg: Number(record.alg ?? -7),
      user: {
        name: user.name ?? '',
        displayName: user.displayName ?? user.name ?? '',
        id: user.id ?? '',
      },
      extra: record.extra && typeof record.extra === 'object' ? record.extra : {},
    };
  }

  function exportRecordShape(record) {
    return {
      counter: record.counter >>> 0,
      createdAt: record.createdAt ?? now(),
      credentialId: encodeExportBase64(stringToCredentialId(record.credentialId)),
      id: encodeExportBase64(stringToCredentialId(record.id || record.credentialId)),
      origin: record.origin,
      prfKey: record.prfKey ? encodeExportBase64(decodeFlexibleBase64(record.prfKey)) : null,
      privateKey: record.privateKey ? encodeExportBase64(decodeFlexibleBase64(record.privateKey)) : null,
      publicKey: record.publicKey ? encodeExportBase64(decodeFlexibleBase64(record.publicKey)) : null,
      publicKeySpki: record.publicKeySpki ? encodeExportBase64(decodeFlexibleBase64(record.publicKeySpki)) : null,
      rpId: record.rpId,
      type: 'public-key',
      user: {
        displayName: record.user?.displayName ?? '',
        id: record.user?.id ? encodeExportBase64(decodeFlexibleBase64(record.user.id)) : '',
        name: record.user?.name ?? '',
      },
    };
  }

  function ensureVaultShape(vault) {
    const source = vault && typeof vault === 'object' ? vault : {};
    const records = Array.isArray(source.records) ? source.records.map(normalizeRecordShape) : [];
    return {
      schemaVersion: SCHEMA_VERSION,
      records,
    };
  }

  async function wrapMasterKey(masterRawBytes, pinKey) {
    const wrapped = await encryptWithKey(masterRawBytes, pinKey);
    return wrapped;
  }

  async function unwrapMasterKey(wrapped, pinKey) {
    return decryptWithKey(wrapped.ivB64, wrapped.dataB64, pinKey);
  }

  async function persistCurrentVault() {
    if (!memory.state || !memory.masterKey || !memory.vault) {
      throw new Error('Vault is not unlocked');
    }
    const plain = utf8Json(ensureVaultShape(memory.vault));
    const enc = await encryptWithKey(plain, memory.masterKey);
    memory.state.vault = {
      ivB64: enc.ivB64,
      dataB64: enc.dataB64,
    };
    memory.state.updatedAt = now();
    writeState(memory.state);
  }

  async function decryptVaultFromState(state, masterKey) {
    const vaultState = state.vault;
    if (!vaultState?.ivB64 || !vaultState?.dataB64) {
      return ensureVaultShape({ records: [] });
    }
    const plain = await decryptWithKey(vaultState.ivB64, vaultState.dataB64, masterKey);
    try {
      return ensureVaultShape(JSON.parse(td.decode(plain)));
    } catch {
      return ensureVaultShape({ records: [] });
    }
  }

  async function initializeNewVault(pin) {
    const salt = randomBytes(PIN_SALT_LENGTH_BYTES);
    const pinKey = await derivePinKey(pin, salt);
    const masterRaw = randomBytes(MASTER_KEY_LENGTH_BYTES);
    const masterKey = await importAesKey(masterRaw);
    const wrappedMaster = await wrapMasterKey(masterRaw, pinKey);
    const vaultPlain = utf8Json(ensureVaultShape({ records: [] }));
    const vaultEnc = await encryptWithKey(vaultPlain, masterKey);

    const state = {
      schemaVersion: SCHEMA_VERSION,
      createdAt: now(),
      updatedAt: now(),
      kdf: {
        algorithm: 'PBKDF2-SHA-256',
        iterations: PBKDF2_ITERATIONS,
        saltB64: bytesToBase64(salt),
      },
      masterKey: {
        algorithm: 'AES-GCM-256',
        ivB64: wrappedMaster.ivB64,
        dataB64: wrappedMaster.dataB64,
      },
      vault: {
        ivB64: vaultEnc.ivB64,
        dataB64: vaultEnc.dataB64,
      },
    };

    writeState(state);

    memory.state = state;
    memory.masterKey = masterKey;
    memory.vault = ensureVaultShape({ records: [] });
    memory.unlocked = true;
    return true;
  }

  async function unlockExistingVault(pin) {
    const state = readState();
    if (!state) return false;

    const saltB64 = state.kdf?.saltB64;
    const wrapped = state.masterKey;
    if (!saltB64 || !wrapped?.ivB64 || !wrapped?.dataB64) {
      throw new Error('Vault state is corrupted');
    }

    const pinKey = await derivePinKey(pin, base64ToBytes(saltB64));
    const masterRaw = await unwrapMasterKey(wrapped, pinKey);
    const masterKey = await importAesKey(masterRaw);
    const vault = await decryptVaultFromState(state, masterKey);

    memory.state = state;
    memory.masterKey = masterKey;
    memory.vault = vault;
    memory.unlocked = true;
    return true;
  }

  async function ensureUnlocked(interactiveReason = 'unlock the vault') {
    if (!hasCrypto || !hasGM) return false;
    if (memory.unlocked && memory.masterKey && memory.vault) return true;
    if (memory.unlockPromise) return memory.unlockPromise;

    memory.unlockPromise = (async () => {
      const existing = readState();
      if (!existing) {
        const pin = await requestPin({
          title: 'Create a PIN',
          message: `Create a new PIN to ${interactiveReason}.`,
          confirm: true,
          callback: async pin => {
            if (!pin && !await confirm('Are you sure you want to use empty PIN?')) throw 'Please create a PIN';
            return pin;
          }
        });
        if (pin == null) return false;
        await initializeNewVault(pin);
        return true;
      }

      let unlocked = false;
      let attempts = 0;
      const maxAttempts = Infinity;

      while (!unlocked && attempts < maxAttempts) {
        attempts++;
        const pin = await requestPin({
          title: `Unlock the vault`,
          message: attempts > 1 ? `Incorrect PIN. Please try again. (${attempts} attempts)` : `Enter the PIN to ${interactiveReason}.`,
          confirm: false,
          callback: async pin => {
            await unlockExistingVault(pin);
            return true;
          }
        });
        if (pin == null) return false;

        if (pin) {
          unlocked = true;
        }
      }

      return unlocked;
    })().finally(() => {
      memory.unlockPromise = null;
    });

    return memory.unlockPromise;
  }

  addCSS('.pin-dialog::backdrop { background: rgba(0, 0, 0, 0.5); }.pin-dialog .error-message:empty { display: none; }', shadow);
  function requestPin({ title, message, confirm, callback }) {
    return new Promise((resolve) => {
      const dialog = document.createElement('dialog');
      dialog.classList.add('pin-dialog');
      dialog.style.cssText = 'border:none;border-radius:16px;padding:0;width:400px;background:#11161f;color:#e7eaf0;font-family:Arial,Helvetica,sans-serif;';
      dialog.innerHTML = `
        <form method="dialog" style="margin:0;padding:24px;display:grid;gap:16px;">
          <div style="font-size:18px;font-weight:700;">${escapeText(title)}</div>
          <div style="font-size:13px;color:#a9b2c3;line-height:1.5;">${escapeText(message)}</div>
          <div style="display:grid;gap:12px;">
            <div style="display:grid;gap:8px;">
              <label for="pin-input" style="font-size:13px;font-weight:600;">PIN:</label>
              <input id="pin-input" type="password" autocomplete="off" style="padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.3);color:#e7eaf0;font:inherit;font-size:14px;outline:none;" />
            </div>
            <div style="display:${confirm ? 'grid' : 'none !important'};gap:8px;">
              <label for="pin-confirm" style="font-size:13px;font-weight:600;">Confirm PIN:</label>
              <input id="pin-confirm" type="password" autocomplete="off" style="padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.3);color:#e7eaf0;font:inherit;font-size:14px;outline:none;" />
            </div>
            <div style="color:red;" class="error-message"></div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
            <button type="button" data-action="cancel" style="padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.08);color:#e7eaf0;cursor:pointer;font:inherit;font-size:13px;">Cancel</button>
            <button type="submit" data-action="submit" style="padding:9px 16px;border-radius:999px;border:none;background:#2b7cff;color:#fff;cursor:pointer;font:inherit;font-size:13px;font-weight:600;">OK</button>
          </div>
        </form>
      `;

      shadow.appendChild(dialog);

      const pinInput = dialog.querySelector('#pin-input');
      const cancelBtn = dialog.querySelector('[data-action="cancel"]');
      const submitBtn = dialog.querySelector('[data-action="submit"]');
      const form = dialog.querySelector('form');
      const errorMessage = dialog.querySelector('.error-message');

      const cleanup = () => dialog.remove();

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      cancelBtn.addEventListener('click', handleCancel);
      dialog.addEventListener('cancel', handleCancel);
      dialog.addEventListener('close', () => {
        cleanup();
        resolve(null);
      });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const value = pinInput.value;
        if (confirm) {
          const confirmInput = dialog.querySelector('#pin-confirm');
          if (value !== confirmInput.value) {
            errorMessage.textContent = 'The two PIN entries do not match. Please try again.';
            return;
          }
          confirmInput.value = '';
        }
        pinInput.value = '';
        let result = value;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        if (callback) try {
          result = await callback(value);
        } catch (e) {
          errorMessage.textContent = String(e);
          return;
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'OK';
        }
        resolve(result);
        dialog.close();
      });

      dialog.showModal();
      pinInput.focus();
    });
  }

  function lockVault() {
    memory.unlocked = false;
    memory.masterKey = null;
    memory.vault = null;
  }

  function decodeBufferSourceMaybeBase64(value) {
    if (value == null) return new Uint8Array();
    if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return toUint8(value);
    if (typeof value === 'string') return decodeFlexibleBase64(value);
    return te.encode(String(value));
  }

  function getRpIdFromRequest(publicKey) {
    return publicKey?.rpId || publicKey?.rp?.id || normalizeRpIdFromOrigin(location.origin);
  }

  function matchesAllowCredentials(record, allowCredentials) {
    if (!Array.isArray(allowCredentials) || allowCredentials.length === 0) return true;
    const id = record.credentialId;
    return allowCredentials.some((item) => {
      if (!item) return false;
      const allowedId = item.id;
      if (allowedId == null) return false;
      const allowedBytes = decodeBufferSourceMaybeBase64(allowedId);
      return bytesToBase64Url(allowedBytes) === id || bytesToBase64(allowedBytes) === encodeExportBase64(stringToCredentialId(id));
    });
  }

  function getMatchingRecords(publicKey) {
    const rpId = getRpIdFromRequest(publicKey);
    const allowCredentials = publicKey?.allowCredentials;
    return (memory.vault?.records || []).filter((record) => {
      return isRpMatch(record.rpId, rpId) && matchesAllowCredentials(record, allowCredentials);
    });
  }

  function makeWebAuthnCredentialObject({
    id,
    rawId,
    type,
    response,
    authenticatorAttachment = 'platform',
    clientExtensionResults = {},
  }) {
    const credential = {
      id,
      rawId,
      type,
      response,
      authenticatorAttachment,
      clientExtensionResults,
      getClientExtensionResults() {
        return this.clientExtensionResults;
      },
      toJSON() {
        return {
          id: this.id,
          rawId: bytesToBase64Url(this.rawId),
          type: this.type,
          response: {
            clientDataJSON: bytesToBase64Url(this.response.clientDataJSON),
            attestationObject: this.response.attestationObject
              ? bytesToBase64Url(this.response.attestationObject)
              : undefined,
            authenticatorData: this.response.authenticatorData
              ? bytesToBase64Url(this.response.authenticatorData)
              : undefined,
            signature: this.response.signature
              ? bytesToBase64Url(this.response.signature)
              : undefined,
            userHandle: this.response.userHandle != null
              ? (this.response.userHandle ? bytesToBase64Url(this.response.userHandle) : null)
              : undefined,
          },
          authenticatorAttachment: this.authenticatorAttachment,
          clientExtensionResults: this.clientExtensionResults,
        };
      },
    };

    if (typeof PublicKeyCredential !== 'undefined') {
      Object.setPrototypeOf(credential, PublicKeyCredential.prototype);
    }
    return credential;
  }

  async function importPrivateKey(pkcs8Bytes) {
    return crypto.subtle.importKey(
      'pkcs8',
      toUint8(pkcs8Bytes),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  }

  async function generateCredentialKeyPair() {
    return crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );
  }

  async function exportCredentialKeyPair(keyPair) {
    const [privateKeyRaw, publicKeyRaw, publicKeySpkiRaw] = await Promise.all([
      crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
      crypto.subtle.exportKey('raw', keyPair.publicKey),
      crypto.subtle.exportKey('spki', keyPair.publicKey),
    ]);

    return {
      privateKeyB64: bytesToBase64(new Uint8Array(privateKeyRaw)),
      publicKeyB64: bytesToBase64(new Uint8Array(publicKeyRaw)),
      publicKeySpkiB64: bytesToBase64(new Uint8Array(publicKeySpkiRaw)),
    };
  }

  function parseRawEcPublicKey(publicKeyRawBytes) {
    const raw = toUint8(publicKeyRawBytes);
    if (raw.byteLength !== 65 || raw[0] !== 0x04) {
      throw new Error('Only uncompressed P-256 public keys are supported');
    }
    const x = raw.slice(1, 33);
    const y = raw.slice(33, 65);
    return { x, y };
  }

  function cborEncode(value) {
    const out = [];
    const push = (...bytes) => {
      out.push(...bytes);
    };

    const writeUint = (major, n) => {
      if (n < 24) {
        push((major << 5) | n);
      } else if (n < 0x100) {
        push((major << 5) | 24, n);
      } else if (n < 0x10000) {
        push((major << 5) | 25, (n >> 8) & 0xff, n & 0xff);
      } else if (n < 0x100000000) {
        push((major << 5) | 26, (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
      } else {
        const hi = Math.floor(n / 0x100000000);
        const lo = n >>> 0;
        push(
          (major << 5) | 27,
          (hi >>> 24) & 0xff,
          (hi >>> 16) & 0xff,
          (hi >>> 8) & 0xff,
          hi & 0xff,
          (lo >>> 24) & 0xff,
          (lo >>> 16) & 0xff,
          (lo >>> 8) & 0xff,
          lo & 0xff
        );
      }
    };

    const encodeItem = (item) => {
      if (item === null) {
        push(0xf6);
        return;
      }
      if (item === false) {
        push(0xf4);
        return;
      }
      if (item === true) {
        push(0xf5);
        return;
      }
      if (item instanceof Uint8Array || item instanceof ArrayBuffer || ArrayBuffer.isView(item)) {
        const bytes = toUint8(item);
        writeUint(2, bytes.byteLength);
        push(...bytes);
        return;
      }
      if (typeof item === 'string') {
        const bytes = te.encode(item);
        writeUint(3, bytes.byteLength);
        push(...bytes);
        return;
      }
      if (typeof item === 'number' && Number.isInteger(item)) {
        if (item >= 0) {
          writeUint(0, item);
        } else {
          writeUint(1, -1 - item);
        }
        return;
      }
      if (Array.isArray(item)) {
        writeUint(4, item.length);
        for (const entry of item) encodeItem(entry);
        return;
      }
      if (item instanceof Map) {
        writeUint(5, item.size);
        for (const [key, val] of item.entries()) {
          encodeItem(key);
          encodeItem(val);
        }
        return;
      }
      if (typeof item === 'object') {
        const entries = Object.entries(item);
        writeUint(5, entries.length);
        for (const [key, val] of entries) {
          encodeItem(key);
          encodeItem(val);
        }
        return;
      }
      throw new TypeError(`Unsupported CBOR type: ${typeof item}`);
    };

    encodeItem(value);
    return new Uint8Array(out);
  }

  function encodeDERInteger(bytes) {
    let start = 0;
    while (start < bytes.length - 1 && bytes[start] === 0) start++;
    const trimmed = bytes.slice(start);
    const needsPadding = (trimmed[0] & 0x80) !== 0;
    const length = trimmed.length + (needsPadding ? 1 : 0);

    const result = new Uint8Array(2 + length);
    result[0] = 0x02;
    result[1] = length;
    if (needsPadding) {
      result[2] = 0x00;
      result.set(trimmed, 3);
    } else {
      result.set(trimmed, 2);
    }
    return result;
  }

  function convertP1363ToDER(p1363Sig) {
    const sig = new Uint8Array(p1363Sig);
    const r = sig.slice(0, 32);
    const s = sig.slice(32, 64);
    const rDer = encodeDERInteger(r);
    const sDer = encodeDERInteger(s);
    const sequenceLength = rDer.length + sDer.length;

    let result;
    if (sequenceLength <= 127) {
      result = new Uint8Array(2 + sequenceLength);
      result[0] = 0x30;
      result[1] = sequenceLength;
      result.set(rDer, 2);
      result.set(sDer, 2 + rDer.length);
    } else {
      result = new Uint8Array(3 + sequenceLength);
      result[0] = 0x30;
      result[1] = 0x81;
      result[2] = sequenceLength;
      result.set(rDer, 3);
      result.set(sDer, 3 + rDer.length);
    }
    return result.buffer;
  }

  async function buildAttestationObject(record) {
    const clientDataHash = await sha256(utf8Json({
      type: 'webauthn.create',
      challenge: record.challengeB64Url,
      origin: record.origin,
      crossOrigin: false,
    }));

    const rpIdHash = await sha256(te.encode(record.rpId));
    const flags = 0x41 | 0x04; // UP + AT + UV
    const signCount = new Uint8Array(4);
    const credId = base64UrlToBytes(record.credentialId);
    const rawPublicKey = base64ToBytes(record.publicKey);
    const { x, y } = parseRawEcPublicKey(rawPublicKey);

    const coseKey = new Map([
      [1, 2],      // kty: EC2
      [3, -7],     // alg: ES256
      [-1, 1],     // crv: P-256
      [-2, x],
      [-3, y],
    ]);

    const attestedCredentialData = concatBytes(
      new Uint8Array(16), // AAGUID
      new Uint8Array([(credId.byteLength >> 8) & 0xff, credId.byteLength & 0xff]),
      credId,
      cborEncode(coseKey)
    );

    const authData = concatBytes(rpIdHash, new Uint8Array([flags]), signCount, attestedCredentialData);
    const attestationObject = cborEncode({
      fmt: 'none',
      attStmt: {},
      authData,
    });

    return {
      attestationObject,
      clientDataJSON: utf8Json({
        type: 'webauthn.create',
        challenge: record.challengeB64Url,
        origin: record.origin,
        crossOrigin: false,
      }),
    };
  }

  async function buildAssertionResponse(record, publicKeyRequest) {
    const challengeBytes = toUint8(publicKeyRequest.challenge);
    const clientDataJSON = utf8Json({
      type: 'webauthn.get',
      challenge: bytesToBase64Url(challengeBytes),
      origin: location.origin,
    });
    
    record.counter = (record.counter >>> 0) + 1;
    
    const rpIdHash = await sha256(te.encode(record.rpId));
    const flags = 0x01 | 0x04; // UP + UV
    const signCount = new Uint8Array([
      (record.counter >>> 24) & 0xff,
      (record.counter >>> 16) & 0xff,
      (record.counter >>> 8) & 0xff,
      record.counter & 0xff,
    ]);
    const authenticatorData = concatBytes(rpIdHash, new Uint8Array([flags]), signCount);
    
    const privateKey = await importPrivateKey(base64ToBytes(record.privateKey));
    const signatureP1363 = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      concatBytes(authenticatorData, await sha256(clientDataJSON))
    );
    
    const signatureDER = convertP1363ToDER(signatureP1363);
    
    return {
      authenticatorData: toArrayBuffer(authenticatorData),
      clientDataJSON: toArrayBuffer(clientDataJSON),
      signature: toArrayBuffer(signatureDER),
      userHandle: record.user?.id ? toArrayBuffer(decodeFlexibleBase64(record.user.id)) : null,
    };
  }

  function makeAttestationResponse({
    clientDataJSON,
    attestationObject,
    authenticatorData,
    publicKeySpki,
    algorithm = -7,
    transports = ['internal'],
  }) {
    const response = {
      attestationObject: toArrayBuffer(attestationObject),
      clientDataJSON: toArrayBuffer(clientDataJSON),

      getTransports() {
        return Array.isArray(transports) ? transports.slice() : ['internal'];
      },

      getAuthenticatorData() {
        return toArrayBuffer(authenticatorData);
      },

      getPublicKey() {
        return publicKeySpki ? toArrayBuffer(publicKeySpki) : null;
      },

      getPublicKeyAlgorithm() {
        return algorithm;
      },
    };

    if (typeof AuthenticatorAttestationResponse !== 'undefined') {
      Object.setPrototypeOf(response, AuthenticatorAttestationResponse.prototype);
    }

    return response;
  }

  function makeAssertionResponse({
    clientDataJSON,
    authenticatorData,
    signature,
    userHandle,
  }) {
    const response = {
      authenticatorData: toArrayBuffer(authenticatorData),
      clientDataJSON: toArrayBuffer(clientDataJSON),
      signature: toArrayBuffer(signature),
      userHandle: userHandle ? toArrayBuffer(userHandle) : null,
    };

    if (typeof AuthenticatorAssertionResponse !== 'undefined') {
      Object.setPrototypeOf(response, AuthenticatorAssertionResponse.prototype);
    }

    return response;
  }

  function createDefaultWebAuthnError(name = 'NotAllowedError', message = 'The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.') {
    return new DOMException(message, name);
  }

  function showWebAuthnPopover(type) {
    return new Promise((resolve) => {
      const container = createPopoverContainer();
      container.style.background = 'rgba(255,255,255,0.2)';

      const icon = type === 'create' ? '🔐' : '🔑';
      const actionText = type === 'create' ? 'create' : 'get';

      const notification = document.createElement('div');
      notification.style.cssText = 'cursor:auto;max-width:360px;padding:12px 16px;border-radius:10px;background:#1a1f2e;color:#e7eaf0;font-family:Arial,Helvetica,sans-serif;font-size:16px;box-shadow:0 4px 16px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:10px;position:fixed;right:1em;top:1em;';
      notification.innerHTML = `
        <span style="font-size:18px;flex-shrink:0;">${icon}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:bold;margin-bottom:2px;">WebAuthn Request</div>
          <div style="color:#a9b2c3;font-size:14px;white-space:normal;overflow-wrap:anywhere;overflow:hidden;text-overflow:ellipsis;">${escapeText(location.hostname)} is attempting to ${actionText} a credential, continue?</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button data-action="allow" style="padding:6px 10px;border-radius:6px;border:none;background:#2b7cff;color:#fff;cursor:pointer;font:inherit;font-size:15px;font-weight:600;">✓</button>
          <button data-action="fallback" style="padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#a9b2c3;cursor:pointer;font:inherit;font-size:15px;">↩</button>
          <button data-action="deny" style="padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#a9b2c3;cursor:pointer;font:inherit;font-size:15px;">✕</button>
        </div>
      `;

      container.appendChild(notification);

      const handleAction = (action) => {
        container.hidePopover();
        container.remove();
        resolve(action);
      };

      notification.querySelector('[data-action="allow"]').addEventListener('click', () => handleAction('allow'));
      notification.querySelector('[data-action="fallback"]').addEventListener('click', () => handleAction('fallback'));
      notification.querySelector('[data-action="deny"]').addEventListener('click', () => handleAction('deny'));

      container.addEventListener('click', e => {
        if (e.target !== container) return;
        container.remove();
        resolve('deny');
      });

      container.showPopover();
    });
  }

  async function chooseCredentialForGet(records, requestOptions) {
    if (records.length === 0) return { action: 'system' };
    if (records.length === 1) return { action: 'vault', record: records[0] };

    return new Promise((resolve) => {
      ensurePanel().then((panel) => {
        panel.showSelection({
          records,
          requestOptions,
          onUseVault: (record) => resolve({ action: 'vault', record }),
          onUseSystem: () => resolve({ action: 'system' }),
          onCancel: () => resolve({ action: 'system' }),
        });
      }).catch(() => resolve({ action: 'system' }));
    });
  }

  async function handleCreate(options, fallbackNative) {
    try {
      if (!options?.publicKey) return fallbackNative ? fallbackNative(options) : Promise.reject(createDefaultWebAuthnError('NotSupportedError', 'navigator.credentials.create fallback is unavailable.'));

      const userChoice = await showWebAuthnPopover('create');
      if (userChoice === 'deny') return Promise.reject(createDefaultWebAuthnError());
      if (userChoice === 'fallback') return fallbackNative ? fallbackNative(options) : Promise.reject(createDefaultWebAuthnError());

      const unlocked = await ensureUnlocked('create and store a passkey');
      if (!unlocked) return Promise.reject(createDefaultWebAuthnError());

      const publicKey = options.publicKey;
      const rpId = getRpIdFromRequest(publicKey);
      const challengeBytes = decodeBufferSourceMaybeBase64(publicKey.challenge);
      const challengeB64Url = bytesToBase64Url(challengeBytes);

      if (!Array.isArray(publicKey.pubKeyCredParams) || !publicKey.pubKeyCredParams.some((p) => p && Number(p.alg) === -7)) {
        throw createDefaultWebAuthnError('NotSupportedError', 'Only ES256 credentials are supported by this vault.');
      }

      const user = publicKey.user || {};
      const rawId = randomBytes(32);
      const credentialId = bytesToBase64Url(rawId);

      const keyPair = await generateCredentialKeyPair();
      const exported = await exportCredentialKeyPair(keyPair);

      const excludeCredentials = Array.isArray(publicKey.excludeCredentials) ? publicKey.excludeCredentials : [];
      const duplicate = memory.vault.records.find((record) => {
        return excludeCredentials.some((item) => {
          if (!item?.id) return false;
          const allowed = bytesToBase64Url(decodeBufferSourceMaybeBase64(item.id));
          return allowed === record.credentialId;
        });
      });
      if (duplicate) {
        throw createDefaultWebAuthnError('InvalidStateError', 'A matching credential already exists.');
      }

      const record = normalizeRecordShape({
        id: credentialId,
        credentialId,
        rpId,
        origin: location.origin,
        counter: 0,
        createdAt: now(),
        prfKey: bytesToBase64(randomBytes(32)),
        publicKey: exported.publicKeyB64,
        publicKeySpki: exported.publicKeySpkiB64,
        privateKey: exported.privateKeyB64,
        alg: -7,
        user: {
          name: String(user.name ?? ''),
          displayName: String(user.displayName ?? user.name ?? ''),
          id: normalizeImportedFieldBytes(user.id) || '',
        },
        extra: {},
      });
      record.challengeB64Url = challengeB64Url;

      const build = await buildAttestationObject(record);
      record.challengeB64Url = null;

      const snapshot = cloneVault(memory.vault);
      memory.vault.records.push(record);
      try {
        await persistCurrentVault();
      } catch (persistError) {
        memory.vault = snapshot;
        throw persistError;
      }

      const response = makeAttestationResponse({
        clientDataJSON: build.clientDataJSON,
        attestationObject: build.attestationObject,
        authenticatorData: build.authData,
        publicKeySpki: exported.publicKeySpkiB64 ? decodeFlexibleBase64(exported.publicKeySpkiB64) : null,
        algorithm: record.alg ?? -7,
        transports: ['internal'],
      });
      
      const credential = makeWebAuthnCredentialObject({
        id: credentialId,
        rawId,
        type: 'public-key',
        response,
        clientExtensionResults: {
          credProps: { rk: true },
        },
      });
      return credential;
    } catch (error) {
      console.warn('WebAuthn vault create failed.', error);
      showMessage(String(error), 'error');
      return Promise.reject(error);
    }
  }

  async function handleGet(options, fallbackNative) {
    try {
      if (!options?.publicKey) return fallbackNative ? fallbackNative(options) : Promise.reject(createDefaultWebAuthnError('NotSupportedError', 'navigator.credentials.get fallback is unavailable.'));

      const userChoice = await showWebAuthnPopover('get');
      if (userChoice === 'deny') return Promise.reject(createDefaultWebAuthnError());
      if (userChoice === 'fallback') return fallbackNative ? fallbackNative(options) : Promise.reject(createDefaultWebAuthnError());

      const unlocked = await ensureUnlocked('use a stored passkey');
      if (!unlocked) return Promise.reject(createDefaultWebAuthnError());

      const publicKey = options.publicKey;
      const matchingRecords = getMatchingRecords(publicKey);

      if (matchingRecords.length === 0) {
        showMessage('No matching credentials found for this request. We will use system credentials instead.', 'warn');
        return fallbackNative ? fallbackNative(options) : Promise.reject(createDefaultWebAuthnError());
      }

      const choice = await chooseCredentialForGet(matchingRecords, options);
      if (!choice || choice.action === 'system' || !choice.record) {
        return fallbackNative ? fallbackNative(options) : Promise.reject(createDefaultWebAuthnError());
      }

      const record = choice.record;
      const snapshot = cloneVault(memory.vault);
      const response = await buildAssertionResponse(record, publicKey);
      try {
        await persistCurrentVault();
      } catch (persistError) {
        memory.vault = snapshot;
        throw persistError;
      }

      const credential = makeWebAuthnCredentialObject({
        id: record.credentialId,
        rawId: base64UrlToBytes(record.credentialId),
        type: 'public-key',
        response,
        clientExtensionResults: {
          credProps: { rk: true },
        },
      });
      return credential;
    } catch (error) {
      console.warn('WebAuthn vault get failed, falling back to system credentials.', error);
      return fallbackNative ? fallbackNative(options) : Promise.reject(error);
    }
  }

  function patchCredentials() {
    if (!nativeCredentials) return;

    const createProxy = nativeCreate
      ? new Proxy(nativeCreate, {
          apply(target, thisArg, argArray) {
            return handleCreate(argArray[0], target ? target.bind(nativeCredentials) : nativeCreate);
          },
        })
      : null;

    const getProxy = nativeGet
      ? new Proxy(nativeGet, {
          apply(target, thisArg, argArray) {
            return handleGet(argArray[0], target ? target.bind(nativeCredentials) : nativeGet);
          },
        })
      : null;

    const targets = [nativeCredentials].filter(Boolean);
    for (const target of targets) {
      try {
        if (nativeCreate) {
          Object.defineProperty(target, 'create', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: createProxy,
          });
        }
      } catch (error) {
        console.warn('Unable to patch navigator.credentials.create on target.', error);
      }

      try {
        if (nativeGet) {
          Object.defineProperty(target, 'get', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: getProxy,
          });
        }
      } catch (error) {
        console.warn('Unable to patch navigator.credentials.get on target.', error);
      }
    }
  }

  function safeJSONParse(text, fallback = null) {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  }

  async function normalizeImportedPasskeyEntry(entry) {
    const credentialId = entry.credentialId || entry.id;
    const privateKey = entry.privateKey;
    const publicKey = entry.publicKey;
    const user = entry.user || {};
    const rpId = entry.rpId || normalizeRpIdFromOrigin(entry.origin || location.origin);

    if (!credentialId || !privateKey || !publicKey) {
      throw new Error('Imported passkey is missing credentialId, privateKey, or publicKey.');
    }

    let publicKeySpkiB64 = null;
    try {
      const rawBytes = decodeFlexibleBase64(publicKey);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        rawBytes,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      );

      const spki = await crypto.subtle.exportKey('spki', cryptoKey);
      publicKeySpkiB64 = bytesToBase64(new Uint8Array(spki));
    } catch (e) {
      console.warn('Failed to derive SPKI from imported publicKey', e);
    }

    return normalizeRecordShape({
      id: credentialIdToString(decodeFlexibleBase64(credentialId)),
      credentialId: credentialIdToString(decodeFlexibleBase64(credentialId)),
      rpId,
      origin: entry.origin || location.origin,
      counter: Number(entry.counter ?? 0) >>> 0,
      createdAt: Number(entry.createdAt ?? now()),
      prfKey: entry.prfKey ?? null,
      privateKey: bytesToBase64(decodeFlexibleBase64(privateKey)),
      publicKey: bytesToBase64(decodeFlexibleBase64(publicKey)),
      publicKeySpki: publicKeySpkiB64,
      alg: Number(entry.alg ?? -7),
      user: {
        name: String(user.name ?? ''),
        displayName: String(user.displayName ?? user.name ?? ''),
        id: user.id ? bytesToBase64(decodeFlexibleBase64(user.id)) : '',
      },
      extra: {},
    });
  }

  async function mergeImportedVaultData(data) {
    const root = data && typeof data === 'object' ? data : {};
    const passkeys = Array.isArray(root.passkeys) ? root.passkeys : [];
    const imported = [];
    for (const entry of passkeys) {
      imported.push(await normalizeImportedPasskeyEntry(entry));
    }

    const byId = new Map((memory.vault.records || []).map((record) => [record.credentialId, record]));
    for (const record of imported) {
      byId.set(record.credentialId, record);
    }
    memory.vault.records = Array.from(byId.values());
  }

  function exportVaultData() {
    return {
      exportedAt: new Date().toISOString(),
      passkeys: (memory.vault.records || []).map(exportRecordShape),
    };
  }

  function formatDate(ms) {
    try {
      return new Date(ms).toLocaleString();
    } catch {
      return String(ms);
    }
  }

  function escapeText(value) {
    return String(value ?? '');
  }

  async function ensurePanel() {
    if (memory.panel) return memory.panel;
    if (!document.body) {
      await new Promise((resolve) => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        } else {
          resolve();
        }
      });
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'vault-manage-dialog';

    const wrapper = document.createElement('div');
    wrapper.className = 'vault-manage-panel';
    wrapper.innerHTML = `
      <header class="header">
        <div>
          <div class="title">WebAuthn Virtual Authenticator</div>
          <div class="subtitle">Local vault managed by a PIN and Web Crypto API</div>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" data-action="lock">Lock</button>
          <button type="button" class="btn btn-secondary" data-action="close">Close</button>
        </div>
      </header>

      <section class="section">
        <div class="section-head">
          <h2>Stored passkeys</h2>
          <div class="status" data-role="status"></div>
        </div>
        <div class="record-list" data-role="record-list"></div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Import / Export</h2>
        </div>
        <p class="notice">
          Exported backups are not encrypted. Keep them in a safe place.
        </p>
        <div class="import-grid">
          <textarea data-role="import-text" spellcheck="false" placeholder='Paste JSON backup here...'></textarea>
          <div class="import-actions">
            <input type="file" accept="application/json" data-role="import-file" />
            <button type="button" class="btn" data-action="import">Import</button>
            <button type="button" class="btn btn-secondary" data-action="export">Export</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>PIN</h2>
        </div>
        <div class="pin-actions">
          <button type="button" class="btn" data-action="change-pin">Change PIN</button>
          <button type="button" class="btn btn-secondary" data-action="reset">Delete All Data</button>
        </div>
      </section>
    `;

    dialog.appendChild(wrapper);
    shadow.appendChild(dialog);

    addCSS(`
      dialog.vault-manage-dialog {
        border: none;
        border-radius: 18px;
        padding: 0;
        width: 960px;
        max-width: calc(100vw - 24px);
        overflow: auto;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
        color: #e7eaf0;
        background: #11161f;
      }

      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }

      dialog.vault-selection-dialog {
        color:#e7eaf0;
        background:#11161f;
        width: 680px;
        padding: 16px;
        border-radius: 10px;
        border: 0;
      }

      .vault-manage-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        font-family: Arial, Helvetica, sans-serif;
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 12px;
      }

      .title {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
      }

      .subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: #a9b2c3;
      }

      .header-actions,
      .pin-actions,
      .import-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .section {
        display: grid;
        gap: 10px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
      }

      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      h2 {
        margin: 0;
        font-size: 15px;
      }

      .status {
        font-size: 13px;
        color: #a9b2c3;
      }

      .notice {
        margin: 0;
        font-size: 13px;
        color: #d7a84d;
      }

      .record-list {
        display: grid;
        gap: 10px;
        max-height: 38vh;
        overflow: auto;
        padding-right: 4px;
      }

      .record {
        display: grid;
        gap: 10px;
        padding: 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .record-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .record-title {
        font-size: 14px;
        font-weight: 700;
      }

      .record-meta {
        font-size: 12px;
        color: #a9b2c3;
        line-height: 1.5;
        word-break: break-all;
      }

      .record-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      textarea {
        width: 100%;
        min-height: 160px;
        resize: vertical;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 12px;
        color: #e7eaf0;
        background: rgba(0, 0, 0, 0.2);
        font: inherit;
        box-sizing: border-box;
      }

      input[type="file"] {
        max-width: 100%;
        color: #a9b2c3;
      }

      .btn {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        padding: 9px 14px;
        background: #2b7cff;
        color: #fff;
        cursor: pointer;
        font: inherit;
      }

      .btn:hover {
        filter: brightness(1.05);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
      }

      .btn-danger {
        background: #aa3344;
      }

      .import-grid {
        display: grid;
        gap: 10px;
      }
    `, shadow);

    const statusEl = wrapper.querySelector('[data-role="status"]');
    const listEl = wrapper.querySelector('[data-role="record-list"]');
    const importTextEl = wrapper.querySelector('[data-role="import-text"]');
    const importFileEl = wrapper.querySelector('[data-role="import-file"]');

    function updateStatus(message) {
      statusEl.textContent = message;
    }

    function renderList() {
      const records = memory.vault?.records || [];
      updateStatus(`${memory.unlocked ? STATUS.UNLOCKED : STATUS.LOCKED} · ${records.length} passkey(s) stored`);
      listEl.innerHTML = '';
      if (!records.length) {
        const empty = document.createElement('div');
        empty.className = 'record';
        empty.textContent = 'No passkeys stored yet.';
        listEl.appendChild(empty);
        return;
      }

      for (const record of records) {
        const item = document.createElement('div');
        item.className = 'record';

        const top = document.createElement('div');
        top.className = 'record-top';

        const title = document.createElement('div');
        title.className = 'record-title';
        title.textContent = `${record.user?.displayName || record.user?.name || 'Unnamed user'} · ${record.rpId}`;

        const actions = document.createElement('div');
        actions.className = 'record-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
          if (!await confirm('Delete this passkey from the vault?')) return;
          memory.vault.records = memory.vault.records.filter((x) => x.credentialId !== record.credentialId);
          await persistCurrentVault();
          renderList();
        });

        actions.appendChild(deleteBtn);
        top.appendChild(title);
        top.appendChild(actions);

        const meta = document.createElement('div');
        meta.className = 'record-meta';
        meta.innerHTML = [
          `Credential ID: ${escapeText(record.credentialId)}`,
          `Origin: ${escapeText(record.origin)}`,
          `Counter: ${record.counter >>> 0}`,
          `Created: ${formatDate(record.createdAt)}`,
        ].map((line) => `<div>${line}</div>`).join('');

        item.appendChild(top);
        item.appendChild(meta);
        listEl.appendChild(item);
      }
    }

    async function doImport() {
      const text = importTextEl.value.trim();
      let data = null;
      if (text) {
        data = safeJSONParse(text, null);
      } else if (importFileEl.files && importFileEl.files[0]) {
        const fileText = await importFileEl.files[0].text();
        data = safeJSONParse(fileText, null);
      }

      if (!data) {
        showMessage('Please provide a valid JSON backup to import.', 'error');
        return;
      }

      await mergeImportedVaultData(data);
      await persistCurrentVault();
      renderList();
      showMessage('Import completed.');
    }

    async function doExport() {
      if (!await confirm('Exporting will create an unencrypted backup file. Continue?')) return;
      const payload = exportVaultData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'webauthn-passkeys-backup.json';
      a.rel = 'noreferrer';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    async function doChangePin() {
      if (!memory.unlocked || !memory.masterKey || !memory.state) {
        showMessage('Unlock the vault first.', 'warn');
        return;
      }

      const newPin = await requestPin({
        title: 'Change PIN',
        message: 'Enter a new PIN.',
        confirm: true,
      });

      if (null == newPin) return;
      if (!newPin && !await confirm('Are you sure you want to use empty PIN?')) return await doChangePin();

      const salt = randomBytes(PIN_SALT_LENGTH_BYTES);
      const pinKey = await derivePinKey(newPin, salt);
      const masterRaw = await crypto.subtle.exportKey('raw', memory.masterKey);
      const wrapped = await wrapMasterKey(masterRaw, pinKey);

      memory.state.kdf = {
        algorithm: 'PBKDF2-SHA-256',
        iterations: PBKDF2_ITERATIONS,
        saltB64: bytesToBase64(salt),
      };
      memory.state.masterKey = {
        algorithm: 'AES-GCM-256',
        ivB64: wrapped.ivB64,
        dataB64: wrapped.dataB64,
      };
      memory.state.updatedAt = now();
      writeState(memory.state);
      showMessage('PIN changed successfully.');
    }

    async function doReset() {
      if (!await confirm('Delete the entire vault, including all stored credentials?')) return;
      if (!await confirm('LAST CONFIRM!! This will delete the entire vault, including all stored credentials!! Are you sure??')) return;
      deleteState();
      lockVault();
      dialog.close();
      window.location.reload();
    }

    wrapper.querySelector('[data-action="close"]').addEventListener('click', () => dialog.close());
    wrapper.querySelector('[data-action="lock"]').addEventListener('click', () => {
      lockVault();
      dialog.close();
      renderList();
      updateStatus(STATUS.LOCKED);
    });
    wrapper.querySelector('[data-action="import"]').addEventListener('click', doImport);
    wrapper.querySelector('[data-action="export"]').addEventListener('click', doExport);
    wrapper.querySelector('[data-action="change-pin"]').addEventListener('click', doChangePin);
    wrapper.querySelector('[data-action="reset"]').addEventListener('click', doReset);
    importFileEl.addEventListener('change', () => {
      if (importFileEl.files && importFileEl.files[0]) {
        importTextEl.value = '';
      }
    });

    dialog.addEventListener('close', () => {
      memory.panelOpen = false;
    });

    memory.panel = {
      dialog,
      host,
      shadow,
      showSelection({ records, onUseVault, onUseSystem, onCancel }) {
        const selectionHost = document.createElement('div');
        selectionHost.style.position = 'absolute';
        selectionHost.style.left = '-9999px';
        const selectionDialog = document.createElement('dialog');
        selectionDialog.className = 'vault-selection-dialog';
        selectionDialog.innerHTML = `
          <form method="dialog">
            <h3 style="margin:0 0 10px; font:700 18px Arial, Helvetica, sans-serif;">Choose a passkey</h3>
            <div style="margin:0 0 10px; color:#a9b2c3; font:13px Arial, Helvetica, sans-serif;">Select a stored credential or use the system authenticator.</div>
            <div data-role="selection-list" style="display:grid; gap:8px; max-height:45vh; overflow:auto; margin-bottom:12px;"></div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
              <button value="cancel" type="button" data-action="system" style="padding:9px 14px; border-radius:999px; border:0; background:rgba(255,255,255,0.08); color:#fff;">Use system credential</button>
              <button value="cancel" type="button" data-action="cancel" style="padding:9px 14px; border-radius:999px; border:0; background:#2b7cff; color:#fff;">Cancel</button>
            </div>
          </form>
        `;
        selectionHost.appendChild(selectionDialog);
        shadow.appendChild(selectionHost);
        const list = selectionDialog.querySelector('[data-role="selection-list"]');

        const closeAndCleanup = () => {
          selectionDialog.close();
          selectionHost.remove();
        };

        for (const record of records) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'text-align:left; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:#e7eaf0; cursor:pointer;';
          btn.innerHTML = `
            <div style="font-weight:700; margin-bottom:4px;">${escapeText(record.user?.displayName || record.user?.name || 'Unnamed user')} · ${escapeText(record.rpId)}</div>
            <div style="font-size:12px; color:#a9b2c3; word-break:break-all;">${escapeText(record.credentialId)}</div>
          `;
          btn.addEventListener('click', () => {
            closeAndCleanup();
            onUseVault(record);
          });
          list.appendChild(btn);
        }

        selectionDialog.querySelector('[data-action="system"]').addEventListener('click', () => {
          closeAndCleanup();
          onUseSystem();
        });
        selectionDialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
          closeAndCleanup();
          onCancel();
        });

        selectionDialog.addEventListener('cancel', (event) => {
          event.preventDefault();
          closeAndCleanup();
          onCancel();
        });

        selectionDialog.showModal();
      },
      render() {
        renderList();
        if (!dialog.open) dialog.showModal();
        memory.panelOpen = true;
      },
    };

    return memory.panel;
  }

  async function openManagementPanel() {
    try {
      const unlocked = await ensureUnlocked('manage stored passkeys');
      if (!unlocked) return;
      const panel = await ensurePanel();
      panel.render();
    } catch (error) {
      console.error('Failed to open WebAuthn vault panel.', error);
      showMessage('Unable to open the vault panel.', 'error');
    }
  }

  function registerMenu() {
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Manage Passkeys', () => {
        openManagementPanel();
      });
    }
  }

  async function setupRoot() {
    if (!document.body) {
      await new Promise((resolve) => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        } else {
          resolve();
        }
      });
    }
    addCSS('dialog::backdrop { background: rgba(0, 0, 0, 0.5); }', shadow);
    document.body.appendChild(host);
  }

  async function main() {
    registerMenu();
    patchCredentials();
    await setupRoot();
  }

  main().catch((error) => {
    console.error('WebAuthn virtual authenticator initialization failed.', error);
  });
})();
