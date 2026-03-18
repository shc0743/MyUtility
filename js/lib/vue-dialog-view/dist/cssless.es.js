import { defineComponent as V, ref as h, computed as y, watch as B, nextTick as d, onMounted as k, onBeforeUnmount as C, openBlock as n, createElementBlock as i, mergeProps as _, createElementVNode as v, renderSlot as c, withModifiers as b, createCommentVNode as r } from "vue";
const D = ["closedBy"], M = {
  key: 0,
  class: "dialog-title-bar"
}, $ = { class: "dialog-title" }, O = { class: "dialog-content" }, T = {
  key: 1,
  class: "dialog-footer"
}, E = /* @__PURE__ */ V({
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
    const o = l, a = s, e = h(null), p = () => {
      a("update:modelValue", !0);
    }, m = () => {
      a("update:modelValue", !1);
    }, g = () => {
      if (!o.closable && o.modelValue) {
        d(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      o.modelValue && a("update:modelValue", !1), d(() => {
        o.modelValue && e.value && !e.value.open && e.value.showModal();
      }), a("closed");
    }, w = y(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    return B(() => o.modelValue, async (t) => {
      await d(), t ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), k(() => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    }), C(() => {
      e.value && e.value.open && e.value.close();
    }), u({
      open: p,
      close: m
    }), (t, f) => (n(), i("dialog", _({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, t.$attrs, {
      onClose: g,
      closedBy: w.value
    }), [
      l.showTitleBar ? (n(), i("div", M, [
        v("span", $, [
          c(t.$slots, "title", {}, void 0, !0)
        ]),
        l.showCloseButton && l.closable ? (n(), i("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: f[0] || (f[0] = b((R) => e.value?.close(), ["prevent"]))
        }, "×")) : r("", !0)
      ])) : r("", !0),
      v("div", O, [
        c(t.$slots, "default", {}, void 0, !0)
      ]),
      t.$slots.footer ? (n(), i("div", T, [
        c(t.$slots, "footer", {}, void 0, !0)
      ])) : r("", !0)
    ], 16, D));
  }
}), N = (l, u) => {
  const s = l.__vccOpts || l;
  for (const [o, a] of u)
    s[o] = a;
  return s;
}, P = /* @__PURE__ */ N(E, [["__scopeId", "data-v-81c5d076"]]), I = {
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
