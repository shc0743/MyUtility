import type {
    Point,
    PreviewAdapter,
    PreviewAdapterFactory,
    PreviewCloseHandle,
    TransformState,
    ViewBox,
} from './types'
import {
    clamp,
    dist,
    isFiniteNumber,
    measureSvgBaseViewBox,
    mid,
    safeRect,
    waitForImageLoad,
} from './util'

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
export function createPreview(
    content: HTMLElement,
    initAdapter: PreviewAdapterFactory,
    dispose?: () => void
): PreviewCloseHandle {
    const body = document.body
    const previousOverflow = body.style.overflow

    const dialog = document.createElement('dialog')
    const stage = document.createElement('div')
    const resetBtn = document.createElement('button')
    const closeBtn = document.createElement('button')

    let adapter: PreviewAdapter | null = null
    let gestureBinder: { destroy: () => void } | null = null
    let closed = false

    ;(dialog as any).closedBy = 'closeRequest'

    dialog.style.cssText = `
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        box-sizing: border-box;
        padding: 0;
        border: none;
        background: rgba(255, 255, 255, 0.8);
        overflow: hidden;
    `

    stage.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        touch-action: none;
        user-select: none;
    `

    content.style.cssText += `
        position: absolute;
        left: 0;
        top: 0;
        cursor: grab;
    `
    content.setAttribute('autofocus', '')

    resetBtn.type = 'button'
    resetBtn.textContent = 'Reset'
    resetBtn.setAttribute('aria-label', 'Reset to fit')
    resetBtn.style.cssText = `
        position: absolute;
        top: 16px;
        right: 64px;
        z-index: 2;
        min-width: 72px;
        height: 40px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 14px;
        cursor: pointer;
    `
    resetBtn.disabled = true

    closeBtn.type = 'button'
    closeBtn.textContent = '×'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 2;
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 28px;
        line-height: 40px;
        cursor: pointer;
    `

    stage.appendChild(content)
    stage.appendChild(resetBtn)
    stage.appendChild(closeBtn)
    dialog.appendChild(stage)
    body.appendChild(dialog)
    body.style.overflow = 'hidden'

    const onWheel = (e: WheelEvent) => {
        adapter?.zoomWithWheel(e)
    }

    const cleanup = () => {
        if (closed) return
        closed = true

        stage.removeEventListener('wheel', onWheel)

        gestureBinder?.destroy()
        gestureBinder = null

        adapter?.destroy()
        adapter?.resetStyle()
        adapter = null

        dialog.remove()
        body.style.overflow = previousOverflow
        dispose?.()
    }

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        dialog.close()
    })

    resetBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        adapter?.fitToStage(stage)
    })

    dialog.addEventListener('close', cleanup)

    dialog.style.visibility = 'hidden'
    dialog.showModal()

    requestAnimationFrame(() => {
        adapter = initAdapter(stage)
        gestureBinder = bindGestures(content, adapter)
        adapter.fitToStage(stage)
        resetBtn.disabled = false

        requestAnimationFrame(() => {
            adapter?.fitToStage(stage)
            dialog.style.visibility = 'visible'
        })
    })

    stage.addEventListener('wheel', onWheel, { passive: false })

    return () => dialog.close()
}

/**
 * Build the default transform-based adapter used for raster images.
 */
