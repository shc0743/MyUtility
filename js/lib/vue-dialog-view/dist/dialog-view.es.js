(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".dialog-view[data-v-1ca83b6e]{padding:20px;border-radius:5px;border:1px solid gray;outline:0!important}.dialog-view[open][data-v-1ca83b6e]{display:flex;flex-direction:column;position:fixed;margin:auto;max-width:90vw;max-height:90vh}.dialog-view[data-v-1ca83b6e]::backdrop{background:#00000080}.dialog-title-bar[data-v-1ca83b6e]{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:24px}.dialog-title[data-v-1ca83b6e]{flex:1;text-align:center;font-weight:700;font-size:1.1em}.dialog-close-button[data-v-1ca83b6e]{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}.dialog-close-button[data-v-1ca83b6e]:hover{color:#333;background-color:#f0f0f0;border-radius:3px}.dialog-content[data-v-1ca83b6e]{flex:1;overflow:auto;display:flex;flex-direction:column}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
import { defineComponent as g, ref as h, watch as w, nextTick as _, createElementBlock as n, openBlock as c, mergeProps as V, createCommentVNode as r, createElementVNode as u, renderSlot as p, withModifiers as B } from "vue";
const k = {
  key: 0,
  class: "dialog-title-bar"
}, y = { class: "dialog-title" }, C = { class: "dialog-content" }, D = /* @__PURE__ */ g({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(o, { expose: s, emit: t }) {
    const a = o, i = t, e = h(null), v = () => {
      e.value && !e.value.open && e.value.showModal();
    }, d = () => {
      e.value && e.value.open && e.value.close();
    }, m = () => {
      a.modelValue && i("update:modelValue", !1);
    };
    return w(() => a.modelValue, async (l) => {
      await _(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), s({
      open: v,
      close: d
    }), (l, M) => (c(), n("dialog", V({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, l.$attrs, { onClose: m }), [
      o.showTitleBar ? (c(), n("div", k, [
        u("span", y, [
          p(l.$slots, "title", {}, void 0, !0)
        ]),
        o.showCloseButton ? (c(), n("a", {
          key: 0,
          href: "javascript:void(0)",
          role: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: B(d, ["prevent"])
        }, "×")) : r("", !0)
      ])) : r("", !0),
      u("div", C, [
        p(l.$slots, "default", {}, void 0, !0)
      ])
    ], 16));
  }
}), b = (o, s) => {
  const t = o.__vccOpts || o;
  for (const [a, i] of s)
    t[a] = i;
  return t;
}, f = /* @__PURE__ */ b(D, [["__scopeId", "data-v-1ca83b6e"]]);
f.install = (o) => {
  o.component("DialogView", f);
};
export {
  f as default
};
