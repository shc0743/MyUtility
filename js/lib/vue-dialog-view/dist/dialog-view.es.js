(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis;display:flex;flex-direction:row}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._468ff1da37ead40a:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
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
//# sourceMappingURL=dialog-view.es.js.map