function createTransformAdapter(
    content: HTMLElement,
    stage: HTMLElement,
    baseWidth: number,
    baseHeight: number,
    options?: {
        minScale?: number
        maxScale?: number
        fitPadding?: number
        fitMaxScale?: number
    }
): PreviewAdapter {
    const minScale = options?.minScale ?? 0.1
    const maxScale = options?.maxScale ?? 8
    const fitPadding = options?.fitPadding ?? 32
    const fitMaxScale = options?.fitMaxScale ?? 1

    const prev = {
        transform: content.style.transform,
        transformOrigin: content.style.transformOrigin,
        width: content.style.width,
        height: content.style.height,
        cursor: content.style.cursor,
        touchAction: content.style.touchAction,
        userSelect: content.style.userSelect,
        display: content.style.display,
        maxWidth: content.style.maxWidth,
        maxHeight: content.style.maxHeight,
        position: content.style.position,
        left: content.style.left,
        top: content.style.top,
    }

    content.style.transformOrigin = '0 0'
    content.style.touchAction = 'none'
    content.style.userSelect = 'none'
    content.style.cursor = 'grab'
    content.style.display = 'block'
    content.style.maxWidth = 'none'
    content.style.maxHeight = 'none'
    content.style.position = 'absolute'
    content.style.left = '0'
    content.style.top = '0'
    content.style.width = `${baseWidth}px`
    content.style.height = `${baseHeight}px`

    const state: TransformState = {
        scale: 1,
        x: 0,
        y: 0,
    }

    let pinchStart:
        | {
              state: TransformState
              distance: number
              anchor: Point
          }
        | null = null

    function apply() {
        content.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`
    }

    function fitToStage() {
        const rect = safeRect(stage)
        const availW = Math.max(rect.width - fitPadding, 1)
        const availH = Math.max(rect.height - fitPadding, 1)

        const raw = Math.min(availW / baseWidth, availH / baseHeight, fitMaxScale)
        const fitScale = clamp(isFiniteNumber(raw) && raw > 0 ? raw : 1, minScale, maxScale)

        state.scale = fitScale
        state.x = (rect.width - baseWidth * fitScale) / 2
        state.y = (rect.height - baseHeight * fitScale) / 2
        apply()
    }

    function panBy(dx: number, dy: number) {
        if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) return
        state.x += dx
        state.y += dy
        apply()
    }

    function zoomAt(clientX: number, clientY: number, factor: number) {
        if (!isFiniteNumber(factor) || factor <= 0) return

        const nextScale = clamp(state.scale * factor, minScale, maxScale)
        if (nextScale === state.scale) return

        const contentX = (clientX - state.x) / state.scale
        const contentY = (clientY - state.y) / state.scale

        state.scale = nextScale
        state.x = clientX - contentX * nextScale
        state.y = clientY - contentY * nextScale
        apply()
    }

    function beginPinch(points: [Point, Point]) {
        const [p1, p2] = points
        const midpoint = mid(p1, p2)

        pinchStart = {
            state: { ...state },
            distance: dist(p1, p2),
            anchor: {
                x: (midpoint.x - state.x) / state.scale,
                y: (midpoint.y - state.y) / state.scale,
            },
        }
    }

    function updatePinch(points: [Point, Point]) {
        if (!pinchStart) return

        const [p1, p2] = points
        const currentDistance = dist(p1, p2)
        if (!isFiniteNumber(currentDistance) || currentDistance <= 0) return

        const currentMid = mid(p1, p2)
        const factor = currentDistance / pinchStart.distance
        const nextScale = clamp(pinchStart.state.scale * factor, minScale, maxScale)

        state.scale = nextScale
        state.x = currentMid.x - pinchStart.anchor.x * nextScale
        state.y = currentMid.y - pinchStart.anchor.y * nextScale
        apply()
    }

    function zoomWithWheel(e: WheelEvent) {
        e.preventDefault()

        // Wheel up (deltaY < 0) zooms in; wheel down zooms out.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015))
    }

    function destroy() {
        pinchStart = null
    }

    function resetStyle() {
        content.style.transform = prev.transform
        content.style.transformOrigin = prev.transformOrigin
        content.style.width = prev.width
        content.style.height = prev.height
        content.style.cursor = prev.cursor
        content.style.touchAction = prev.touchAction
        content.style.userSelect = prev.userSelect
        content.style.display = prev.display
        content.style.maxWidth = prev.maxWidth
        content.style.maxHeight = prev.maxHeight
        content.style.position = prev.position
        content.style.left = prev.left
        content.style.top = prev.top
    }

    return {
        fitToStage,
        panBy,
        zoomAt,
        beginPinch,
        updatePinch,
        zoomWithWheel,
        destroy,
        resetStyle,
    }
}

/**
 * Bind mouse, pen, and touch gestures to the preview content.
 *
 * Touch input is routed through Touch Events to avoid browser-specific
 * pointer gesture quirks on some mobile browsers.
 */
function bindGestures(
    content: HTMLElement,
    adapter: PreviewAdapter
) {
    const pointers = new Map<number, Point>()
    const lastPointers = new Map<number, Point>()

    let pinchActive = false
    let pinchRafId: number | null = null

    function getPrimaryTwoPoints(): [Point, Point] | null {
        const pair = [...pointers.entries()]
            .sort((a, b) => a[0] - b[0])
            .slice(0, 2)
            .map(([, p]) => p)

        if (pair.length !== 2) return null
        return [pair[0]!, pair[1]!]
    }

    function ensurePinchStarted() {
        const pair = getPrimaryTwoPoints()
        if (!pair) return
        adapter.beginPinch(pair)
        pinchActive = true
    }

    function schedulePinchUpdate() {
        if (pinchRafId !== null) return

        pinchRafId = requestAnimationFrame(() => {
            pinchRafId = null

            if (pointers.size < 2) return

            const pair = getPrimaryTwoPoints()
            if (!pair) return

            if (!pinchActive) {
                adapter.beginPinch(pair)
                pinchActive = true
            }

            adapter.updatePinch(pair)
        })
    }

    function stopPinchIfNeeded() {
        if (pointers.size < 2) {
            pinchActive = false
        }
    }

    function onPointerDown(e: PointerEvent) {
        if (e.pointerType === 'touch') return
        if (!content.isConnected) return

        e.preventDefault()

        try {
            content.setPointerCapture(e.pointerId)
        } catch {
            // ignore
        }

        const point = { x: e.clientX, y: e.clientY }
        pointers.set(e.pointerId, point)
        lastPointers.set(e.pointerId, point)

        if (pointers.size >= 2) {
            ensurePinchStarted()
        }
    }

    function onPointerMove(e: PointerEvent) {
        if (e.pointerType === 'touch') return
        if (!pointers.has(e.pointerId)) return
        if (!content.isConnected) return

        e.preventDefault()

        const current = { x: e.clientX, y: e.clientY }
        const previous = lastPointers.get(e.pointerId) ?? current

        pointers.set(e.pointerId, current)
        lastPointers.set(e.pointerId, current)

        if (pointers.size === 1) {
            adapter.panBy(current.x - previous.x, current.y - previous.y)
            return
        }

        if (pointers.size >= 2) {
            if (!pinchActive) ensurePinchStarted()
            schedulePinchUpdate()
        }
    }

    function onPointerUp(e: PointerEvent) {
        if (e.pointerType === 'touch') return

        pointers.delete(e.pointerId)
        lastPointers.delete(e.pointerId)

        if (pointers.size >= 2) {
            ensurePinchStarted()
            schedulePinchUpdate()
        } else {
            stopPinchIfNeeded()
        }

        if (pinchRafId !== null) {
            cancelAnimationFrame(pinchRafId)
            pinchRafId = null
        }
    }

    function onTouchStart(e: TouchEvent) {
        if (!content.isConnected) return

        e.preventDefault()

        for (const touch of Array.from(e.changedTouches)) {
            const point = { x: touch.clientX, y: touch.clientY }
            pointers.set(touch.identifier, point)
            lastPointers.set(touch.identifier, point)
        }

        if (pointers.size >= 2) {
            ensurePinchStarted()
        }
    }

    function onTouchMove(e: TouchEvent) {
        if (!content.isConnected) return

        e.preventDefault()

        for (const touch of Array.from(e.changedTouches)) {
            const current = { x: touch.clientX, y: touch.clientY }
            const previous = lastPointers.get(touch.identifier) ?? current

            pointers.set(touch.identifier, current)
            lastPointers.set(touch.identifier, current)

            if (pointers.size === 1) {
                adapter.panBy(current.x - previous.x, current.y - previous.y)
            }
        }

        if (pointers.size >= 2) {
            if (!pinchActive) ensurePinchStarted()
            schedulePinchUpdate()
        }
    }

    function onTouchEnd(e: TouchEvent) {
        for (const touch of Array.from(e.changedTouches)) {
            pointers.delete(touch.identifier)
            lastPointers.delete(touch.identifier)
        }

        if (pointers.size >= 2) {
            ensurePinchStarted()
            schedulePinchUpdate()
        } else {
            stopPinchIfNeeded()
        }

        if (pinchRafId !== null) {
            cancelAnimationFrame(pinchRafId)
            pinchRafId = null
        }
    }

    content.addEventListener('pointerdown', onPointerDown)
    content.addEventListener('pointermove', onPointerMove)
    content.addEventListener('pointerup', onPointerUp)
    content.addEventListener('pointercancel', onPointerUp)
    content.addEventListener('lostpointercapture', onPointerUp)

    content.addEventListener('touchstart', onTouchStart, { passive: false })
    content.addEventListener('touchmove', onTouchMove, { passive: false })
    content.addEventListener('touchend', onTouchEnd)
    content.addEventListener('touchcancel', onTouchEnd)

    return {
        destroy() {
            content.removeEventListener('pointerdown', onPointerDown)
            content.removeEventListener('pointermove', onPointerMove)
            content.removeEventListener('pointerup', onPointerUp)
            content.removeEventListener('pointercancel', onPointerUp)
            content.removeEventListener('lostpointercapture', onPointerUp)

            content.removeEventListener('touchstart', onTouchStart)
            content.removeEventListener('touchmove', onTouchMove)
            content.removeEventListener('touchend', onTouchEnd)
            content.removeEventListener('touchcancel', onTouchEnd)

            pointers.clear()
            lastPointers.clear()

            if (pinchRafId !== null) {
                cancelAnimationFrame(pinchRafId)
                pinchRafId = null
            }
        },
    }
}

/**
 * Open an image preview dialog.
 *
 * The returned promise resolves to a close handle when the preview is ready.
 * If the image fails to load, the promise resolves to null.
 */
export async function previewImage(
    url: string,
    dispose?: () => void
): Promise<PreviewCloseHandle> {
    const img = document.createElement('img')

    img.src = url
    img.alt = ''
    img.draggable = false
    img.style.cssText = `
        display: block;
        max-width: none;
        max-height: none;
    `

    try {
        await waitForImageLoad(img)
    } catch (e) {
        dispose?.()
        throw new Error('Failed to load image', { cause: e });
    }

    return createPreview(
        img,
        (stage: HTMLElement): PreviewAdapter => {
            const w = img.naturalWidth || 1
            const h = img.naturalHeight || 1

            return createTransformAdapter(img, stage, w, h, {
                minScale: 0,
                maxScale: 20,
                fitPadding: 10,
                fitMaxScale: 1,
            })
        },
        dispose
    )
}

/**
 * Open an SVG preview dialog.
 *
 * The returned promise resolves to a close handle when the preview is ready.
 */
export async function previewSvg(
    svg: SVGSVGElement,
    dispose?: () => void
): Promise<PreviewCloseHandle> {
    const cloned = svg.cloneNode(true) as SVGSVGElement

    cloned.removeAttribute('width')
    cloned.removeAttribute('height')

    cloned.style.cssText = `
        display: block;
        max-width: none;
        max-height: none;
        overflow: visible;
    `

    return createPreview(
        cloned as unknown as HTMLElement,
        () => createSvgViewBoxAdapter(cloned),
        dispose
    )
}

/**
 * Build the SVG adapter that uses viewBox for crisp scaling.
 */
function createSvgViewBoxAdapter(svg: SVGSVGElement): PreviewAdapter {
    const prev = {
        transform: svg.style.transform,
        transformOrigin: svg.style.transformOrigin,
        width: svg.style.width,
        height: svg.style.height,
        cursor: svg.style.cursor,
        touchAction: svg.style.touchAction,
        userSelect: svg.style.userSelect,
        display: svg.style.display,
        maxWidth: svg.style.maxWidth,
        maxHeight: svg.style.maxHeight,
        position: svg.style.position,
        left: svg.style.left,
        top: svg.style.top,
        overflow: svg.style.overflow,
        preserveAspectRatio: svg.getAttribute('preserveAspectRatio'),
        viewBox: svg.getAttribute('viewBox'),
        widthAttr: svg.getAttribute('width'),
        heightAttr: svg.getAttribute('height'),
    }

    const baseViewBox = measureSvgBaseViewBox(svg)
    let viewBox: ViewBox = { ...baseViewBox }

    let pinchStart:
        | {
              viewBox: ViewBox
              distance: number
              midpoint: Point
          }
        | null = null

    function applyViewBox() {
        svg.setAttribute(
            'viewBox',
            `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
        )
    }

    function fitToStage() {
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.display = 'block'
        svg.style.maxWidth = 'none'
        svg.style.maxHeight = 'none'
        svg.style.overflow = 'visible'
        svg.style.position = 'absolute'
        svg.style.left = '0'
        svg.style.top = '0'

        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        viewBox = { ...baseViewBox }
        applyViewBox()
    }

    function getRectSafe() {
        const rect = svg.getBoundingClientRect()
        return {
            left: rect.left,
            top: rect.top,
            width: rect.width || 1,
            height: rect.height || 1,
        }
    }

    function panBy(dx: number, dy: number) {
        if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) return

        const rect = getRectSafe()
        const factor = Math.max(viewBox.w / rect.width, viewBox.h / rect.height)

        viewBox.x -= dx * factor
        viewBox.y -= dy * factor
        applyViewBox()
    }

    function zoomAt(clientX: number, clientY: number, factor: number) {
        if (!isFiniteNumber(factor) || factor <= 0) return

        const rect = getRectSafe()
        const cx = (clientX - rect.left) / rect.width
        const cy = (clientY - rect.top) / rect.height

        const newW = viewBox.w * factor
        const newH = viewBox.h * factor

        viewBox.x += (viewBox.w - newW) * cx
        viewBox.y += (viewBox.h - newH) * cy
        viewBox.w = newW
        viewBox.h = newH
        applyViewBox()
    }

    function beginPinch(points: [Point, Point]) {
        const [p1, p2] = points
        const midpoint = mid(p1, p2)

        pinchStart = {
            viewBox: { ...viewBox },
            distance: dist(p1, p2),
            midpoint,
        }
    }

    function updatePinch(points: [Point, Point]) {
        if (!pinchStart) return

        const [p1, p2] = points
        const currentDistance = dist(p1, p2)
        if (!isFiniteNumber(currentDistance) || currentDistance <= 0) return

        const currentMid = mid(p1, p2)
        const scale = pinchStart.distance / currentDistance

        const newW = pinchStart.viewBox.w * scale
        const newH = pinchStart.viewBox.h * scale

        const rect = getRectSafe()
        const startCx = (pinchStart.midpoint.x - rect.left) / rect.width
        const startCy = (pinchStart.midpoint.y - rect.top) / rect.height
        const currentCx = (currentMid.x - rect.left) / rect.width
        const currentCy = (currentMid.y - rect.top) / rect.height

        const anchorX = pinchStart.viewBox.x + pinchStart.viewBox.w * startCx
        const anchorY = pinchStart.viewBox.y + pinchStart.viewBox.h * startCy

        viewBox.w = newW
        viewBox.h = newH
        viewBox.x = anchorX - newW * currentCx
        viewBox.y = anchorY - newH * currentCy
        applyViewBox()
    }

    function zoomWithWheel(e: WheelEvent) {
        e.preventDefault()

        // Wheel up (deltaY < 0) zooms in; wheel down zooms out.
        // The SVG logic has a specified problem that reverses the factor
        zoomAt(e.clientX, e.clientY, Math.exp(e.deltaY * 0.0015))
    }

    function destroy() {
        pinchStart = null
    }

    function resetStyle() {
        if (prev.transform !== undefined) svg.style.transform = prev.transform
        if (prev.transformOrigin !== undefined) svg.style.transformOrigin = prev.transformOrigin
        if (prev.width !== undefined) svg.style.width = prev.width
        if (prev.height !== undefined) svg.style.height = prev.height
        if (prev.cursor !== undefined) svg.style.cursor = prev.cursor
        if (prev.touchAction !== undefined) svg.style.touchAction = prev.touchAction
        if (prev.userSelect !== undefined) svg.style.userSelect = prev.userSelect
        if (prev.display !== undefined) svg.style.display = prev.display
        if (prev.maxWidth !== undefined) svg.style.maxWidth = prev.maxWidth
        if (prev.maxHeight !== undefined) svg.style.maxHeight = prev.maxHeight
        if (prev.position !== undefined) svg.style.position = prev.position
        if (prev.left !== undefined) svg.style.left = prev.left
        if (prev.top !== undefined) svg.style.top = prev.top
        if (prev.overflow !== undefined) svg.style.overflow = prev.overflow

        if (prev.preserveAspectRatio === null) {
            svg.removeAttribute('preserveAspectRatio')
        } else {
            svg.setAttribute('preserveAspectRatio', prev.preserveAspectRatio)
        }

        if (prev.viewBox === null) {
            svg.removeAttribute('viewBox')
        } else {
            svg.setAttribute('viewBox', prev.viewBox)
        }

        if (prev.widthAttr === null) svg.removeAttribute('width')
        else svg.setAttribute('width', prev.widthAttr)

        if (prev.heightAttr === null) svg.removeAttribute('height')
        else svg.setAttribute('height', prev.heightAttr)
    }

    return {
        fitToStage,
        panBy,
        zoomAt,
        beginPinch,
        updatePinch,
        zoomWithWheel,
        destroy,
        resetStyle,
    }
}
