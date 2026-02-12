import { defineComponent as V, ref as h, computed as y, watch as B, nextTick as f, onMounted as _, createElementBlock as n, openBlock as i, mergeProps as b, createCommentVNode as u, createElementVNode as p, renderSlot as c, withModifiers as k } from "vue";
const C = ["closedBy"], D = {
  key: 0,
  class: "dialog-title-bar"
}, $ = { class: "dialog-title" }, M = { class: "dialog-content" }, T = {
  key: 1,
  class: "dialog-footer"
}, E = /* @__PURE__ */ V({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "closed"],
  setup(o, { expose: d, emit: s }) {
    const l = o, a = s, e = h(null), v = () => {
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
    }, w = y(() => l.closable ? "any" : "none");
    return B(() => l.modelValue, async (t) => {
      await f(), t ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), _(() => {
      l.modelValue && e.value && !e.value.open && e.value.showModal();
    }), d({
      open: v,
      close: m
    }), (t, r) => (i(), n("dialog", b({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, t.$attrs, {
      onClose: g,
      closedBy: w.value
    }), [
      o.showTitleBar ? (i(), n("div", D, [
        p("span", $, [
          c(t.$slots, "title", {}, void 0, !0)
        ]),
        o.showCloseButton && o.closable ? (i(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: r[0] || (r[0] = k((R) => e.value?.close(), ["prevent"]))
        }, "×")) : u("", !0)
      ])) : u("", !0),
      p("div", M, [
        c(t.$slots, "default", {}, void 0, !0)
      ]),
      t.$slots.footer ? (i(), n("div", T, [
        c(t.$slots, "footer", {}, void 0, !0)
      ])) : u("", !0)
    ], 16, C));
  }
}), N = (o, d) => {
  const s = o.__vccOpts || o;
  for (const [l, a] of d)
    s[l] = a;
  return s;
}, P = /* @__PURE__ */ N(E, [["__scopeId", "data-v-0f9a763c"]]), O = {
  install: (o) => {
    o.component("DialogView", P);
  }
};
export {
  P as DialogView,
  O as DialogViewPlugin,
  O as default
};
//# sourceMappingURL=cssless.es.js.map
