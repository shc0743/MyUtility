import { defineComponent as w, ref as V, computed as y, watch as B, nextTick as c, onMounted as k, onBeforeUnmount as C, openBlock as n, createElementBlock as i, mergeProps as _, createElementVNode as p, renderSlot as r, withModifiers as b, createCommentVNode as f } from "vue";
const D = ["closedBy"], M = {
  key: 0,
  class: "dialog-title-bar"
}, $ = { class: "dialog-title" }, O = { class: "dialog-content" }, T = {
  key: 1,
  class: "dialog-footer"
}, E = /* @__PURE__ */ w({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 },
    closeOnClickMask: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "closed"],
  setup(l, { expose: u, emit: s }) {
    const o = l, t = s, e = V(), v = () => {
      t("update:modelValue", !0);
    }, d = () => {
      t("update:modelValue", !1);
    }, m = (a) => {
      a.preventDefault(), o.closable && d();
    }, g = () => {
      if (!o.closable && o.modelValue) {
        c(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      o.modelValue && t("update:modelValue", !1), c(() => {
        o.modelValue && e.value && !e.value.open && e.value.showModal();
      }), t("closed");
    }, h = y(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    return B(() => o.modelValue, async (a) => {
      await c(), a ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), k(() => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    }), C(() => {
      e.value && e.value.open && e.value.close();
    }), u({
      get: () => e.value,
      open: v,
      close: d
    }), (a, R) => (n(), i("dialog", _({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, a.$attrs, {
      onClose: g,
      onCancel: m,
      closedBy: h.value
    }), [
      l.showTitleBar ? (n(), i("div", M, [
        p("span", $, [
          r(a.$slots, "title", {}, void 0, !0)
        ]),
        l.showCloseButton && l.closable ? (n(), i("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: b(d, ["prevent"])
        }, "×")) : f("", !0)
      ])) : f("", !0),
      p("div", O, [
        r(a.$slots, "default", {}, void 0, !0)
      ]),
      a.$slots.footer ? (n(), i("div", T, [
        r(a.$slots, "footer", {}, void 0, !0)
      ])) : f("", !0)
    ], 16, D));
  }
}), N = (l, u) => {
  const s = l.__vccOpts || l;
  for (const [o, t] of u)
    s[o] = t;
  return s;
}, P = /* @__PURE__ */ N(E, [["__scopeId", "data-v-da4085e6"]]), I = {
  install: (l) => {
    l.component("DialogView", P);
  }
};
export {
  P as DialogView,
  I as DialogViewPlugin,
  I as default
};
//# sourceMappingURL=cssless.es.js.map
