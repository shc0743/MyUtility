(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`.dialog-view[data-v-8eb40789]{padding:var(--dialog-padding,20px);box-sizing:border-box;border:1px solid gray;border-radius:5px;max-width:calc(100% - 2em);max-height:calc(100% - 2em);overflow:hidden;outline:0!important}.dialog-view[open][data-v-8eb40789]{flex-direction:column;display:flex}.dialog-view[data-v-8eb40789]::backdrop{background:#00000080}.dialog-title-bar[data-v-8eb40789]{min-height:var(--dialog-title-height,24px);white-space:pre;-webkit-user-select:none;user-select:none;flex-direction:row;align-items:center;margin-bottom:.5em;display:flex;overflow:hidden}.dialog-title[data-v-8eb40789]{text-align:center;text-overflow:ellipsis;flex:1;font-size:large;font-weight:700;overflow:hidden}.dialog-close-button[data-v-8eb40789]{color:#666;cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;width:24px;height:24px;margin-left:.5em;padding:10px;font-size:1.5em;line-height:1;text-decoration:none;display:flex}.dialog-close-button[data-v-8eb40789]:hover{color:#333;background-color:#f0f0f0;border-radius:3px}.dialog-close-button[data-v-8eb40789]:focus-visible{outline-offset:-2px;outline:2px solid #a0cfff}.dialog-content-wrapper[data-v-8eb40789]{flex:1;overflow:auto}.dialog-content[data-v-8eb40789]{flex-direction:column;width:100%;height:100%;display:flex}.dialog-footer[data-v-8eb40789]{margin-top:.5em}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { computed as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, defineComponent as i, mergeProps as a, nextTick as o, onActivated as s, onBeforeUnmount as c, onDeactivated as l, onMounted as u, openBlock as d, ref as f, renderSlot as p, watch as m, withModifiers as h } from "vue";
//#region src/DialogView.vue?vue&type=script&setup=true&lang.ts
var g = ["closedBy"], _ = {
	key: 0,
	class: "dialog-title-bar"
}, v = { class: "dialog-title" }, y = { class: "dialog-content-wrapper" }, b = { class: "dialog-content" }, x = {
	key: 1,
	class: "dialog-footer"
}, S = /* @__PURE__ */ ((e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
})(/* @__PURE__ */ i({
	__name: "DialogView",
	props: {
		modelValue: { type: Boolean },
		showTitleBar: {
			type: Boolean,
			default: !0
		},
		showCloseButton: {
			type: Boolean,
			default: !0
		},
		closable: {
			type: Boolean,
			default: !0
		},
		closeOnClickMask: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["update:modelValue", "closed"],
	setup(i, { expose: S, emit: C }) {
		let w = i, T = C, E = f(), D = () => {
			T("update:modelValue", !0);
		}, O = () => {
			T("update:modelValue", !1);
		}, k = (e) => {
			e.preventDefault(), w.closable && O();
		}, A = f(!1), j = () => {
			if (!A.value) {
				if (!w.closable && w.modelValue) {
					o(() => {
						E.value && !E.value.open && E.value.showModal();
					});
					return;
				}
				w.modelValue && T("update:modelValue", !1), o(() => {
					w.modelValue && E.value && !E.value.open && E.value.showModal();
				}), T("closed");
			}
		}, M = e(() => w.closable ? w.closeOnClickMask ? "any" : "closerequest" : "none");
		m(() => w.modelValue, async (e) => {
			await o(), e ? E.value && !E.value.open && E.value.showModal() : E.value && E.value.open && E.value.close();
		});
		let N = () => {
			w.modelValue && E.value && !E.value.open && E.value.showModal();
		};
		return u(() => {
			N();
		}), c(() => {
			E.value && E.value.open && E.value.close();
		}), l(() => {
			E.value && E.value.open && (A.value = !0, E.value.close(), o(() => A.value = !1));
		}), s(() => {
			N();
		}), S({
			get: () => E.value,
			open: D,
			close: O
		}), (e, o) => (d(), n("dialog", a({
			ref_key: "dialogRef",
			ref: E,
			class: "dialog-view"
		}, e.$attrs, {
			onClose: j,
			onCancel: k,
			closedBy: M.value
		}), [
			i.showTitleBar ? (d(), n("div", _, [r("span", v, [p(e.$slots, "title", {}, void 0, !0)]), i.showCloseButton && i.closable ? (d(), n("button", {
				key: 0,
				type: "button",
				"aria-label": "Close the dialog",
				class: "dialog-close-button",
				onClick: h(O, ["prevent"])
			}, "×")) : t("", !0)])) : t("", !0),
			r("div", y, [r("div", b, [p(e.$slots, "default", {}, void 0, !0)])]),
			e.$slots.footer ? (d(), n("div", x, [p(e.$slots, "footer", {}, void 0, !0)])) : t("", !0)
		], 16, g));
	}
}), [["__scopeId", "data-v-8eb40789"]]), C = { install: (e) => {
	e.component("DialogView", S);
} };
//#endregion
export { S as DialogView, C as DialogViewPlugin, C as default };

//# sourceMappingURL=unobfuscated.es.js.map