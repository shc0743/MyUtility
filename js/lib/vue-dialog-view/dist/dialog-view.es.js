(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`._b4102a3b79656a37{padding:var(--dialog-padding,20px);box-sizing:border-box;border:1px solid gray;border-radius:5px;max-width:calc(100% - 2em);max-height:calc(100% - 2em);overflow:hidden;outline:0!important}._b4102a3b79656a37[open]{flex-direction:column;display:flex}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{min-height:var(--dialog-title-height,24px);white-space:pre;-webkit-user-select:none;user-select:none;flex-direction:row;align-items:center;margin-bottom:.5em;display:flex;overflow:hidden}._088d860d2fd75292{text-align:center;text-overflow:ellipsis;flex:1;font-size:large;font-weight:700;overflow:hidden}._468ff1da37ead40a{color:#666;cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;width:24px;height:24px;margin-left:.5em;padding:10px;font-size:1.5em;line-height:1;text-decoration:none;display:flex}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._468ff1da37ead40a:focus-visible{outline-offset:-2px;outline:2px solid #a0cfff}._da3b3b2a4aeed1ee{flex-direction:column;flex:1;display:flex;overflow:auto}._61879ba330d9a71c{margin-top:.5em}/*$vite$:1*/`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();
import { computed as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, defineComponent as i, mergeProps as a, nextTick as o, onActivated as s, onBeforeUnmount as c, onDeactivated as l, onMounted as u, openBlock as d, ref as f, renderSlot as p, watch as m, withModifiers as h } from "vue";
//#region src/DialogView.obf.vue?vue&type=script&setup=true&lang.ts
var g = ["closedBy"], _ = {
	key: 0,
	class: "_4d394b1507fdc584"
}, v = { class: "_088d860d2fd75292" }, y = { class: "_da3b3b2a4aeed1ee" }, b = {
	key: 1,
	class: "_61879ba330d9a71c"
}, x = /* @__PURE__ */ i({
	__name: "DialogView.obf",
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
	setup(i, { expose: x, emit: S }) {
		let C = i, w = S, T = f(), E = () => {
			w("update:modelValue", !0);
		}, D = () => {
			w("update:modelValue", !1);
		}, O = (e) => {
			e.preventDefault(), C.closable && D();
		}, k = f(!1), A = () => {
			if (!k.value) {
				if (!C.closable && C.modelValue) {
					o(() => {
						T.value && !T.value.open && T.value.showModal();
					});
					return;
				}
				C.modelValue && w("update:modelValue", !1), o(() => {
					C.modelValue && T.value && !T.value.open && T.value.showModal();
				}), w("closed");
			}
		}, j = e(() => C.closable ? C.closeOnClickMask ? "any" : "closerequest" : "none");
		m(() => C.modelValue, async (e) => {
			await o(), e ? T.value && !T.value.open && T.value.showModal() : T.value && T.value.open && T.value.close();
		});
		let M = () => {
			C.modelValue && T.value && !T.value.open && T.value.showModal();
		};
		return u(() => {
			M();
		}), c(() => {
			T.value && T.value.open && T.value.close();
		}), l(() => {
			T.value && T.value.open && (k.value = !0, T.value.close(), o(() => k.value = !1));
		}), s(() => {
			M();
		}), x({
			get: () => T.value,
			open: E,
			close: D
		}), (e, o) => (d(), n("dialog", a({
			ref_key: "dialogRef",
			ref: T,
			class: "_b4102a3b79656a37"
		}, e.$attrs, {
			onClose: A,
			onCancel: O,
			closedBy: j.value
		}), [
			i.showTitleBar ? (d(), n("div", _, [r("span", v, [p(e.$slots, "title")]), i.showCloseButton && i.closable ? (d(), n("button", {
				key: 0,
				type: "button",
				"aria-label": "Close the dialog",
				class: "_468ff1da37ead40a",
				onClick: h(D, ["prevent"])
			}, "×")) : t("", !0)])) : t("", !0),
			r("div", y, [p(e.$slots, "default")]),
			e.$slots.footer ? (d(), n("div", b, [p(e.$slots, "footer")])) : t("", !0)
		], 16, g));
	}
}), S = { install: (e) => {
	e.component("DialogView", x);
} };
//#endregion
export { x as DialogView, S as DialogViewPlugin, S as default };

//# sourceMappingURL=dialog-view.es.js.map