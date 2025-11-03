# add-css-constructed

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org/)

add a CSS to document or specified target using constructed stylesheet

## Features

- Supports modern `adoptedStyleSheets` API
- Works in both document and shadow DOM
- Zero dependencies
- TypeScript support included
- Universal compatibility (fallback to traditional style elements)

## Installation

```bash
npm i add-css-constructed
```

## Usage

### ES Module
```javascript
import { addCSS } from 'add-css-constructed';

// Add CSS to document
const style = addCSS('body { color: red; }');

// Add CSS to shadow root
const shadowRoot = element.attachShadow({ mode: 'open' });
addCSS('div { padding: 10px; }', shadowRoot);
```

### CommonJS
```javascript
const addCSS = require('add-css-constructed');

addCSS('.container { margin: 0 auto; }');
```

### Browser (UMD)
```html
<script src="https://unpkg.com/add-css-constructed"></script>
<script>
  addCSS('body { font-family: sans-serif; }');
</script>
```

## API

### `addCSS(css_code, target?)`
Adds CSS styles to the specified target.

**Parameters:**
- `css_code` (string): CSS code to inject
- `target` (Document|ShadowRoot|null): Target element, defaults to document

**Returns:**
- `CSSStyleSheet|HTMLStyleElement`: The created stylesheet or style element

**Throws:**
- `Error`: When no DOM is detected and no target provided

### `hasDOM()`
Checks if DOM environment is available.

**Returns:**
- `boolean`: True if DOM is available

### `isAdoptedStyleSheetsSupported()`
Checks if adoptedStyleSheets API is supported.

**Returns:**
- `boolean`: True if adoptedStyleSheets is supported

## Browser Support

- Modern browsers with `adoptedStyleSheets` support
- All browsers with traditional `<style>` element fallback

## License

Unlicense - Free for any use.
