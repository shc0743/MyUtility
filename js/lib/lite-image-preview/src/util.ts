import type { Point, ViewBox } from './types'

/**
 * Clamp a number into the given range.
 */
export function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n))
}

/**
 * Return whether a value is a finite number.
 */
export function isFiniteNumber(n: number) {
    return Number.isFinite(n)
}

/**
 * Compute the Euclidean distance between two points.
 */
export function dist(a: Point, b: Point) {
    return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Compute the midpoint between two points.
 */
export function mid(a: Point, b: Point) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/**
 * Read a safe client rect. Width and height are never returned as zero.
 */
export function safeRect(el: Element) {
    const rect = el.getBoundingClientRect()
    return {
        left: rect.left,
        top: rect.top,
        width: rect.width || 1,
        height: rect.height || 1,
    }
}

/**
 * Parse a numeric SVG/CSS length value.
 * Returns null when the value is missing or invalid.
 */
export function parseLength(value: string | null): number | null {
    if (!value) return null
    const n = Number.parseFloat(value)
    return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Measure the base SVG size used to initialize the preview viewBox.
 */
export function measureSvgBaseViewBox(svg: SVGSVGElement): ViewBox {
    const vb = svg.viewBox.baseVal
    if (vb && vb.width > 0 && vb.height > 0) {
        return { x: vb.x, y: vb.y, w: vb.width, h: vb.height }
    }

    const attrW = parseLength(svg.getAttribute('width'))
    const attrH = parseLength(svg.getAttribute('height'))
    if (attrW && attrH) {
        return { x: 0, y: 0, w: attrW, h: attrH }
    }

    try {
        const bbox = svg.getBBox()
        if (bbox.width > 0 && bbox.height > 0) {
            return { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height }
        }
    } catch {
        // Some SVGs may fail getBBox() before they are fully laid out.
    }

    return { x: 0, y: 0, w: 100, h: 100 }
}

/**
 * Wait until an HTML image is fully loaded.
 */
export function waitForImageLoad(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
        if (img.complete) {
            if (img.naturalWidth > 0) {
                resolve()
            } else {
                reject(new Error(`Image failed to load: ${img.currentSrc || img.src}`))
            }
            return
        }

        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener(
            'error',
            () => reject(new Error(`Image failed to load: ${img.currentSrc || img.src}`)),
            { once: true }
        )
    })
}
