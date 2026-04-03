# lite-image-preview

A lightweight, dependency-free image preview dialog for the web.

It supports smooth pan and zoom for raster images and crisp SVG zooming with `viewBox`, while keeping the API small and easy to use. Touch gestures are handled separately from pointer gestures to improve mobile compatibility.

---

## Features

* Dependency-free runtime
* Smooth pan and zoom for images
* Crisp SVG preview using `viewBox`-based scaling
* Mobile-friendly touch handling
* Pointer support for mouse, pen, and non-touch input
* Built-in modal preview dialog
* Reset-to-fit action in the toolbar
* Small public API, with advanced customization hooks

---

## Installation

```bash
pnpm i lite-image-preview
```

or

```bash
npm i lite-image-preview
```

---

## Quick start

### Preview an image from a URL

```ts
import { previewImage } from 'lite-image-preview'

const close = await previewImage('/assets/photo.jpg')

// Close the dialog later
close?.()
```

### Preview an existing SVG element

```ts
import { previewSvg } from 'lite-image-preview'

const svg = document.querySelector('svg')
if (svg) {
  const close = await previewSvg(svg)
  // close?.()
}
```

---

## Basic usage

`previewImage()` and `previewSvg()` both open a modal preview dialog.

The returned promise resolves to a close handle once the preview is ready.

```ts
import { previewImage } from 'lite-image-preview'

const close = await previewImage('https://example.com/image.png')

if (close) {
  // You can close programmatically later.
  close()
}
```

If the image fails to load, `previewImage()` throws an error.

---

## API overview

### `previewImage(url, dispose?, options?)`

Opens a preview dialog for a raster image.

* `url` — Image URL.
* `dispose?` — Optional callback invoked after the dialog fully closes.
* `options?` — Optional preview configuration (see `ImagePreviewOptions`).

Returns:

* `Promise<PreviewCloseHandle>`

### `previewSvg(svg, dispose?)`

Opens a preview dialog for an existing SVG element.

* `svg` — The SVG element to preview.
* `dispose?` — Optional callback invoked after the dialog fully closes.

Returns:

* `Promise<PreviewCloseHandle>`

### `createPreview(content, initAdapter, dispose?)`

Advanced API for custom preview content.

* `content` — The DOM element to mount into the preview stage.
* `initAdapter` — Adapter factory used to implement zoom, pan, reset, and cleanup behavior.
* `dispose?` — Optional callback invoked after the dialog fully closes.

Returns:

* `PreviewCloseHandle`

---

## Example: basic image preview

```ts
import { previewImage } from 'lite-image-preview'

async function openPhoto() {
  const close = await previewImage('/assets/photo.jpg')

  if (!close) {
    console.warn('Image failed to load')
    return
  }

  // close after 3 seconds
  setTimeout(() => close(), 3000)
}
```

---

## Example: basic SVG preview

```ts
import { previewSvg } from 'lite-image-preview'

const svg = document.querySelector('svg')

if (svg) {
  const close = await previewSvg(svg)

  // close?.()
}
```

---

## Example: custom preview content

The package also exposes `createPreview()` and `PreviewAdapter` for advanced use cases.

```ts
import { createPreview, type PreviewAdapter } from 'lite-image-preview'

const el = document.createElement('div')
el.textContent = 'Custom content'
el.style.width = '400px'
el.style.height = '240px'
el.style.background = '#ddd'

const close = createPreview(el, (stage): PreviewAdapter => {
  // Example adapter: no-op transform behavior.
  return {
    fitToStage() {},
    panBy() {},
    zoomAt() {},
    beginPinch() {},
    updatePinch() {},
    zoomWithWheel(e) {
      e.preventDefault()
    },
    destroy() {},
    resetStyle() {},
  }
})

// close()
```

---

## Keyboard and interaction behavior

* Click the close button to exit the dialog.
* Click **Reset** to return to the initial fitted view.
* Mouse wheel zooms around the pointer position.
* Drag to pan.
* Pinch with two fingers to zoom on touch devices.

---

## How the preview behaves

### Raster images

Raster images use a transform-based renderer.

* Initial state is fitted and centered in the stage.
* Dragging pans the image.
* Wheel and pinch gestures zoom around the gesture center.
* Reset returns to the initial fitted state.

### SVG

SVG uses `viewBox`-based scaling instead of CSS scaling.

This keeps zoomed SVG content crisp instead of rasterizing it too early.

* Initial state is fitted and centered.
* Dragging updates the `viewBox` position.
* Wheel and pinch gestures update the `viewBox` size and position.
* Reset returns to the initial fitted `viewBox`.

---

## Public types

The package exports the main types so advanced consumers can build custom adapters.

* `PreviewController`
* `PreviewAdapter`
* `PreviewAdapterFactory`
* `Point`
* `TransformState`
* `ViewBox`
* `PreviewCloseHandle`
* `ImagePreviewOptions`

`ImagePreviewOptions` includes:
- `minScale?: number` — minimum zoom scale (default: 0.1)
- `maxScale?: number` — maximum zoom scale (default: 8)
- `fitPadding?: number` — padding around the image when fitting to stage (default: 0)
- `fitMaxScale?: number` — maximum scale when fitting to stage (default: 1)

---

## Advanced customization

If you need to preview a different kind of element, use `createPreview()` plus a custom adapter.

A custom adapter can decide how to implement:

* initial fitting
* panning
* zooming around a point
* pinch gesture updates
* wheel zoom
* cleanup
* style restoration

This design lets the container stay simple while each rendering backend keeps its own optimal strategy.

---

## Notes on browser support

This package is designed for modern browsers.

It uses:

* `<dialog>`
* Pointer Events for non-touch input
* Touch Events for mobile pinch handling
* `requestAnimationFrame`
* CSS transforms and SVG `viewBox`

If you need to support old browsers, consider using polyfills.

---

## Development notes

* No runtime dependencies are required.
* SVG preview is intentionally implemented with `viewBox` so zoomed content stays sharp.
* Touch gestures are handled separately from pointer gestures to improve mobile browser behavior.

*Note*: We might add EventTarget support so that a 'close' event can be dispatched when the user closed the dialog, providing more customability.

---

## License

Unlicense
