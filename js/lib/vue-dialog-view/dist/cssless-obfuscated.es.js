import { defineComponent as b, ref as g, computed as w, watch as y, nextTick as d, onMounted as B, onBeforeUnmount as k, openBlock as s, createElementBlock as n, mergeProps as C, createElementVNode as f, renderSlot as i, withModifiers as _, createCommentVNode as c } from "vue";
const D = ["closedBy"], M = {
  key: 0,
  class: "_4d394b1507fdc584"
}, $ = { class: "_088d860d2fd75292" }, T = { class: "_da3b3b2a4aeed1ee" }, E = {
  key: 1,
  class: "_61879ba330d9a71c"
}, N = /* @__PURE__ */ b({
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
    const o = a, t = p, e = g(), m = () => {
      t("update:modelValue", !0);
    }, u = () => {
      t("update:modelValue", !1);
    }, v = (l) => {
      l.preventDefault(), o.closable && u();
    }, h = () => {
      if (!o.closable && o.modelValue) {
        d(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      o.modelValue && t("update:modelValue", !1), d(() => {
        o.modelValue && e.value && !e.value.open && e.value.showModal();
      }), t("closed");
    }, V = w(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    return y(() => o.modelValue, async (l) => {
      await d(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), B(() => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    }), k(() => {
      e.value && e.value.open && e.value.close();
    }), r({
      get: () => e.value,
      open: m,
      close: u
    }), (l, O) => (s(), n("dialog", C({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, l.$attrs, {
      onClose: h,
      onCancel: v,
      closedBy: V.value
    }), [
      a.showTitleBar ? (s(), n("div", M, [
        f("span", $, [
          i(l.$slots, "title")
        ]),
        a.showCloseButton && a.closable ? (s(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: _(u, ["prevent"])
        }, "×")) : c("", !0)
      ])) : c("", !0),
      f("div", T, [
        i(l.$slots, "default")
      ]),
      l.$slots.footer ? (s(), n("div", E, [
        i(l.$slots, "footer")
      ])) : c("", !0)
    ], 16, D));
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
