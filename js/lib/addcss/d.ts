/**
 * Check if DOM environment is available
 * @returns {boolean} True if DOM is available
 */
export declare function hasDOM(): boolean;

/**
 * Check if adoptedStyleSheets API is supported
 * @returns {boolean} True if adoptedStyleSheets is supported
 */
export declare function isAdoptedStyleSheetsSupported(): boolean;

export interface RemovableCSSStyleSheet extends CSSStyleSheet {
    remove(): boolean;
}

/**
 * Add CSS styles to document or shadow root
 * @param {string} css_code - CSS code string
 * @param {Document|ShadowRoot|null} [target] - Target element (document or shadow root), defaults to document
 * @returns {CSSStyleSheet|HTMLStyleElement} The added stylesheet or style element
 * @throws {Error} When no DOM is detected and no target provided
 */
export declare function addCSS(css_code: string, target?: Document | ShadowRoot | null): RemovableCSSStyleSheet | HTMLStyleElement;

/*
Removes a CSS style sheet fron document or specified target
*/
export declare function removeCSS(
    stylesheet: CSSStyleSheet | HTMLStyleElement, 
    target?: Document | ShadowRoot | null
): boolean;

export { addCSS as default }

