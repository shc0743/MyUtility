(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._468ff1da37ead40a:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
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
//# sourceMappingURL=dialog-view.es.js.map
