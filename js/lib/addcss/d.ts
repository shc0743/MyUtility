/**
 * Check if DOM environment is available.
 */
export declare function hasDOM(): boolean;

/**
 * Check if constructable/adopted stylesheets are supported.
 */
export declare function isAdoptedStyleSheetsSupported(): boolean;

export type CSSStorage = CSSStyleSheet | HTMLStyleElement;

/**
 * Lightweight wrapper around CSSStyleSheet / <style> fallback.
 */
export declare class CSSSheet {
    _cssText: string;
    _sheet: CSSStorage | null;
    _style_elem_list: WeakMap<Document | ShadowRoot, HTMLStyleElement>;

    constructor(css_code: string);

    attach(target?: Document | ShadowRoot | null): Document | ShadowRoot;
    detach(target: Document | ShadowRoot): boolean;
    get(): CSSStorage;
}

/**
 * Create a CSSSheet wrapper.
 */
export declare function createCSS(css_code: string): CSSSheet;

/**
 * Add CSS styles to document or shadow root.
 * Returns the created CSSSheet wrapper.
 */
export declare function addCSS(
    css_code: string,
    target?: Document | ShadowRoot | null
): CSSSheet;

/**
 * Remove CSS from a target.
 */
export declare function removeCSS(
    stylesheet: CSSSheet | CSSStyleSheet | HTMLStyleElement,
    target?: Document | ShadowRoot | null
): boolean;

export { addCSS as default };
