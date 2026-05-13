import { hasDOM, isAdoptedStyleSheetsSupported } from './util.js';

export { hasDOM, isAdoptedStyleSheetsSupported };

function ensureDOM(target) {
    if (!target && !hasDOM()) {
        throw new Error('No DOM detected');
    }
}

function normalizeTarget(target) {
    ensureDOM(target);
    return target || document;
}

function appendStyleToTarget(target, style) {
    if (typeof Document !== 'undefined' && target instanceof Document) {
        (target.head || target.documentElement || target).append(style);
        return;
    }

    target.append(style);
}

function supportsAdoptedStyleSheetsTarget(target) {
    return (
        !!target &&
        'adoptedStyleSheets' in target &&
        typeof CSSStyleSheet !== 'undefined' &&
        typeof CSSStyleSheet.prototype.replaceSync === 'function'
    );
}

export class CSSSheet {
    constructor(css_code) {
        this._cssText = String(css_code || '');
        this._sheet = null;
        this._style_elem_list = new WeakMap();
    }

    _ensureSheet(target = null) {
        if (this._sheet) {
            return this._sheet;
        }

        const canUseConstructable =
            supportsAdoptedStyleSheetsTarget(target) ||
            (hasDOM() && supportsAdoptedStyleSheetsTarget(document));

        if (canUseConstructable) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(this._cssText);
            this._sheet = sheet;
            return sheet;
        }

        if (!hasDOM()) {
            throw new Error('No DOM detected');
        }

        const style = document.createElement('style');
        style.textContent = this._cssText;
        this._sheet = style;
        return style;
    }

    attach(target = null) {
        const realTarget = normalizeTarget(target);
        const sheet = this._ensureSheet(realTarget);

        if (typeof CSSStyleSheet !== 'undefined' && sheet instanceof CSSStyleSheet) {
            if (!realTarget.adoptedStyleSheets.includes(sheet)) {
                realTarget.adoptedStyleSheets = [...realTarget.adoptedStyleSheets, sheet];
            }
            return realTarget;
        }

        let style = this._style_elem_list.get(realTarget);

        if (!style) {
            style = sheet.cloneNode(true);
            this._style_elem_list.set(realTarget, style);
            appendStyleToTarget(realTarget, style);
        } else if (!style.isConnected) {
            appendStyleToTarget(realTarget, style);
        }

        return realTarget;
    }

    detach(target) {
        if (typeof CSSStyleSheet !== 'undefined' && this._sheet instanceof CSSStyleSheet) {
            if (!target || !('adoptedStyleSheets' in target)) {
                return false;
            }

            const current = target.adoptedStyleSheets;
            if (!current.includes(this._sheet)) {
                return false;
            }

            target.adoptedStyleSheets = current.filter((s) => s !== this._sheet);
            return true;
        }

        const style = this._style_elem_list.get(target);
        if (!style) {
            return false;
        }

        style.remove();
        this._style_elem_list.delete(target);
        return true;
    }

    get() {
        return this._ensureSheet();
    }
}

export function createCSS(css_code) {
    return new CSSSheet(css_code);
}

export function addCSS(css_code, target = null) {
    const css = createCSS(css_code);
    css.attach(target);
    return css;
}

export function removeCSS(stylesheet, target = null) {
    if (stylesheet instanceof CSSSheet) {
        return stylesheet.detach(normalizeTarget(target));
    }

    if (typeof HTMLStyleElement !== 'undefined' && stylesheet instanceof HTMLStyleElement) {
        stylesheet.remove();
        return !stylesheet.isConnected;
    }

    if (typeof CSSStyleSheet !== 'undefined' && stylesheet instanceof CSSStyleSheet) {
        const realTarget = normalizeTarget(target);
        if (!('adoptedStyleSheets' in realTarget)) {
            return false;
        }

        const current = realTarget.adoptedStyleSheets;
        if (!current.includes(stylesheet)) {
            return false;
        }

        realTarget.adoptedStyleSheets = current.filter((s) => s !== stylesheet);
        return true;
    }

    return false;
}

export { addCSS as default };
