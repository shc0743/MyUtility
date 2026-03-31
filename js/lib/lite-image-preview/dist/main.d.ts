//#region src/types.d.ts
/**
 * A 2D point in viewport/client coordinates.
 */
type Point = {
  x: number;
  y: number;
};
/**
 * A simple transform state used by the default transform-based adapter.
 */
type TransformState = {
  scale: number;
  x: number;
  y: number;
};
/**
 * An SVG viewBox rectangle.
 */
type ViewBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};
/**
 * A function that closes an opened preview dialog.
 */
type PreviewCloseHandle = () => void;
/**
 * The minimum controller interface used by the preview container.
 * Custom adapters may extend this behavior, but these methods are required.
 */
interface PreviewController {
  /**
   * Zoom in or out using a wheel event.
   * Implementations should call preventDefault() when appropriate.
   */
  zoomWithWheel: (e: WheelEvent) => void;
  /**
   * Release listeners and internal state created by the adapter.
   */
  destroy: () => void;
  /**
   * Restore the element's inline styles or attributes back to the pre-preview state.
   */
  resetStyle: () => void;
}
/**
 * The public adapter interface used by createPreview.
 *
 * The preview container handles dialog lifecycle and gesture routing,
 * while the adapter owns the actual rendering backend.
 * For example:
 * - image previews can use CSS transform
 * - SVG previews can use viewBox
 */
interface PreviewAdapter extends PreviewController {
  /**
   * Reset the visual state to the initial "fit to stage" layout.
   */
  fitToStage: (stage: HTMLElement) => void;
  /**
   * Move the content by a delta measured in client pixels.
   */
  panBy: (dx: number, dy: number) => void;
  /**
   * Zoom around a specific client coordinate.
   *
   * @param clientX - Client X coordinate.
   * @param clientY - Client Y coordinate.
   * @param factor - Multiplicative zoom factor.
   */
  zoomAt: (clientX: number, clientY: number, factor: number) => void;
  /**
   * Start a pinch gesture using two points in client coordinates.
   */
  beginPinch: (points: [Point, Point]) => void;
  /**
   * Update an active pinch gesture using two points in client coordinates.
   */
  updatePinch: (points: [Point, Point]) => void;
}
/**
 * Factory function used by createPreview to initialize a rendering adapter.
 */
type PreviewAdapterFactory = (stage: HTMLElement) => PreviewAdapter;
//#endregion
//#region src/preview.d.ts
/**
 * Open a modal preview dialog for arbitrary content.
 *
 * The dialog container handles lifecycle and gestures, while the adapter
 * implements the actual rendering backend.
 *
 * @param content - The DOM element to preview.
 * @param initAdapter - Factory that creates a preview adapter after the stage is mounted.
 * @param dispose - Optional cleanup callback called after the dialog closes.
 * @returns A function that closes the preview dialog.
 */
declare function createPreview(content: HTMLElement, initAdapter: PreviewAdapterFactory, dispose?: () => void): PreviewCloseHandle;
/**
 * Open an image preview dialog.
 *
 * The returned promise resolves to a close handle when the preview is ready.
 * If the image fails to load, the promise resolves to null.
 */
declare function previewImage(url: string, dispose?: () => void): Promise<PreviewCloseHandle | null>;
/**
 * Open an SVG preview dialog.
 *
 * The returned promise resolves to a close handle when the preview is ready.
 */
declare function previewSvg(svg: SVGSVGElement, dispose?: () => void): Promise<PreviewCloseHandle>;
//#endregion
export { type Point, type PreviewAdapter, type PreviewAdapterFactory, type PreviewCloseHandle, type PreviewController, type TransformState, type ViewBox, createPreview, previewImage, previewSvg };