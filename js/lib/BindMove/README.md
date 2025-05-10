# BindMove.js

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org/)

A lightweight JavaScript library for making HTML elements draggable using the Pointer API.

## Key Features

- Simple API for making elements draggable
- Supports both absolute and fixed positioning
- Works within container elements
- Clean event handling with proper cleanup
- Small footprint with no external dependencies

## Installation

```bash
npm install bindmove
```

## Usage

### Basic Usage
```javascript
import { BindMove } from 'bindmove';

// Make an element draggable
BindMove(element)

// Move another element only when dragging this one
BindMove(dragHandleElement, targetElement);

// Clean up when done
UnBindMove(element);
UnBindMove(dragHandleElement); // targetElement is *not* needed here
```

### Note: Configuration Options

#### `isTranslatedToCenter`
**Critical Note**: This parameter must be set to `true` ONLY when moving elements that use CSS transform for centering:
```css
/* Elements with this centering technique need isTranslatedToCenter: true */
.centered-element {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
```

Usage:
```javascript
BindMove(handle, target, { isTranslatedToCenter: true });
```

For normal elements without transform-based centering, omit this parameter or set it to `false`.

#### Shadow DOM Support
When using in Shadow DOM, you must manually add the required styles:

```javascript
import { BindMove, BindMove_css } from 'bindmove';

// Add to Shadow DOM
if (shadowRoot.adoptedStyleSheets) {
    shadowRoot.adoptedStyleSheets.push(BindMove_css);
} else {
    shadowRoot.appendChild(BindMove_css);
}

// Then bind as normal
BindMove(shadowHandle, shadowTarget);
```

### Complete API Example
```javascript
import { BindMove, UnBindMove } from 'bindmove';

// Complex example with all options
BindMove(handleElement, targetElement, {
    container: document.getElementById('boundary'), // Movement boundary
    isTranslatedToCenter: false, // Set true for transform-centered elements
    isFixed: true // Use fixed positioning
});

// Clean up later
UnBindMove(handleElement);
```

## Shadow DOM Implementation Notes

The library provides `BindMove_css` which can be either:
- A `CSSStyleSheet` object (modern browsers)
- An HTML `style` element (legacy browsers)

Always check for `adoptedStyleSheets` support before adding styles to shadow roots.

## Examples

See complete examples in the [test file](BindMove-test.html)

## Browser Support

Requires browsers with Pointer Events API support.

## License

Unlicense - Free for any use.
