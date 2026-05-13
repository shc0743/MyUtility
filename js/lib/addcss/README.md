# add-css-constructed

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org/)

Add CSS to a document or a shadow root using a lightweight `CSSSheet` wrapper with constructable stylesheet fallback.

## Features

- Uses `adoptedStyleSheets` when supported
- Falls back to cloned `<style>` elements when needed
- Works with `Document` and `ShadowRoot`
- Zero dependencies
- TypeScript support included
- No `detachAll()` API; detach each target explicitly

## Installation

```bash
npm i add-css-constructed
````

## Usage

### ES Module

```js
import { createCSS, addCSS, removeCSS } from 'add-css-constructed';

const css = createCSS(`
  body {
    color: red;
  }
`);

css.attach();
css.detach(document);
```

### CommonJS

```js
const addCSS = require('add-css-constructed');

const css = addCSS(`
  .container {
    margin: 0 auto;
  }
`);

css.attach();
```

### Browser (UMD)

```html
<script src="https://unpkg.com/add-css-constructed"></script>
<script>
  const css = addCSS('body { font-family: sans-serif; }');
  css.attach();
</script>
```

## API

### `createCSS(css_code)`

Creates a `CSSSheet` wrapper.

### `CSSSheet`

A lightweight wrapper around `CSSStyleSheet` and `<style>` fallback storage.

#### `attach(target?)`

Attaches the stylesheet to a `Document` or `ShadowRoot`.

Returns the actual target that received the stylesheet.

#### `detach(target)`

Detaches the stylesheet from the given target.

Returns `true` when the stylesheet was removed.

#### `get()`

Returns the underlying storage object:

* `CSSStyleSheet` when constructable stylesheets are supported
* `HTMLStyleElement` when falling back

### `addCSS(css_code, target?)`

Thin compatibility wrapper:

```js
createCSS(css_code).attach(target)
```

Returns the created `CSSSheet`.

### `removeCSS(stylesheet, target?)`

Thin compatibility wrapper for removing either:

* a `CSSSheet`
* a `CSSStyleSheet`
* an `HTMLStyleElement`

## Behavior

When constructable stylesheets are available, one `CSSStyleSheet` instance is reused across targets.

When constructable stylesheets are not available, the wrapper stores a template `<style>` element internally and clones it for each attached target. The per-target fallback nodes are tracked with a `WeakMap`, so they do not keep targets alive.

## Browser Support

* Modern browsers with `adoptedStyleSheets` support
* Traditional `<style>` fallback in browsers without constructable stylesheets

## Migration Notes

* `addCSS()` now returns a `CSSSheet` wrapper instead of the raw stylesheet node
* Use `css.attach(target)` to attach
* Use `css.detach(target)` or `removeCSS(css, target)` to remove
* There is no `detachAll()` in this major version

## License

Unlicense - Free for any use
