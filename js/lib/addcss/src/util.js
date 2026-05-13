export function hasDOM() {
    return typeof document !== 'undefined';
}

export function isAdoptedStyleSheetsSupported() {
    return (
        typeof CSSStyleSheet !== 'undefined' &&
        typeof CSSStyleSheet.prototype.replaceSync === 'function' &&
        typeof Document !== 'undefined' &&
        typeof ShadowRoot !== 'undefined' &&
        'adoptedStyleSheets' in Document.prototype &&
        'adoptedStyleSheets' in ShadowRoot.prototype
    );
}
