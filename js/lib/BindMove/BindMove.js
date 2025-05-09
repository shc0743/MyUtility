export const VERSION = BigInt('20250419224610');

const PID = 'fdf3404207ac433293f97c1dd3ca103a';
export { PID as ProductId };


    

function nop(ev) { ev.preventDefault(); return false };

    
    
let wDocWidth = 0, wDocHeight = 0;
function noOverBorder(el, target, x, y, opt, containerOffset) {
    const { container, isTranslatedToCenter } = opt;
    x -= containerOffset.left;
    y -= containerOffset.top;
    if (x < 0) x = 0; if (y < 0) y = 0;
    if (x + el.$__BM_width > wDocWidth) x = wDocWidth - el.$__BM_width;
    if (y + el.$__BM_height > wDocHeight) y = wDocHeight - el.$__BM_height;
    if (isTranslatedToCenter) {
        x += el.$__BM_width / 2;
        y += el.$__BM_height / 2;
    }
    target.style.left = x + 'px';
    target.style.top = y + 'px';

    // document only
    if (container === document.documentElement) {
        const rc = target.getBoundingClientRect();

        const sx/*scrollX*/ = (rc.right > container.clientWidth ? 10 : (rc.left < 0 ? -10 : 0));
        const sy/*scrollY*/ = (rc.bottom > container.clientHeight ? 10 : (rc.top < 0 ? -10 : 0));
        if (sx || sy) window.scrollBy(sx, sy);
    }
}
function getOffsetToDoc(el, prop) {
    // example : getOffsetToBody(<HTMLElement>, 'offsetTop')
    let val = 0, op = el;
    do {
        val += op[prop];
        op = op.offsetParent;
    }
    while (op && op !== document.body && op !== document.documentElement);
    return val;
}
    

function BindMove(el, target = el, options = {
    container: null,
    isTranslatedToCenter: false,
    isFixed: false,
}) {
    if (!el) throw new TypeError('Invalid paramters', arguments);

    if (!options.container) options.container = document.documentElement;

    const containerOffset = { left: 0, top: 0 };

    el.classList.add(PID + '-el');
    target.classList.add(PID + '-target');
    el.$__BM_target = target;
    function DragStartHandler() {
        return false;
    }
    function PointerMoveHandler(ev) {
        if (ev.pointerId !== el.$__BM_pointerId) return;
        noOverBorder(el, target,
            (options.isFixed ? ev.x : ev.pageX) - el.$__BM_targetX,
            (options.isFixed ? ev.y : ev.pageY) - el.$__BM_targetY,
            options, containerOffset
        );
    }
    function PointerUpOrCancelHandler() {
        el.classList.remove('moving');
        target.classList.remove('moving');

        delete el.$__BM_offsetX;
        delete el.$__BM_offsetY;
        delete el.$__BM_pointerId;
        
        el.removeEventListener('dragstart', DragStartHandler);
        el.removeEventListener('pointermove', PointerMoveHandler);
        el.removeEventListener('pointerup', PointerUpOrCancelHandler);
        el.removeEventListener('pointercancel', PointerUpOrCancelHandler);
    }
    el.$__PointerDownHandler = function (ev) {
        if (ev.target.getAttribute('data-exclude-bindmove') != null) return;

        el.$__BM_offsetX = ev.x;
        el.$__BM_offsetY = ev.y;
        {
            const rect = target.getBoundingClientRect();
            el.$__BM_targetX = el.$__BM_offsetX - rect.x;
            el.$__BM_targetY = el.$__BM_offsetY - rect.y;
            el.$__BM_width = Math.ceil(rect.width);
            el.$__BM_height = Math.ceil(rect.height);
        }
        containerOffset.left = getOffsetToDoc(options.container, 'offsetLeft');
        containerOffset.top = getOffsetToDoc(options.container, 'offsetTop');
        wDocWidth = options.isFixed ? options.container.clientWidth : options.container.scrollWidth;
        wDocHeight = options.isFixed ? options.container.clientHeight : options.container.scrollHeight;

        el.classList.add('moving');
        target.classList.add('moving');

        el.$__BM_pointerId = ev.pointerId;
        el.setPointerCapture(ev.pointerId);

        target.style.right = target.style.bottom = '';

        el.addEventListener('pointermove', PointerMoveHandler);
        el.addEventListener('pointerup', PointerUpOrCancelHandler);
        el.addEventListener('pointercancel', PointerUpOrCancelHandler);
    }

    el.addEventListener('pointerdown', el.$__PointerDownHandler);
    el.addEventListener('dragstart', nop);
    el.addEventListener('contextmenu', nop);
}


function UnBindMove(el) {
    el.classList.remove(PID + '-el');
    el.$__BM_target.classList.remove(PID + '-target');

    el.removeEventListener('pointerdown', el.$__PointerDownHandler);
    el.removeEventListener('dragstart', nop);
    el.removeEventListener('contextmenu', nop);

    delete el.$__PointerDownHandler;
    delete el.$__ContextMenuHandler;
    delete el.$__BM_target;
}




export const BindMove_css = addCSS(`
.${PID}-el { user-select: none; touch-action: none; }
.${PID}-el.moving { cursor: move;}
.${PID}-target { white-space: nowrap; }
.${PID}-target.moving { transition: none; }
`);


function addCSS(css, el = null, adopt = false) {
    if ((el === null || adopt) && ('adoptedStyleSheets' in document)) {
        const style = new CSSStyleSheet;
        style.replace(css);
        (el || document).adoptedStyleSheets.push(style);
        return style;
    } else {
        let EL = document.createElement('style');
        EL.innerHTML = css;
        (el || document.head || document.documentElement).append(EL);
        return EL;
    }
}



export { addCSS as addCSS };
    
export {
    BindMove as BindMove,
    UnBindMove as UnBindMove,
};

export { nop };


