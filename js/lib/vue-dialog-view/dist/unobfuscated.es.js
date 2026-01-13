(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".dialog-view{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}.dialog-view[open]{display:flex;flex-direction:column}.dialog-view::backdrop{background:#00000080}.dialog-title-bar{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}.dialog-title{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}.dialog-close-button{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}.dialog-close-button:hover{color:#333;background-color:#f0f0f0;border-radius:3px}.dialog-close-button:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}.dialog-content{flex:1;overflow:auto;display:flex;flex-direction:column}.dialog-footer{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as w, ref as V, watch as h, nextTick as r, onMounted as y, createElementBlock as a, openBlock as s, mergeProps as B, createCommentVNode as n, createElementVNode as c, renderSlot as u, withModifiers as b } from "vue";
const k = {
  key: 0,
  class: "dialog-title-bar"
}, C = { class: "dialog-title" }, D = { class: "dialog-content" }, $ = {
  key: 1,
  class: "dialog-footer"
}, M = /* @__PURE__ */ w({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(l, { expose: f, emit: m }) {
    const t = l, i = m, e = V(null), p = () => {
      i("update:modelValue", !0);
    }, g = () => {
      i("update:modelValue", !1);
    }, v = () => {
      if (!t.closable && t.modelValue) {
        r(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      t.modelValue && i("update:modelValue", !1);
    };
    return h(() => t.modelValue, async (o) => {
      await r(), o ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), y(() => {
      t.modelValue && e.value && !e.value.open && e.value.showModal();
    }), f({
      open: p,
      close: g
    }), (o, d) => (s(), a("dialog", B({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, o.$attrs, { onClose: v }), [
      l.showTitleBar ? (s(), a("div", k, [
        c("span", C, [
          u(o.$slots, "title")
        ]),
        l.showCloseButton && l.closable ? (s(), a("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: d[0] || (d[0] = b((T) => e.value?.close(), ["prevent"]))
        }, "×")) : n("", !0)
      ])) : n("", !0),
      c("div", D, [
        u(o.$slots, "default")
      ]),
      o.$slots.footer ? (s(), a("div", $, [
        u(o.$slots, "footer")
      ])) : n("", !0)
    ], 16));
  }
}), N = {
  install: (l) => {
    l.component("DialogView", M);
  }
};
export {
  M as DialogView,
  N as DialogViewPlugin,
  N as default
};
//# sourceMappingURL=unobfuscated.es.js.map
