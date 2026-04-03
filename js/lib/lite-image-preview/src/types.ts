/**
 * A 2D point in viewport/client coordinates.
 */
export type Point = {
    x: number
    y: number
}

/**
 * A simple transform state used by the default transform-based adapter.
 */
export type TransformState = {
    scale: number
    x: number
    y: number
}

/**
 * An SVG viewBox rectangle.
 */
export type ViewBox = {
    x: number
    y: number
    w: number
    h: number
}

/**
 * A function that closes an opened preview dialog.
 */
export type PreviewCloseHandle = () => void

/**
 * The minimum controller interface used by the preview container.
 * Custom adapters may extend this behavior, but these methods are required.
 */
export interface PreviewController {
    /**
     * Zoom in or out using a wheel event.
     * Implementations should call preventDefault() when appropriate.
     */
    zoomWithWheel: (e: WheelEvent) => void

    /**
     * Release listeners and internal state created by the adapter.
     */
    destroy: () => void

    /**
     * Restore the element's inline styles or attributes back to the pre-preview state.
     */
    resetStyle: () => void
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
export interface PreviewAdapter extends PreviewController {
    /**
     * Reset the visual state to the initial "fit to stage" layout.
     */
    fitToStage: (stage: HTMLElement) => void

    /**
     * Move the content by a delta measured in client pixels.
     */
    panBy: (dx: number, dy: number) => void

    /**
     * Zoom around a specific client coordinate.
     *
     * @param clientX - Client X coordinate.
     * @param clientY - Client Y coordinate.
     * @param factor - Multiplicative zoom factor.
     */
    zoomAt: (clientX: number, clientY: number, factor: number) => void

    /**
     * Start a pinch gesture using two points in client coordinates.
     */
    beginPinch: (points: [Point, Point]) => void

    /**
     * Update an active pinch gesture using two points in client coordinates.
     */
    updatePinch: (points: [Point, Point]) => void
}

/**
 * Factory function used by createPreview to initialize a rendering adapter.
 */
export type PreviewAdapterFactory = (stage: HTMLElement) => PreviewAdapter

/**
 * Options for image previews.
 */
export interface ImagePreviewOptions {
    /**
     * Minimum zoom scale (default: 0.1).
     */
    minScale?: number
    /**
     * Maximum zoom scale (default: 8).
     */
    maxScale?: number
    /**
     * Padding around the image when fitting to stage (default: 0).
     */
    fitPadding?: number
    /**
     * Maximum scale when fitting to stage (default: 1).
     */
    fitMaxScale?: number
}
