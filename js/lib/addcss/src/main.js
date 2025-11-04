import { hasDOM, isAdoptedStyleSheetsSupported } from './util.js';
export { hasDOM, isAdoptedStyleSheetsSupported };

function ensureDOM(target) {
    if (!target && !hasDOM()) throw new Error('No DOM detected');
}

export function addCSS(css_code, target = null) {
    ensureDOM(target);
    if (isAdoptedStyleSheetsSupported()) {
        const stylesheet = new CSSStyleSheet;
        stylesheet.replace(css_code);
        if (!target) target = document;
        target.adoptedStyleSheets.push(stylesheet);
        Reflect.set(stylesheet, 'remove', removeCSS.bind(null, stylesheet, target));
        return stylesheet;
    } else {
        const style_node = document.createElement('style');
        if (style_node.styleSheet) style_node.styleSheet.cssText = css_code;
        else style_node.append(document.createTextNode(css_code));
        (target || document.head || document.documentElement).append(style_node);
        return style_node;
    }
}
export function removeCSS(stylesheet, target = null) {
    ensureDOM(target);
    if (!target) target = document;
    if (typeof stylesheet.remove === 'function') {
        stylesheet.remove()
        return (!stylesheet.isConnected)
    }
    if (stylesheet instanceof CSSStyleSheet) {
        const index = target.adoptedStyleSheets.indexOf(stylesheet)
        if (index > -1) {
            target.adoptedStyleSheets.splice(index, 1)
            return true
        }
        return false
    }
    return false
}

export { addCSS as default }
