import { defineComponent as w, ref as y, computed as B, watch as b, nextTick as u, onMounted as g, onBeforeUnmount as k, openBlock as s, createElementBlock as n, mergeProps as C, createElementVNode as f, renderSlot as d, withModifiers as _, createCommentVNode as i } from "vue";
const M = ["closedBy"], D = {
  key: 0,
  class: "_4d394b1507fdc584"
}, $ = { class: "_088d860d2fd75292" }, T = { class: "_da3b3b2a4aeed1ee" }, E = {
  key: 1,
  class: "_61879ba330d9a71c"
}, N = /* @__PURE__ */ w({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 },
    closeOnClickMask: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "closed"],
  setup(a, { expose: r, emit: p }) {
    const o = a, t = p, e = y(null), m = () => {
      t("update:modelValue", !0);
    }, v = () => {
      t("update:modelValue", !1);
    }, h = () => {
      if (!o.closable && o.modelValue) {
        u(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      o.modelValue && t("update:modelValue", !1), u(() => {
        o.modelValue && e.value && !e.value.open && e.value.showModal();
      }), t("closed");
    }, V = B(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    return b(() => o.modelValue, async (l) => {
      await u(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), g(() => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    }), k(() => {
      e.value && e.value.open && e.value.close();
    }), r({
      open: m,
      close: v
    }), (l, c) => (s(), n("dialog", C({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, l.$attrs, {
      onClose: h,
      closedBy: V.value
    }), [
      a.showTitleBar ? (s(), n("div", D, [
        f("span", $, [
          d(l.$slots, "title")
        ]),
        a.showCloseButton && a.closable ? (s(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: c[0] || (c[0] = _((O) => e.value?.close(), ["prevent"]))
        }, "×")) : i("", !0)
      ])) : i("", !0),
      f("div", T, [
        d(l.$slots, "default")
      ]),
      l.$slots.footer ? (s(), n("div", E, [
        d(l.$slots, "footer")
      ])) : i("", !0)
    ], 16, M));
  }
}), R = {
  install: (a) => {
    a.component("DialogView", N);
  }
};
export {
  N as DialogView,
  R as DialogViewPlugin,
  R as default
};
//# sourceMappingURL=cssless-obfuscated.es.js.map
