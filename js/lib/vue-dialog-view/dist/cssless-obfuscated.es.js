import { defineComponent as y, ref as v, computed as B, watch as C, nextTick as s, onMounted as k, onBeforeUnmount as _, onDeactivated as D, onActivated as M, openBlock as n, createElementBlock as u, mergeProps as $, createElementVNode as p, renderSlot as c, withModifiers as E, createCommentVNode as f } from "vue";
const T = ["closedBy"], N = {
  key: 0,
  class: "_4d394b1507fdc584"
}, O = { class: "_088d860d2fd75292" }, P = { class: "_da3b3b2a4aeed1ee" }, R = {
  key: 1,
  class: "_61879ba330d9a71c"
}, q = /* @__PURE__ */ y({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 },
    closeOnClickMask: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "closed"],
  setup(a, { expose: m, emit: h }) {
    const o = a, t = h, e = v(), g = () => {
      t("update:modelValue", !0);
    }, i = () => {
      t("update:modelValue", !1);
    }, V = (l) => {
      l.preventDefault(), o.closable && i();
    }, d = v(!1), b = () => {
      if (!d.value) {
        if (!o.closable && o.modelValue) {
          s(() => {
            e.value && !e.value.open && e.value.showModal();
          });
          return;
        }
        o.modelValue && t("update:modelValue", !1), s(() => {
          o.modelValue && e.value && !e.value.open && e.value.showModal();
        }), t("closed");
      }
    }, w = B(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    C(() => o.modelValue, async (l) => {
      await s(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    });
    const r = () => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    };
    return k(() => {
      r();
    }), _(() => {
      e.value && e.value.open && e.value.close();
    }), D(() => {
      e.value && e.value.open && (d.value = !0, e.value.close(), s(() => d.value = !1));
    }), M(() => {
      r();
    }), m({
      get: () => e.value,
      open: g,
      close: i
    }), (l, A) => (n(), u("dialog", $({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, l.$attrs, {
      onClose: b,
      onCancel: V,
      closedBy: w.value
    }), [
      a.showTitleBar ? (n(), u("div", N, [
        p("span", O, [
          c(l.$slots, "title")
        ]),
        a.showCloseButton && a.closable ? (n(), u("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: E(i, ["prevent"])
        }, "×")) : f("", !0)
      ])) : f("", !0),
      p("div", P, [
        c(l.$slots, "default")
      ]),
      l.$slots.footer ? (n(), u("div", R, [
        c(l.$slots, "footer")
      ])) : f("", !0)
    ], 16, T));
  }
}), U = {
  install: (a) => {
    a.component("DialogView", q);
  }
};
export {
  q as DialogView,
  U as DialogViewPlugin,
  U as default
};
//# sourceMappingURL=cssless-obfuscated.es.js.map
