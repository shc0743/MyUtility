//#region src/util.ts
/**
* Clamp a number into the given range.
*/
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
/**
* Return whether a value is a finite number.
*/
function isFiniteNumber(n) {
	return Number.isFinite(n);
}
/**
* Compute the Euclidean distance between two points.
*/
function dist(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}
/**
* Compute the midpoint between two points.
*/
function mid(a, b) {
	return {
		x: (a.x + b.x) / 2,
		y: (a.y + b.y) / 2
	};
}
/**
* Read a safe client rect. Width and height are never returned as zero.
*/
function safeRect(el) {
	const rect = el.getBoundingClientRect();
	return {
		left: rect.left,
		top: rect.top,
		width: rect.width || 1,
		height: rect.height || 1
	};
}
/**
* Parse a numeric SVG/CSS length value.
* Returns null when the value is missing or invalid.
*/
function parseLength(value) {
	if (!value) return null;
	const n = Number.parseFloat(value);
	return Number.isFinite(n) && n > 0 ? n : null;
}
/**
* Measure the base SVG size used to initialize the preview viewBox.
*/
function measureSvgBaseViewBox(svg) {
	const vb = svg.viewBox.baseVal;
	if (vb && vb.width > 0 && vb.height > 0) return {
		x: vb.x,
		y: vb.y,
		w: vb.width,
		h: vb.height
	};
	const attrW = parseLength(svg.getAttribute("width"));
	const attrH = parseLength(svg.getAttribute("height"));
	if (attrW && attrH) return {
		x: 0,
		y: 0,
		w: attrW,
		h: attrH
	};
	try {
		const bbox = svg.getBBox();
		if (bbox.width > 0 && bbox.height > 0) return {
			x: bbox.x,
			y: bbox.y,
			w: bbox.width,
			h: bbox.height
		};
	} catch {}
	return {
		x: 0,
		y: 0,
		w: 100,
		h: 100
	};
}
/**
* Wait until an HTML image is fully loaded.
*/
function waitForImageLoad(img) {
	return new Promise((resolve, reject) => {
		if (img.complete) {
			if (img.naturalWidth > 0) resolve();
			else reject(/* @__PURE__ */ new Error(`Image failed to load: ${img.currentSrc || img.src}`));
			return;
		}
		img.addEventListener("load", () => resolve(), { once: true });
		img.addEventListener("error", () => reject(/* @__PURE__ */ new Error(`Image failed to load: ${img.currentSrc || img.src}`)), { once: true });
	});
}
//#endregion
//#region src/preview.ts
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
function createPreview(content, initAdapter, dispose) {
	const body = document.body;
	const previousOverflow = body.style.overflow;
	const dialog = document.createElement("dialog");
	const stage = document.createElement("div");
	const resetBtn = document.createElement("button");
	const closeBtn = document.createElement("button");
	let adapter = null;
	let gestureBinder = null;
	let closed = false;
	dialog.closedBy = "closeRequest";
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
    `;
	stage.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        touch-action: none;
        user-select: none;
    `;
	content.style.cssText += `
        position: absolute;
        left: 0;
        top: 0;
        cursor: grab;
    `;
	content.setAttribute("autofocus", "");
	resetBtn.type = "button";
	resetBtn.textContent = "Reset";
	resetBtn.setAttribute("aria-label", "Reset to fit");
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
    `;
	resetBtn.disabled = true;
	closeBtn.type = "button";
	closeBtn.textContent = "×";
	closeBtn.setAttribute("aria-label", "Close");
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
    `;
	stage.appendChild(content);
	stage.appendChild(resetBtn);
	stage.appendChild(closeBtn);
	dialog.appendChild(stage);
	body.appendChild(dialog);
	body.style.overflow = "hidden";
	const onWheel = (e) => {
		adapter?.zoomWithWheel(e);
	};
	const cleanup = () => {
		if (closed) return;
		closed = true;
		stage.removeEventListener("wheel", onWheel);
		gestureBinder?.destroy();
		gestureBinder = null;
		adapter?.destroy();
		adapter?.resetStyle();
		adapter = null;
		dialog.remove();
		body.style.overflow = previousOverflow;
		dispose?.();
	};
	closeBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		dialog.close();
	});
	resetBtn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		adapter?.fitToStage(stage);
	});
	dialog.addEventListener("close", cleanup);
	dialog.style.visibility = "hidden";
	dialog.showModal();
	requestAnimationFrame(() => {
		adapter = initAdapter(stage);
		gestureBinder = bindGestures(content, adapter);
		adapter.fitToStage(stage);
		resetBtn.disabled = false;
		requestAnimationFrame(() => {
			adapter?.fitToStage(stage);
			dialog.style.visibility = "visible";
		});
	});
	stage.addEventListener("wheel", onWheel, { passive: false });
	return () => dialog.close();
}
/**
* Build the default transform-based adapter used for raster images.
*/
function createTransformAdapter(content, stage, baseWidth, baseHeight, options) {
	const minScale = options?.minScale ?? .1;
	const maxScale = options?.maxScale ?? 8;
	const fitPadding = options?.fitPadding ?? 32;
	const fitMaxScale = options?.fitMaxScale ?? 1;
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
		top: content.style.top
	};
	content.style.transformOrigin = "0 0";
	content.style.touchAction = "none";
	content.style.userSelect = "none";
	content.style.cursor = "grab";
	content.style.display = "block";
	content.style.maxWidth = "none";
	content.style.maxHeight = "none";
	content.style.position = "absolute";
	content.style.left = "0";
	content.style.top = "0";
	content.style.width = `${baseWidth}px`;
	content.style.height = `${baseHeight}px`;
	const state = {
		scale: 1,
		x: 0,
		y: 0
	};
	let pinchStart = null;
	function apply() {
		content.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
	}
	function fitToStage() {
		const rect = safeRect(stage);
		const availW = Math.max(rect.width - fitPadding, 1);
		const availH = Math.max(rect.height - fitPadding, 1);
		const raw = Math.min(availW / baseWidth, availH / baseHeight, fitMaxScale);
		const fitScale = clamp(isFiniteNumber(raw) && raw > 0 ? raw : 1, minScale, maxScale);
		state.scale = fitScale;
		state.x = (rect.width - baseWidth * fitScale) / 2;
		state.y = (rect.height - baseHeight * fitScale) / 2;
		apply();
	}
	function panBy(dx, dy) {
		if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) return;
		state.x += dx;
		state.y += dy;
		apply();
	}
	function zoomAt(clientX, clientY, factor) {
		if (!isFiniteNumber(factor) || factor <= 0) return;
		const nextScale = clamp(state.scale * factor, minScale, maxScale);
		if (nextScale === state.scale) return;
		const contentX = (clientX - state.x) / state.scale;
		const contentY = (clientY - state.y) / state.scale;
		state.scale = nextScale;
		state.x = clientX - contentX * nextScale;
		state.y = clientY - contentY * nextScale;
		apply();
	}
	function beginPinch(points) {
		const [p1, p2] = points;
		const midpoint = mid(p1, p2);
		pinchStart = {
			state: { ...state },
			distance: dist(p1, p2),
			anchor: {
				x: (midpoint.x - state.x) / state.scale,
				y: (midpoint.y - state.y) / state.scale
			}
		};
	}
	function updatePinch(points) {
		if (!pinchStart) return;
		const [p1, p2] = points;
		const currentDistance = dist(p1, p2);
		if (!isFiniteNumber(currentDistance) || currentDistance <= 0) return;
		const currentMid = mid(p1, p2);
		const factor = currentDistance / pinchStart.distance;
		const nextScale = clamp(pinchStart.state.scale * factor, minScale, maxScale);
		state.scale = nextScale;
		state.x = currentMid.x - pinchStart.anchor.x * nextScale;
		state.y = currentMid.y - pinchStart.anchor.y * nextScale;
		apply();
	}
	function zoomWithWheel(e) {
		e.preventDefault();
		zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * .0015));
	}
	function destroy() {
		pinchStart = null;
	}
	function resetStyle() {
		content.style.transform = prev.transform;
		content.style.transformOrigin = prev.transformOrigin;
		content.style.width = prev.width;
		content.style.height = prev.height;
		content.style.cursor = prev.cursor;
		content.style.touchAction = prev.touchAction;
		content.style.userSelect = prev.userSelect;
		content.style.display = prev.display;
		content.style.maxWidth = prev.maxWidth;
		content.style.maxHeight = prev.maxHeight;
		content.style.position = prev.position;
		content.style.left = prev.left;
		content.style.top = prev.top;
	}
	return {
		fitToStage,
		panBy,
		zoomAt,
		beginPinch,
		updatePinch,
		zoomWithWheel,
		destroy,
		resetStyle
	};
}
/**
* Bind mouse, pen, and touch gestures to the preview content.
*
* Touch input is routed through Touch Events to avoid browser-specific
* pointer gesture quirks on some mobile browsers.
*/
function bindGestures(content, adapter) {
	const pointers = /* @__PURE__ */ new Map();
	const lastPointers = /* @__PURE__ */ new Map();
	let pinchActive = false;
	let pinchRafId = null;
	function getPrimaryTwoPoints() {
		const pair = [...pointers.entries()].sort((a, b) => a[0] - b[0]).slice(0, 2).map(([, p]) => p);
		if (pair.length !== 2) return null;
		return [pair[0], pair[1]];
	}
	function ensurePinchStarted() {
		const pair = getPrimaryTwoPoints();
		if (!pair) return;
		adapter.beginPinch(pair);
		pinchActive = true;
	}
	function schedulePinchUpdate() {
		if (pinchRafId !== null) return;
		pinchRafId = requestAnimationFrame(() => {
			pinchRafId = null;
			if (pointers.size < 2) return;
			const pair = getPrimaryTwoPoints();
			if (!pair) return;
			if (!pinchActive) {
				adapter.beginPinch(pair);
				pinchActive = true;
			}
			adapter.updatePinch(pair);
		});
	}
	function stopPinchIfNeeded() {
		if (pointers.size < 2) pinchActive = false;
	}
	function onPointerDown(e) {
		if (e.pointerType === "touch") return;
		if (!content.isConnected) return;
		e.preventDefault();
		try {
			content.setPointerCapture(e.pointerId);
		} catch {}
		const point = {
			x: e.clientX,
			y: e.clientY
		};
		pointers.set(e.pointerId, point);
		lastPointers.set(e.pointerId, point);
		if (pointers.size >= 2) ensurePinchStarted();
	}
	function onPointerMove(e) {
		if (e.pointerType === "touch") return;
		if (!pointers.has(e.pointerId)) return;
		if (!content.isConnected) return;
		e.preventDefault();
		const current = {
			x: e.clientX,
			y: e.clientY
		};
		const previous = lastPointers.get(e.pointerId) ?? current;
		pointers.set(e.pointerId, current);
		lastPointers.set(e.pointerId, current);
		if (pointers.size === 1) {
			adapter.panBy(current.x - previous.x, current.y - previous.y);
			return;
		}
		if (pointers.size >= 2) {
			if (!pinchActive) ensurePinchStarted();
			schedulePinchUpdate();
		}
	}
	function onPointerUp(e) {
		if (e.pointerType === "touch") return;
		pointers.delete(e.pointerId);
		lastPointers.delete(e.pointerId);
		if (pointers.size >= 2) {
			ensurePinchStarted();
			schedulePinchUpdate();
		} else stopPinchIfNeeded();
		if (pinchRafId !== null) {
			cancelAnimationFrame(pinchRafId);
			pinchRafId = null;
		}
	}
	function onTouchStart(e) {
		if (!content.isConnected) return;
		e.preventDefault();
		for (const touch of Array.from(e.changedTouches)) {
			const point = {
				x: touch.clientX,
				y: touch.clientY
			};
			pointers.set(touch.identifier, point);
			lastPointers.set(touch.identifier, point);
		}
		if (pointers.size >= 2) ensurePinchStarted();
	}
	function onTouchMove(e) {
		if (!content.isConnected) return;
		e.preventDefault();
		for (const touch of Array.from(e.changedTouches)) {
			const current = {
				x: touch.clientX,
				y: touch.clientY
			};
			const previous = lastPointers.get(touch.identifier) ?? current;
			pointers.set(touch.identifier, current);
			lastPointers.set(touch.identifier, current);
			if (pointers.size === 1) adapter.panBy(current.x - previous.x, current.y - previous.y);
		}
		if (pointers.size >= 2) {
			if (!pinchActive) ensurePinchStarted();
			schedulePinchUpdate();
		}
	}
	function onTouchEnd(e) {
		for (const touch of Array.from(e.changedTouches)) {
			pointers.delete(touch.identifier);
			lastPointers.delete(touch.identifier);
		}
		if (pointers.size >= 2) {
			ensurePinchStarted();
			schedulePinchUpdate();
		} else stopPinchIfNeeded();
		if (pinchRafId !== null) {
			cancelAnimationFrame(pinchRafId);
			pinchRafId = null;
		}
	}
	content.addEventListener("pointerdown", onPointerDown);
	content.addEventListener("pointermove", onPointerMove);
	content.addEventListener("pointerup", onPointerUp);
	content.addEventListener("pointercancel", onPointerUp);
	content.addEventListener("lostpointercapture", onPointerUp);
	content.addEventListener("touchstart", onTouchStart, { passive: false });
	content.addEventListener("touchmove", onTouchMove, { passive: false });
	content.addEventListener("touchend", onTouchEnd);
	content.addEventListener("touchcancel", onTouchEnd);
	return { destroy() {
		content.removeEventListener("pointerdown", onPointerDown);
		content.removeEventListener("pointermove", onPointerMove);
		content.removeEventListener("pointerup", onPointerUp);
		content.removeEventListener("pointercancel", onPointerUp);
		content.removeEventListener("lostpointercapture", onPointerUp);
		content.removeEventListener("touchstart", onTouchStart);
		content.removeEventListener("touchmove", onTouchMove);
		content.removeEventListener("touchend", onTouchEnd);
		content.removeEventListener("touchcancel", onTouchEnd);
		pointers.clear();
		lastPointers.clear();
		if (pinchRafId !== null) {
			cancelAnimationFrame(pinchRafId);
			pinchRafId = null;
		}
	} };
}
/**
* Open an image preview dialog.
*
* The returned promise resolves to a close handle when the preview is ready.
* If the image fails to load, the promise resolves to null.
*/
async function previewImage(url, dispose) {
	const img = document.createElement("img");
	img.src = url;
	img.alt = "";
	img.draggable = false;
	img.style.cssText = `
        display: block;
        max-width: none;
        max-height: none;
    `;
	try {
		await waitForImageLoad(img);
	} catch {
		dispose?.();
		return null;
	}
	return createPreview(img, (stage) => {
		return createTransformAdapter(img, stage, img.naturalWidth || 1, img.naturalHeight || 1, {
			minScale: .1,
			maxScale: 8,
			fitPadding: 32,
			fitMaxScale: 1
		});
	}, dispose);
}
/**
* Open an SVG preview dialog.
*
* The returned promise resolves to a close handle when the preview is ready.
*/
async function previewSvg(svg, dispose) {
	const cloned = svg.cloneNode(true);
	cloned.removeAttribute("width");
	cloned.removeAttribute("height");
	cloned.style.cssText = `
        display: block;
        max-width: none;
        max-height: none;
        overflow: visible;
    `;
	return createPreview(cloned, () => createSvgViewBoxAdapter(cloned), dispose);
}
/**
* Build the SVG adapter that uses viewBox for crisp scaling.
*/
function createSvgViewBoxAdapter(svg) {
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
		preserveAspectRatio: svg.getAttribute("preserveAspectRatio"),
		viewBox: svg.getAttribute("viewBox"),
		widthAttr: svg.getAttribute("width"),
		heightAttr: svg.getAttribute("height")
	};
	const baseViewBox = measureSvgBaseViewBox(svg);
	let viewBox = { ...baseViewBox };
	let pinchStart = null;
	function applyViewBox() {
		svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
	}
	function fitToStage() {
		svg.style.width = "100%";
		svg.style.height = "100%";
		svg.style.display = "block";
		svg.style.maxWidth = "none";
		svg.style.maxHeight = "none";
		svg.style.overflow = "visible";
		svg.style.position = "absolute";
		svg.style.left = "0";
		svg.style.top = "0";
		svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
		viewBox = { ...baseViewBox };
		applyViewBox();
	}
	function getRectSafe() {
		const rect = svg.getBoundingClientRect();
		return {
			left: rect.left,
			top: rect.top,
			width: rect.width || 1,
			height: rect.height || 1
		};
	}
	function panBy(dx, dy) {
		if (!isFiniteNumber(dx) || !isFiniteNumber(dy)) return;
		const rect = getRectSafe();
		const factor = Math.max(viewBox.w / rect.width, viewBox.h / rect.height);
		viewBox.x -= dx * factor;
		viewBox.y -= dy * factor;
		applyViewBox();
	}
	function zoomAt(clientX, clientY, factor) {
		if (!isFiniteNumber(factor) || factor <= 0) return;
		const rect = getRectSafe();
		const cx = (clientX - rect.left) / rect.width;
		const cy = (clientY - rect.top) / rect.height;
		const newW = viewBox.w * factor;
		const newH = viewBox.h * factor;
		viewBox.x += (viewBox.w - newW) * cx;
		viewBox.y += (viewBox.h - newH) * cy;
		viewBox.w = newW;
		viewBox.h = newH;
		applyViewBox();
	}
	function beginPinch(points) {
		const [p1, p2] = points;
		const midpoint = mid(p1, p2);
		pinchStart = {
			viewBox: { ...viewBox },
			distance: dist(p1, p2),
			midpoint
		};
	}
	function updatePinch(points) {
		if (!pinchStart) return;
		const [p1, p2] = points;
		const currentDistance = dist(p1, p2);
		if (!isFiniteNumber(currentDistance) || currentDistance <= 0) return;
		const currentMid = mid(p1, p2);
		const scale = pinchStart.distance / currentDistance;
		const newW = pinchStart.viewBox.w * scale;
		const newH = pinchStart.viewBox.h * scale;
		const rect = getRectSafe();
		const startCx = (pinchStart.midpoint.x - rect.left) / rect.width;
		const startCy = (pinchStart.midpoint.y - rect.top) / rect.height;
		const currentCx = (currentMid.x - rect.left) / rect.width;
		const currentCy = (currentMid.y - rect.top) / rect.height;
		const anchorX = pinchStart.viewBox.x + pinchStart.viewBox.w * startCx;
		const anchorY = pinchStart.viewBox.y + pinchStart.viewBox.h * startCy;
		viewBox.w = newW;
		viewBox.h = newH;
		viewBox.x = anchorX - newW * currentCx;
		viewBox.y = anchorY - newH * currentCy;
		applyViewBox();
	}
	function zoomWithWheel(e) {
		e.preventDefault();
		zoomAt(e.clientX, e.clientY, Math.exp(e.deltaY * .0015));
	}
	function destroy() {
		pinchStart = null;
	}
	function resetStyle() {
		if (prev.transform !== void 0) svg.style.transform = prev.transform;
		if (prev.transformOrigin !== void 0) svg.style.transformOrigin = prev.transformOrigin;
		if (prev.width !== void 0) svg.style.width = prev.width;
		if (prev.height !== void 0) svg.style.height = prev.height;
		if (prev.cursor !== void 0) svg.style.cursor = prev.cursor;
		if (prev.touchAction !== void 0) svg.style.touchAction = prev.touchAction;
		if (prev.userSelect !== void 0) svg.style.userSelect = prev.userSelect;
		if (prev.display !== void 0) svg.style.display = prev.display;
		if (prev.maxWidth !== void 0) svg.style.maxWidth = prev.maxWidth;
		if (prev.maxHeight !== void 0) svg.style.maxHeight = prev.maxHeight;
		if (prev.position !== void 0) svg.style.position = prev.position;
		if (prev.left !== void 0) svg.style.left = prev.left;
		if (prev.top !== void 0) svg.style.top = prev.top;
		if (prev.overflow !== void 0) svg.style.overflow = prev.overflow;
		if (prev.preserveAspectRatio === null) svg.removeAttribute("preserveAspectRatio");
		else svg.setAttribute("preserveAspectRatio", prev.preserveAspectRatio);
		if (prev.viewBox === null) svg.removeAttribute("viewBox");
		else svg.setAttribute("viewBox", prev.viewBox);
		if (prev.widthAttr === null) svg.removeAttribute("width");
		else svg.setAttribute("width", prev.widthAttr);
		if (prev.heightAttr === null) svg.removeAttribute("height");
		else svg.setAttribute("height", prev.heightAttr);
	}
	return {
		fitToStage,
		panBy,
		zoomAt,
		beginPinch,
		updatePinch,
		zoomWithWheel,
		destroy,
		resetStyle
	};
}
//#endregion
export { createPreview, previewImage, previewSvg };
