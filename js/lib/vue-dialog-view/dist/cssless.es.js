import { computed as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, defineComponent as i, mergeProps as a, nextTick as o, onActivated as s, onBeforeUnmount as c, onDeactivated as l, onMounted as u, openBlock as d, ref as f, renderSlot as p, watch as m, withModifiers as h } from "vue";
//#region src/DialogView.vue?vue&type=script&setup=true&lang.ts
var g = ["closedBy"], _ = {
	key: 0,
	class: "dialog-title-bar"
}, v = { class: "dialog-title" }, y = { class: "dialog-content" }, b = {
	key: 1,
	class: "dialog-footer"
}, x = /* @__PURE__ */ ((e, t) => {
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
			class: "dialog-view"
		}, e.$attrs, {
			onClose: A,
			onCancel: O,
			closedBy: j.value
		}), [
			i.showTitleBar ? (d(), n("div", _, [r("span", v, [p(e.$slots, "title", {}, void 0, !0)]), i.showCloseButton && i.closable ? (d(), n("button", {
				key: 0,
				type: "button",
				"aria-label": "Close the dialog",
				class: "dialog-close-button",
				onClick: h(D, ["prevent"])
			}, "×")) : t("", !0)])) : t("", !0),
			r("div", y, [p(e.$slots, "default", {}, void 0, !0)]),
			e.$slots.footer ? (d(), n("div", b, [p(e.$slots, "footer", {}, void 0, !0)])) : t("", !0)
		], 16, g));
	}
}), [["__scopeId", "data-v-7641dcfa"]]), S = { install: (e) => {
	e.component("DialogView", x);
} };
//#endregion
export { x as DialogView, S as DialogViewPlugin, S as default };

//# sourceMappingURL=cssless.es.js.map