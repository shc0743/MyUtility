(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._b4102a3b79656a37{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._b4102a3b79656a37[open]{display:flex;flex-direction:column}._b4102a3b79656a37::backdrop{background:#00000080}._4d394b1507fdc584{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}._088d860d2fd75292{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._468ff1da37ead40a{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._468ff1da37ead40a:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._468ff1da37ead40a:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}._da3b3b2a4aeed1ee{flex:1;overflow:auto;display:flex;flex-direction:column}._61879ba330d9a71c{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as w, ref as y, computed as B, watch as b, nextTick as u, onMounted as g, onBeforeUnmount as k, openBlock as s, createElementBlock as n, mergeProps as C, createElementVNode as f, renderSlot as d, withModifiers as _, createCommentVNode as i } from "vue";
const M = ["closedBy"], D = {
  key: 0,
  class: "_4d394b1507fdc584"
}, $ = { class: "_088d860d2fd75292" }, T = { class: "_da3b3b2a4aeed1ee" }, E = {
  key: 1,
  class: "_61879ba330d9a71c"
}, N = /* @__PURE__ */ w({
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
    const o = a, t = p, e = y(null), m = () => {
      t("update:modelValue", !0);
    }, v = () => {
      t("update:modelValue", !1);
    }, h = () => {
      if (!o.closable && o.modelValue) {
        u(() => {
          e.value && !e.value.open && e.value.showModal();
        });
        return;
      }
      o.modelValue && t("update:modelValue", !1), u(() => {
        o.modelValue && e.value && !e.value.open && e.value.showModal();
      }), t("closed");
    }, V = B(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    return b(() => o.modelValue, async (l) => {
      await u(), l ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), g(() => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    }), k(() => {
      e.value && e.value.open && e.value.close();
    }), r({
      open: m,
      close: v
    }), (l, c) => (s(), n("dialog", C({
      ref_key: "dialogRef",
      ref: e,
      class: "_b4102a3b79656a37"
    }, l.$attrs, {
      onClose: h,
      closedBy: V.value
    }), [
      a.showTitleBar ? (s(), n("div", D, [
        f("span", $, [
          d(l.$slots, "title")
        ]),
        a.showCloseButton && a.closable ? (s(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "_468ff1da37ead40a",
          onClick: c[0] || (c[0] = _((O) => e.value?.close(), ["prevent"]))
        }, "×")) : i("", !0)
      ])) : i("", !0),
      f("div", T, [
        d(l.$slots, "default")
      ]),
      l.$slots.footer ? (s(), n("div", E, [
        d(l.$slots, "footer")
      ])) : i("", !0)
    ], 16, M));
  }
}), R = {
  install: (a) => {
    a.component("DialogView", N);
  }
};
export {
  N as DialogView,
  R as DialogViewPlugin,
  R as default
};
//# sourceMappingURL=dialog-view.es.js.map
