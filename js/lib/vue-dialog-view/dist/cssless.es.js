import { defineComponent as y, ref as V, computed as h, watch as B, nextTick as f, onMounted as k, createElementBlock as n, openBlock as i, mergeProps as C, createCommentVNode as u, createElementVNode as p, renderSlot as c, withModifiers as _ } from "vue";
const b = ["closedBy"], D = {
  key: 0,
  class: "dialog-title-bar"
}, M = { class: "dialog-title" }, $ = { class: "dialog-content" }, O = {
  key: 1,
  class: "dialog-footer"
}, T = /* @__PURE__ */ y({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 },
    closeOnClickMask: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "closed"],
  setup(o, { expose: d, emit: s }) {
    const l = o, a = s, e = V(null), v = () => {
      a("update:modelValue", !0);
    }, m = () => {
      a("update:modelValue", !1);
    }, g = () => {
      if (!l.closable && l.modelValue) {
        f(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      l.modelValue && a("update:modelValue", !1), a("closed");
    }, w = h(() => l.closable ? l.closeOnClickMask ? "any" : "closerequest" : "none");
    return B(() => l.modelValue, async (t) => {
      await f(), t ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), k(() => {
      l.modelValue && e.value && !e.value.open && e.value.showModal();
    }), d({
      open: v,
      close: m
    }), (t, r) => (i(), n("dialog", C({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, t.$attrs, {
      onClose: g,
      closedBy: w.value
    }), [
      o.showTitleBar ? (i(), n("div", D, [
        p("span", M, [
          c(t.$slots, "title", {}, void 0, !0)
        ]),
        o.showCloseButton && o.closable ? (i(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: r[0] || (r[0] = _((P) => e.value?.close(), ["prevent"]))
        }, "×")) : u("", !0)
      ])) : u("", !0),
      p("div", $, [
        c(t.$slots, "default", {}, void 0, !0)
      ]),
      t.$slots.footer ? (i(), n("div", O, [
        c(t.$slots, "footer", {}, void 0, !0)
      ])) : u("", !0)
    ], 16, b));
  }
}), E = (o, d) => {
  const s = o.__vccOpts || o;
  for (const [l, a] of d)
    s[l] = a;
  return s;
}, N = /* @__PURE__ */ E(T, [["__scopeId", "data-v-63828377"]]), q = {
  install: (o) => {
    o.component("DialogView", N);
  }
};
export {
  N as DialogView,
  q as DialogViewPlugin,
  q as default
};
//# sourceMappingURL=cssless.es.js.map
