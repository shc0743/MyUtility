import { hasDOM, isAdoptedStyleSheetsSupported } from './util.js';
export { hasDOM, isAdoptedStyleSheetsSupported };
export function addCSS(css_code, target = null) {
    if (!target && !hasDOM()) throw new Error('No DOM detected');
    if (isAdoptedStyleSheetsSupported()) {
        const stylesheet = new CSSStyleSheet;
        stylesheet.replace(css_code);
        (target || document).adoptedStyleSheets.push(stylesheet);
        return stylesheet;
    } else {
        const style_node = document.createElement('style');
        if (style_node.styleSheet) style_node.styleSheet.cssText = css_code;
        else style_node.append(document.createTextNode(css_code));
        style_node.innerHTML = css_code;
        (target || document.head || document.documentElement).append(style_node);
        return style_node;
    }
}

export { addCSS as default }
