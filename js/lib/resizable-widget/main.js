import { addCSS, BindMove, BindMove_css } from 'bindmove';
import { ZIndexManagerClass } from 'dom-zindex-manager';



export let ResizableWidgetCSS1 = `
$$TAG$:not(:has([slot="widget-caption"])) {
    --no-caption: none;
}
`, ResizableWidgetCSS2 = `
:host {
    position: absolute;
    z-index: 1002;
    -webkit-app-region: no-drag; app-region: no-drag;
    background: transparent;
    padding: 10px;
    touch-action: none;
    box-sizing: border-box;
}
:host(:not([open])) { display: none; }
:host(:focus-visible), :host(:focus) {
    outline: none;
    --focus-visible: "[+]";
}
resizable-widget-content-container-5e5921c2 {
    display: flex;
    flex-direction: column;
    background-color: var(--background, #FFFFFF);
    outline: var(--focus-visible, none);
    box-shadow: 0 0 10px 0 #ccc;
    white-space: nowrap;
    cursor: auto;
    box-sizing: border-box;
    width: 100%; height: 100%;
    overflow: hidden;
    touch-action: revert;
    border-radius: 5px;
}
#caption {
    user-select: none;
    padding: 5px;
    border-bottom: 1px solid var(--border-color, currentColor);
    display: var(--no-caption, revert);
}
#container {
    padding: var(--padding, 10px);
    flex: 1;
    overflow: auto;
}
`;



export const zIndexManager = new ZIndexManagerClass();


export class HTMLResizableWidgetElement extends HTMLElement {
    #shadowRoot = null;
    #caption = null;
    #content = null;

    get [Symbol.toStringTag]() {
        return 'HTMLResizableWidgetElement';
    }

