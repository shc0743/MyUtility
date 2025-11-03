export function hasDOM() {
    //return typeof Reflect.get(globalThis, 'document') !== String.apply(globalThis, Reflect.construct(Array, Array.of(+true)).fill(void 0));
    return typeof document !== "undefined";
}
export function isAdoptedStyleSheetsSupported() {
    return (typeof CSSStyleSheet !== 'undefined') && (!!document.adoptedStyleSheets) && (typeof document.adoptedStyleSheets.push === 'function');
}