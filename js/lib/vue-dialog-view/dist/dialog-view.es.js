(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:20px;border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:24px;white-space:pre;overflow:hidden}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as v, ref as h, watch as g, nextTick as w, createElementBlock as a, openBlock as t, mergeProps as V, createCommentVNode as i, createElementVNode as d, renderSlot as u, withModifiers as _ } from "vue";
const B = {
  key: 0,
  class: "_4d394b1507fdc584"
}, b = { class: "_088d860d2fd75292" }, C = { class: "_da3b3b2a4aeed1ee" }, k = /* @__PURE__ */ v({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(o, { expose: c, emit: r }) {
    const s = o, f = r, e = h(null), p = () => {
      e.value && !e.value.open && e.value.showModal();
    }, n = () => {
      e.value && e.value.open && e.value.close();
    }, m = () => {
      s.modelValue && f("update:modelValue", !1);
    };
    return g(() => s.modelValue, async (l) => {
      await w(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), c({
      open: p,
      close: n
    }), (l, y) => (t(), a("dialog", V({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, l.$attrs, { onClose: m }), [
      o.showTitleBar ? (t(), a("div", B, [
        d("span", b, [
          u(l.$slots, "title")
        ]),
        o.showCloseButton ? (t(), a("a", {
          key: 0,
          href: "javascript:void(0)",
          role: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: _(n, ["prevent"])
        }, "×")) : i("", !0)
      ])) : i("", !0),
      d("div", C, [
        u(l.$slots, "default")
      ])
    ], 16));
  }
}), M = {
  install: (o) => {
    o.component("DialogView", k);
  }
};
export {
  k as DialogView,
  M as DialogViewPlugin,
  M as default
};
//# sourceMappingURL=dialog-view.es.js.map
