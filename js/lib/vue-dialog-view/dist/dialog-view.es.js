(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:20px;border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:24px;white-space:pre;overflow:hidden}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as v, ref as V, watch as g, nextTick as r, createElementBlock as t, openBlock as s, mergeProps as w, createCommentVNode as n, createElementVNode as c, renderSlot as d, withModifiers as _ } from "vue";
const b = {
  key: 0,
  class: "_4d394b1507fdc584"
}, B = { class: "_088d860d2fd75292" }, y = { class: "_da3b3b2a4aeed1ee" }, k = {
  key: 1,
  class: "_61879ba330d9a71c"
}, C = /* @__PURE__ */ v({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(l, { expose: f, emit: p }) {
    const a = l, i = p, e = V(null), m = () => {
      i("update:modelValue", !0);
    }, u = () => {
      i("update:modelValue", !1);
    }, h = () => {
      if (!a.closable && a.modelValue) {
        r(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      a.modelValue && i("update:modelValue", !1);
    };
    return g(() => a.modelValue, async (o) => {
      await r(), o ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), f({
      open: m,
      close: u
    }), (o, D) => (s(), t("dialog", w({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, o.$attrs, { onClose: h }), [
      l.showTitleBar ? (s(), t("div", b, [
        c("span", B, [
          d(o.$slots, "title")
        ]),
        l.showCloseButton ? (s(), t("a", {
          key: 0,
          href: "javascript:void(0)",
          role: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: _(u, ["prevent"])
        }, "×")) : n("", !0)
      ])) : n("", !0),
      c("div", y, [
        d(o.$slots, "default")
      ]),
      o.$slots.footer ? (s(), t("div", k, [
        d(o.$slots, "footer")
      ])) : n("", !0)
    ], 16));
  }
}), M = {
  install: (l) => {
    l.component("DialogView", C);
  }
};
export {
  C as DialogView,
  M as DialogViewPlugin,
  M as default
};
//# sourceMappingURL=dialog-view.es.js.map
