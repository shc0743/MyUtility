(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._468ff1da37ead40a:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as b, ref as w, computed as y, watch as g, nextTick as c, onMounted as B, createElementBlock as s, openBlock as n, mergeProps as _, createCommentVNode as d, createElementVNode as r, renderSlot as u, withModifiers as k } from "vue";
const C = ["closedBy"], D = {
  key: 0,
  class: "_4d394b1507fdc584"
}, $ = { class: "_088d860d2fd75292" }, M = { class: "_da3b3b2a4aeed1ee" }, T = {
  key: 1,
  class: "_61879ba330d9a71c"
}, E = /* @__PURE__ */ b({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "closed"],
  setup(l, { expose: f, emit: m }) {
    const a = l, t = m, e = w(null), p = () => {
      t("update:modelValue", !0);
    }, v = () => {
      t("update:modelValue", !1);
    }, h = () => {
      if (!a.closable && a.modelValue) {
        c(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      a.modelValue && t("update:modelValue", !1), t("closed");
    }, V = y(() => a.closable ? "any" : "none");
    return g(() => a.modelValue, async (o) => {
      await c(), o ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), B(() => {
      a.modelValue && e.value && !e.value.open && e.value.showModal();
    }), f({
      open: p,
      close: v
    }), (o, i) => (n(), s("dialog", _({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, o.$attrs, {
      onClose: h,
      closedBy: V.value
    }), [
      l.showTitleBar ? (n(), s("div", D, [
        r("span", $, [
          u(o.$slots, "title")
        ]),
        l.showCloseButton && l.closable ? (n(), s("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: i[0] || (i[0] = k((N) => e.value?.close(), ["prevent"]))
        }, "×")) : d("", !0)
      ])) : d("", !0),
      r("div", M, [
        u(o.$slots, "default")
      ]),
      o.$slots.footer ? (n(), s("div", T, [
        u(o.$slots, "footer")
      ])) : d("", !0)
    ], 16, C));
  }
}), R = {
  install: (l) => {
    l.component("DialogView", E);
  }
};
export {
  E as DialogView,
  R as DialogViewPlugin,
  R as default
};
//# sourceMappingURL=dialog-view.es.js.map
