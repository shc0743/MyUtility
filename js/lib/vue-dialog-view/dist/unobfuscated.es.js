(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".dialog-view[data-v-9220fede]{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}.dialog-view[open][data-v-9220fede]{display:flex;flex-direction:column}.dialog-view[data-v-9220fede]::backdrop{background:#00000080}.dialog-title-bar[data-v-9220fede]{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}.dialog-title[data-v-9220fede]{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}.dialog-close-button[data-v-9220fede]{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}.dialog-close-button[data-v-9220fede]:hover{color:#333;background-color:#f0f0f0;border-radius:3px}.dialog-close-button[data-v-9220fede]:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}.dialog-content[data-v-9220fede]{flex:1;overflow:auto;display:flex;flex-direction:column}.dialog-footer[data-v-9220fede]{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as w, ref as V, watch as h, nextTick as f, onMounted as y, createElementBlock as n, openBlock as i, mergeProps as B, createCommentVNode as d, createElementVNode as p, renderSlot as r, withModifiers as k } from "vue";
const C = {
  key: 0,
  class: "dialog-title-bar"
}, b = { class: "dialog-title" }, D = { class: "dialog-content" }, _ = {
  key: 1,
  class: "dialog-footer"
}, $ = /* @__PURE__ */ w({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "closed"],
  setup(o, { expose: u, emit: s }) {
    const l = o, a = s, e = V(null), v = () => {
      a("update:modelValue", !0);
    }, m = () => {
      a("update:modelValue", !1);
    }, g = () => {
      if (!l.closable && l.modelValue) {
        f(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      l.modelValue && a("update:modelValue", !1), a("closed");
    };
    return h(() => l.modelValue, async (t) => {
      await f(), t ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), y(() => {
      l.modelValue && e.value && !e.value.open && e.value.showModal();
    }), u({
      open: v,
      close: m
    }), (t, c) => (i(), n("dialog", B({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, t.$attrs, { onClose: g }), [
      o.showTitleBar ? (i(), n("div", C, [
        p("span", b, [
          r(t.$slots, "title", {}, void 0, !0)
        ]),
        o.showCloseButton && o.closable ? (i(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: c[0] || (c[0] = k((E) => e.value?.close(), ["prevent"]))
        }, "×")) : d("", !0)
      ])) : d("", !0),
      p("div", D, [
        r(t.$slots, "default", {}, void 0, !0)
      ]),
      t.$slots.footer ? (i(), n("div", _, [
        r(t.$slots, "footer", {}, void 0, !0)
      ])) : d("", !0)
    ], 16));
  }
}), M = (o, u) => {
  const s = o.__vccOpts || o;
  for (const [l, a] of u)
    s[l] = a;
  return s;
}, T = /* @__PURE__ */ M($, [["__scopeId", "data-v-9220fede"]]), P = {
  install: (o) => {
    o.component("DialogView", T);
  }
};
export {
  T as DialogView,
  P as DialogViewPlugin,
  P as default
};
//# sourceMappingURL=unobfuscated.es.js.map
