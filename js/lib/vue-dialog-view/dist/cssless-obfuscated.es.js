import { computed as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, defineComponent as i, inject as a, mergeProps as o, nextTick as s, onActivated as c, onBeforeUnmount as l, onDeactivated as u, onMounted as d, openBlock as f, ref as p, renderSlot as m, watch as h, withModifiers as g } from "vue";
var _ = p({ theme: "light" });
function v(e) {
	_.value = {
		..._.value,
		...e
	};
}
//#endregion
//#region src/DialogView.obf.vue?vue&type=script&setup=true&lang.ts
var y = ["data-theme", "closedBy"], b = {
	key: 0,
	class: "_4d394b1507fdc584"
}, x = { class: "_088d860d2fd75292" }, S = { class: "_0be228fb3f6dcf6a" }, C = { class: "_da3b3b2a4aeed1ee" }, w = {
	key: 1,
	class: "_61879ba330d9a71c"
}, T = /* @__PURE__ */ i({
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
			class: "_b4102a3b79656a37",
			"data-theme": z.value
		}, e.$attrs, {
			onClose: N,
			onCancel: j,
			closedBy: P.value
		}), [
			i.showTitleBar ? (f(), n("div", b, [r("span", x, [m(e.$slots, "title")]), i.showCloseButton && i.closable ? (f(), n("button", {
				key: 0,
				type: "button",
				"aria-label": "Close the dialog",
				class: "_468ff1da37ead40a",
				onClick: g(A, ["prevent"])
			}, "×")) : t("", !0)])) : t("", !0),
			r("div", S, [r("div", C, [m(e.$slots, "default")])]),
			e.$slots.footer ? (f(), n("div", w, [m(e.$slots, "footer")])) : t("", !0)
		], 16, y));
	}
}), E = { install: (e, t) => {
	t && e.provide("dialogViewConfig", t), e.component("DialogView", T);
} };
//#endregion
export { T as DialogView, E as DialogViewPlugin, E as default, _ as dialogViewConfig, v as setDialogViewConfig };

//# sourceMappingURL=cssless-obfuscated.es.js.map