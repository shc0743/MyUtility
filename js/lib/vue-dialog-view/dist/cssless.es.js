import { computed as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, defineComponent as i, inject as a, mergeProps as o, nextTick as s, onActivated as c, onBeforeUnmount as l, onDeactivated as u, onMounted as d, openBlock as f, ref as p, renderSlot as m, watch as h, withModifiers as g } from "vue";
var _ = p({ theme: "light" });
function v(e) {
	_.value = {
		..._.value,
		...e
	};
}
//#endregion
//#region src/DialogView.vue?vue&type=script&setup=true&lang.ts
var y = ["data-theme", "closedBy"], b = {
	key: 0,
	class: "dialog-title-bar"
}, x = { class: "dialog-title" }, S = { class: "dialog-content-wrapper" }, C = { class: "dialog-content" }, w = {
	key: 1,
	class: "dialog-footer"
}, T = /* @__PURE__ */ ((e, t) => {
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
		},
		theme: {}
	},
	emits: ["update:modelValue", "closed"],
	setup(i, { expose: v, emit: T }) {
		let E = i, D = T, O = p(), k = () => {
			D("update:modelValue", !0);
		}, A = () => {
			D("update:modelValue", !1);
		}, j = (e) => {
			e.preventDefault(), E.closable && A();
		}, M = p(!1), N = () => {
			if (!M.value) {
				if (!E.closable && E.modelValue) {
					s(() => {
						O.value && !O.value.open && O.value.showModal();
					});
					return;
				}
				E.modelValue && D("update:modelValue", !1), s(() => {
					E.modelValue && O.value && !O.value.open && O.value.showModal();
				}), D("closed");
			}
		}, P = e(() => E.closable ? E.closeOnClickMask ? "any" : "closerequest" : "none"), F = a("dialogViewConfig", void 0), I = p(!1), L = typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)") : null, R = null;
		L && (I.value = L.matches, R = (e) => {
			I.value = e.matches;
		}, L.addEventListener("change", R));
		let z = e(() => {
			let e = E.theme ?? F?.theme ?? _.value.theme ?? "light";
			return e === "auto" ? I.value ? "dark" : "light" : e;
		});
		h(() => E.modelValue, async (e) => {
			await s(), e ? O.value && !O.value.open && O.value.showModal() : O.value && O.value.open && O.value.close();
		});
		let B = () => {
			E.modelValue && O.value && !O.value.open && O.value.showModal();
		};
		return d(() => {
			B();
		}), l(() => {
			O.value && O.value.open && O.value.close(), L && R && L.removeEventListener("change", R);
		}), u(() => {
			O.value && O.value.open && (M.value = !0, O.value.close(), s(() => M.value = !1));
		}), c(() => {
			B();
		}), v({
			get: () => O.value,
			open: k,
			close: A
		}), (e, a) => (f(), n("dialog", o({
			ref_key: "dialogRef",
			ref: O,
			class: "dialog-view",
			"data-theme": z.value
		}, e.$attrs, {
			onClose: N,
			onCancel: j,
			closedBy: P.value
		}), [
			i.showTitleBar ? (f(), n("div", b, [r("span", x, [m(e.$slots, "title", {}, void 0, !0)]), i.showCloseButton && i.closable ? (f(), n("button", {
				key: 0,
				type: "button",
				"aria-label": "Close the dialog",
				class: "dialog-close-button",
				onClick: g(A, ["prevent"])
			}, "×")) : t("", !0)])) : t("", !0),
			r("div", S, [r("div", C, [m(e.$slots, "default", {}, void 0, !0)])]),
			e.$slots.footer ? (f(), n("div", w, [m(e.$slots, "footer", {}, void 0, !0)])) : t("", !0)
		], 16, y));
	}
}), [["__scopeId", "data-v-111c597e"]]), E = { install: (e, t) => {
	t && e.provide("dialogViewConfig", t), e.component("DialogView", T);
} };
//#endregion
export { T as DialogView, E as DialogViewPlugin, E as default, _ as dialogViewConfig, v as setDialogViewConfig };

//# sourceMappingURL=cssless.es.js.map