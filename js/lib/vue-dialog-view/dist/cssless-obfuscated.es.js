import { defineComponent as h, ref as w, watch as b, nextTick as r, onMounted as g, createElementBlock as t, openBlock as s, mergeProps as y, createCommentVNode as d, createElementVNode as c, renderSlot as i, withModifiers as B } from "vue";
const k = {
  key: 0,
  class: "_4d394b1507fdc584"
}, C = { class: "_088d860d2fd75292" }, _ = { class: "_da3b3b2a4aeed1ee" }, D = {
  key: 1,
  class: "_61879ba330d9a71c"
}, $ = /* @__PURE__ */ h({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(l, { expose: f, emit: m }) {
    const a = l, n = m, e = w(null), p = () => {
      n("update:modelValue", !0);
    }, v = () => {
      n("update:modelValue", !1);
    }, V = () => {
      if (!a.closable && a.modelValue) {
        r(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      a.modelValue && n("update:modelValue", !1);
    };
    return b(() => a.modelValue, async (o) => {
      await r(), o ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), g(() => {
      a.modelValue && e.value && !e.value.open && e.value.showModal();
    }), f({
      open: p,
      close: v
    }), (o, u) => (s(), t("dialog", y({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, o.$attrs, { onClose: V }), [
      l.showTitleBar ? (s(), t("div", k, [
        c("span", C, [
          i(o.$slots, "title")
        ]),
        l.showCloseButton && l.closable ? (s(), t("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: u[0] || (u[0] = B((M) => e.value?.close(), ["prevent"]))
        }, "×")) : d("", !0)
      ])) : d("", !0),
      c("div", _, [
        i(o.$slots, "default")
      ]),
      o.$slots.footer ? (s(), t("div", D, [
        i(o.$slots, "footer")
      ])) : d("", !0)
    ], 16));
  }
}), E = {
  install: (l) => {
    l.component("DialogView", $);
  }
};
export {
  $ as DialogView,
  E as DialogViewPlugin,
  E as default
};
//# sourceMappingURL=cssless-obfuscated.es.js.map
