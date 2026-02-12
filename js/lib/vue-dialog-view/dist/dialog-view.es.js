(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._468ff1da37ead40a:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as V, ref as b, computed as w, watch as B, nextTick as c, onMounted as g, createElementBlock as s, openBlock as n, mergeProps as k, createCommentVNode as d, createElementVNode as f, renderSlot as u, withModifiers as C } from "vue";
const _ = ["closedBy"], D = {
  key: 0,
  class: "_4d394b1507fdc584"
}, M = { class: "_088d860d2fd75292" }, $ = { class: "_da3b3b2a4aeed1ee" }, T = {
  key: 1,
  class: "_61879ba330d9a71c"
}, E = /* @__PURE__ */ V({
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
    const o = a, t = p, e = b(null), m = () => {
      t("update:modelValue", !0);
    }, v = () => {
      t("update:modelValue", !1);
    }, h = () => {
      if (!o.closable && o.modelValue) {
        c(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      o.modelValue && t("update:modelValue", !1), t("closed");
    }, y = w(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    return B(() => o.modelValue, async (l) => {
      await c(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), g(() => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    }), r({
      open: m,
      close: v
    }), (l, i) => (n(), s("dialog", k({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, l.$attrs, {
      onClose: h,
      closedBy: y.value
    }), [
      a.showTitleBar ? (n(), s("div", D, [
        f("span", M, [
          u(l.$slots, "title")
        ]),
        a.showCloseButton && a.closable ? (n(), s("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: i[0] || (i[0] = C((N) => e.value?.close(), ["prevent"]))
        }, "×")) : d("", !0)
      ])) : d("", !0),
      f("div", $, [
        u(l.$slots, "default")
      ]),
      l.$slots.footer ? (n(), s("div", T, [
        u(l.$slots, "footer")
      ])) : d("", !0)
    ], 16, _));
  }
}), P = {
  install: (a) => {
    a.component("DialogView", E);
  }
};
export {
  E as DialogView,
  P as DialogViewPlugin,
  P as default
};
//# sourceMappingURL=dialog-view.es.js.map
