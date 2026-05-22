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

//# sourceMappingURL=cssless.es.js.map