(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:20px;border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:24px;white-space:pre;overflow:hidden}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as V, ref as g, watch as w, nextTick as r, createElementBlock as t, openBlock as s, mergeProps as b, createCommentVNode as i, createElementVNode as c, renderSlot as d, withModifiers as B } from "vue";
const _ = {
  key: 0,
  class: "_4d394b1507fdc584"
}, y = { class: "_088d860d2fd75292" }, k = { class: "_da3b3b2a4aeed1ee" }, C = {
  key: 1,
  class: "_61879ba330d9a71c"
}, D = /* @__PURE__ */ V({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(l, { expose: f, emit: p }) {
    const a = l, n = p, e = g(null), m = () => {
      n("update:modelValue", !0);
    }, v = () => {
      n("update:modelValue", !1);
    }, h = () => {
      if (!a.closable && a.modelValue) {
        r(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      a.modelValue && n("update:modelValue", !1);
    };
    return w(() => a.modelValue, async (o) => {
      await r(), o ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), f({
      open: m,
      close: v
    }), (o, u) => (s(), t("dialog", b({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, o.$attrs, { onClose: h }), [
      l.showTitleBar ? (s(), t("div", _, [
        c("span", y, [
          d(o.$slots, "title")
        ]),
        l.showCloseButton ? (s(), t("a", {
          key: 0,
          href: "javascript:void(0)",
          role: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: u[0] || (u[0] = B(($) => e.value?.close(), ["prevent"]))
        }, "×")) : i("", !0)
      ])) : i("", !0),
      c("div", k, [
        d(o.$slots, "default")
      ]),
      o.$slots.footer ? (s(), t("div", C, [
        d(o.$slots, "footer")
      ])) : i("", !0)
    ], 16));
  }
}), T = {
  install: (l) => {
    l.component("DialogView", D);
  }
};
export {
  D as DialogView,
  T as DialogViewPlugin,
  T as default
};
//# sourceMappingURL=dialog-view.es.js.map