    constructor() {
        super();

        this.#shadowRoot = this.attachShadow({ mode: 'open' });
        addCSS(ResizableWidgetCSS2, this.#shadowRoot, true);

        if (this.#shadowRoot.adoptedStyleSheets) {
            this.#shadowRoot.adoptedStyleSheets.push(BindMove_css);
        } else {
            this.#shadowRoot.append(BindMove_css);
        }

        this.#content = document.createElement('resizable-widget-content-container-5e5921c2');
        this.#shadowRoot.append(this.#content);

        this.#caption = document.createElement('div');
        this.#caption.id = 'caption';
        this.#caption.innerHTML = `<slot name="widget-caption"></slot>`;
        this.#content.append(this.#caption);

        const contentContainer = document.createElement('div');
        contentContainer.id = 'container';
        this.#content.append(contentContainer);
        contentContainer.append(document.createElement('slot'));

        queueMicrotask(() => BindMove(this.#caption, this, { container: this.offsetParent }));

        this.#content.addEventListener('pointermove', ev => {
            ev.stopPropagation();
        });
        this.addEventListener('contextmenu', ev => {
            if (ev.composedPath()[0] === this) ev.preventDefault();
        });
        this.addEventListener('keydown', this.#onkeydown.bind(this));
        this.addEventListener('pointermove', this.#onpointermove.bind(this));
        this.addEventListener('pointerdown', this.#onpointerdown.bind(this));
        const uoc = this.#onPointerUpOrCancel.bind(this);
        this.addEventListener('pointerup', uoc);
        this.addEventListener('pointercancel', uoc);
    }

    connectedCallback() {
        this.tabIndex = 0;
        this.#processZIndexManagement();
    }

    disconnectedCallback() {
        if (!this.zIndexManagementProhibited) zIndexManager.deactivate(this);
        zIndexManager.remove(this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'z-index-management-prohibited') {
            this.#processZIndexManagement(oldValue == null);
        }
    }

    static get observedAttributes() {
        return ['z-index-management-prohibited'];
    }

    get open() { return this.getAttribute('open') != null; }
    set open(val) {
        !!val ? (this.setAttribute('open', ''), this.focus()) : this.removeAttribute('open');
        if (!this.zIndexManagementProhibited) zIndexManager.activate(this);
        return true;
    }
    get zIndexManagementProhibited() { return this.getAttribute('z-index-management-prohibited') != null; }
    set zIndexManagementProhibited(val) {
        !!val ? (this.setAttribute('z-index-management-prohibited', '')) : this.removeAttribute('z-index-management-prohibited');
        return true;
    }

    #processZIndexManagement(previousManaged = null) {
        if (!this.zIndexManagementProhibited && this.isConnected) {
            zIndexManager.add(this);
        } else {
            zIndexManager.remove(this);
            if (previousManaged) this.style.zIndex = '';
        }
        zIndexManager.update();
    }

    static get MIN_SIZE() { return 50; }
    static get SIZING_ATTRS() { return ['left', 'top', 'width', 'height']; }

    #noOverBorder(n, type, tid = 1, ol = false) {
        if (n < 1) return 0;
        if (ol) return n;
        const computed = getComputedStyle(this);
        const op = (this.offsetParent === document.body) ? document.documentElement : this.offsetParent;
        const val = tid * (type === 'x' ? parseInt(computed.left) : (type === 'y' ? parseInt(computed.top) : 0));
        if (type === 'x') if (op.clientWidth > 0 && n + val > op.clientWidth) return op.clientWidth - val;
        if (type === 'y') if (op.clientHeight > 0 && n + val > op.clientHeight) return op.clientHeight - val;
        return n;
    }

    close() {
        this.open = false;
    }

    activate() {
        if (this.zIndexManagementProhibited) throw new TypeError('zIndexManagement is prohibited');
        zIndexManager.activate(this);
    }

    #isSizing = false;
    #sizingType = { a: 0, b: 0 };
    #sizingStart = null;
    #sizingPointerId = -1;
    #onpointermove(ev) {
        if (!ev.isPrimary) return;
        if (this.#isSizing) {
            const chk = () => {
                if (parseInt(this.style.width) < HTMLResizableWidgetElement.MIN_SIZE)
                    this.style.width = HTMLResizableWidgetElement.MIN_SIZE + 'px';
                if (parseInt(this.style.height) < HTMLResizableWidgetElement.MIN_SIZE)
                    this.style.height = HTMLResizableWidgetElement.MIN_SIZE + 'px';
            };
            if (this.#sizingType.a) do {
                let valOffset = ((ev.x - this.#sizingStart.x));
                if (this.#sizingType.a < 0) {
                    let oldX = this.#sizingStart.x,
                        evx = this.#noOverBorder(ev.x, 'x', 0, true) - this.#sizingStart.offsetX;
                    evx = Math.min(Math.max(evx, 0), this.#sizingStart.left + this.#sizingStart.width - HTMLResizableWidgetElement.MIN_SIZE);
                    this.style.left = evx + 'px';
                    let changedX = (oldX - evx);
                    let newWidth = (this.#sizingStart.width + changedX - this.#sizingStart.offsetX);
                    this.style.width = newWidth + 'px';
                } else {
                    this.style.width = this.#noOverBorder(this.#sizingStart.width + valOffset, 'x') + 'px';
                }
            } while (0);
            if (this.#sizingType.b) do {
                let valOffset = ((ev.y - this.#sizingStart.y));
                if (this.#sizingType.b < 0) {
                    let oldY = this.#sizingStart.y,
                        evy = this.#noOverBorder(ev.y, 'y', 0, true) - this.#sizingStart.offsetY;
                    evy = Math.min(Math.max(evy, 0), this.#sizingStart.top + this.#sizingStart.height - HTMLResizableWidgetElement.MIN_SIZE);
                    this.style.top = evy + 'px';
                    let changedY = (oldY - evy);
                    let newHeight = (this.#sizingStart.height + changedY - this.#sizingStart.offsetY);
                    this.style.height = newHeight + 'px';
                } else {
                    this.style.height = this.#noOverBorder(this.#sizingStart.height + valOffset, 'y') + 'px';
                }
            } while (0);
            chk();
            return;
        }
        const left = ev.offsetX, top = ev.offsetY,
            right = this.clientWidth - left,
            bottom = this.clientHeight - top;
        let cursor = '';
        if (bottom <= 10) cursor += 's';
        if (top <= 10) cursor += 'n';
        if (right <= 10) cursor += 'e';
        if (left <= 10) cursor += 'w';
        cursor += '-resize';
        this.style.cursor = cursor;
    }
    #onpointerdown(ev) {
        // process z-index change
        if (!this.zIndexManagementProhibited) {
            zIndexManager.activate(this);
        }

        // process resizes
        if (!ev.isPrimary) return;
        if (ev.composedPath()[0] !== this) return;
        this.setPointerCapture((this.#sizingPointerId = ev.pointerId));
        this.#isSizing = true;
        const left = ev.offsetX, top = ev.offsetY,
            right = this.clientWidth - left,
            bottom = this.clientHeight - top;
        if (bottom <= 10) this.#sizingType.b = 1;
        if (top <= 10) this.#sizingType.b = -1;
        if (right <= 10) this.#sizingType.a = 1;
        if (left <= 10) this.#sizingType.a = -1;
        this.#sizingStart = {
            x: ev.x, y: ev.y,
            offsetX: ev.offsetX, offsetY: ev.offsetY,
            left: this.offsetLeft, top: this.offsetTop,
            width: this.clientWidth, height: this.clientHeight,
        };
    }
    #onPointerUpOrCancel(ev) {
        this.#isSizing = false;
        [this.#sizingType.a, this.#sizingType.b] = [0, 0];
        this.#sizingPointerId = -1;
    }
    #onkeydown(ev) {
        if (ev.composedPath()[0] !== this) return;

        if (ev.key === 'Escape' && this.#isSizing) {
            this.releasePointerCapture(this.#sizingPointerId);
            this.#isSizing = false;
            for (const i of HTMLResizableWidgetElement.SIZING_ATTRS) {
                this.style[i] = this.#sizingStart[i] + 'px';
            }
            return false;
        }
    }

};

let registeredResizableWidget = false;
function myregisterResizableWidget(tagName = 'resizable-widget', force = false) {
    if (registeredResizableWidget && !force) return;
    registeredResizableWidget = true;
    addCSS(ResizableWidgetCSS1.replaceAll('$$TAG$', tagName));
    return customElements.define(tagName, HTMLResizableWidgetElement);
}
const definition = myregisterResizableWidget();

function _deprecation_warning(lib, func, type, reference) {
    // @ts-ignore
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return;
    globalThis.console.warn('%c[npm::' + lib + '] %c[' + func + '] %cDEPRECATED!! %cDeprecated and will be removed in the next MAJOR version. See %c' + reference + '%c for more information.\n' +
        '%cNote: %cThis %cdoes not%c indicate the package is deprecated. Instead, it indicates that your code uses the %cdeprecated%c ' + type + ' %c' + func + '%c. Fix your code to suppress this warning.',
        'color: #007700', 'color: #570263', 'color: red; font-weight: bold;', '', 'font-weight: bold;', '', 'font-weight: bold; color: #0000ff', '',
        'color: red; font-weight: bold;', '', 'font-style: italic', '', 'color: #570263', '');    
}

export const registerResizableWidget = function () {
    _deprecation_warning('resizable-widget', 'registerResizableWidget', 'function', 'node_modules/resizable-widget/README.md');
    if (arguments[0] === 'resizable-widget') return definition;
    return myregisterResizableWidget.apply(this, arguments);
}


