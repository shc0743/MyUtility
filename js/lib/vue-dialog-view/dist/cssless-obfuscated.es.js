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

//# sourceMappingURL=cssless-obfuscated.es.js.map