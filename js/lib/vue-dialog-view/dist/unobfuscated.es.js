(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".dialog-view[data-v-0f9a763c]{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}.dialog-view[open][data-v-0f9a763c]{display:flex;flex-direction:column}.dialog-view[data-v-0f9a763c]::backdrop{background:#00000080}.dialog-title-bar[data-v-0f9a763c]{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}.dialog-title[data-v-0f9a763c]{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}.dialog-close-button[data-v-0f9a763c]{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}.dialog-close-button[data-v-0f9a763c]:hover{color:#333;background-color:#f0f0f0;border-radius:3px}.dialog-close-button[data-v-0f9a763c]:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}.dialog-content[data-v-0f9a763c]{flex:1;overflow:auto;display:flex;flex-direction:column}.dialog-footer[data-v-0f9a763c]{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as V, ref as h, computed as y, watch as B, nextTick as f, onMounted as _, createElementBlock as n, openBlock as i, mergeProps as b, createCommentVNode as u, createElementVNode as p, renderSlot as c, withModifiers as k } from "vue";
const C = ["closedBy"], D = {
  key: 0,
  class: "dialog-title-bar"
}, $ = { class: "dialog-title" }, M = { class: "dialog-content" }, T = {
  key: 1,
  class: "dialog-footer"
}, E = /* @__PURE__ */ V({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "closed"],
  setup(o, { expose: d, emit: s }) {
    const l = o, a = s, e = h(null), v = () => {
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
    }, w = y(() => l.closable ? "any" : "none");
    return B(() => l.modelValue, async (t) => {
      await f(), t ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), _(() => {
      l.modelValue && e.value && !e.value.open && e.value.showModal();
    }), d({
      open: v,
      close: m
    }), (t, r) => (i(), n("dialog", b({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, t.$attrs, {
      onClose: g,
      closedBy: w.value
    }), [
      o.showTitleBar ? (i(), n("div", D, [
        p("span", $, [
          c(t.$slots, "title", {}, void 0, !0)
        ]),
        o.showCloseButton && o.closable ? (i(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: r[0] || (r[0] = k((R) => e.value?.close(), ["prevent"]))
        }, "×")) : u("", !0)
      ])) : u("", !0),
      p("div", M, [
        c(t.$slots, "default", {}, void 0, !0)
      ]),
      t.$slots.footer ? (i(), n("div", T, [
        c(t.$slots, "footer", {}, void 0, !0)
      ])) : u("", !0)
    ], 16, C));
  }
}), N = (o, d) => {
  const s = o.__vccOpts || o;
  for (const [l, a] of d)
    s[l] = a;
  return s;
}, P = /* @__PURE__ */ N(E, [["__scopeId", "data-v-0f9a763c"]]), O = {
  install: (o) => {
    o.component("DialogView", P);
  }
};
export {
  P as DialogView,
  O as DialogViewPlugin,
  O as default
};
//# sourceMappingURL=unobfuscated.es.js.map
