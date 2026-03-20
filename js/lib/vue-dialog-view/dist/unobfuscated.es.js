(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".dialog-view[data-v-7641dcfa]{padding:var(--dialog-padding, 20px);border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}.dialog-view[open][data-v-7641dcfa]{display:flex;flex-direction:column}.dialog-view[data-v-7641dcfa]::backdrop{background:#00000080}.dialog-title-bar[data-v-7641dcfa]{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:var(--dialog-title-height, 24px);white-space:pre;overflow:hidden;-webkit-user-select:none;user-select:none}.dialog-title[data-v-7641dcfa]{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}.dialog-close-button[data-v-7641dcfa]{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;padding:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}.dialog-close-button[data-v-7641dcfa]:hover{color:#333;background-color:#f0f0f0;border-radius:3px}.dialog-close-button[data-v-7641dcfa]:focus-visible{outline:2px solid rgb(160,207,255);outline-offset:-2px}.dialog-content[data-v-7641dcfa]{flex:1;overflow:auto;display:flex;flex-direction:column}.dialog-footer[data-v-7641dcfa]{margin-top:.5em}")),document.head.appendChild(e)}}catch(o){console.error("vite-plugin-css-injected-by-js",o)}})();
import { defineComponent as B, ref as m, computed as C, watch as k, nextTick as n, onMounted as D, onBeforeUnmount as _, onDeactivated as b, onActivated as M, openBlock as i, createElementBlock as u, mergeProps as $, createElementVNode as g, renderSlot as f, withModifiers as E, createCommentVNode as v } from "vue";
const O = ["closedBy"], T = {
  key: 0,
  class: "dialog-title-bar"
}, N = { class: "dialog-title" }, P = { class: "dialog-content" }, R = {
  key: 1,
  class: "dialog-footer"
}, q = /* @__PURE__ */ B({
  __name: "DialogView",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 },
    closable: { type: Boolean, default: !0 },
    closeOnClickMask: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "closed"],
  setup(l, { expose: c, emit: s }) {
    const o = l, t = s, e = m(), h = () => {
      t("update:modelValue", !0);
    }, d = () => {
      t("update:modelValue", !1);
    }, w = (a) => {
      a.preventDefault(), o.closable && d();
    }, r = m(!1), V = () => {
      if (!r.value) {
        if (!o.closable && o.modelValue) {
          n(() => {
            e.value && !e.value.open && e.value.showModal();
          });
          return;
        }
        o.modelValue && t("update:modelValue", !1), n(() => {
          o.modelValue && e.value && !e.value.open && e.value.showModal();
        }), t("closed");
      }
    }, y = C(() => o.closable ? o.closeOnClickMask ? "any" : "closerequest" : "none");
    k(() => o.modelValue, async (a) => {
      await n(), a ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    });
    const p = () => {
      o.modelValue && e.value && !e.value.open && e.value.showModal();
    };
    return D(() => {
      p();
    }), _(() => {
      e.value && e.value.open && e.value.close();
    }), b(() => {
      e.value && e.value.open && (r.value = !0, e.value.close(), n(() => r.value = !1));
    }), M(() => {
      p();
    }), c({
      get: () => e.value,
      open: h,
      close: d
    }), (a, S) => (i(), u("dialog", $({
      ref_key: "dialogRef",
      ref: e,
      class: "dialog-view"
    }, a.$attrs, {
      onClose: V,
      onCancel: w,
      closedBy: y.value
    }), [
      l.showTitleBar ? (i(), u("div", T, [
        g("span", N, [
          f(a.$slots, "title", {}, void 0, !0)
        ]),
        l.showCloseButton && l.closable ? (i(), u("button", {
          key: 0,
          type: "button",
          "aria-label": "Close the dialog",
          class: "dialog-close-button",
          onClick: E(d, ["prevent"])
        }, "×")) : v("", !0)
      ])) : v("", !0),
      g("div", P, [
        f(a.$slots, "default", {}, void 0, !0)
      ]),
      a.$slots.footer ? (i(), u("div", R, [
        f(a.$slots, "footer", {}, void 0, !0)
      ])) : v("", !0)
    ], 16, O));
  }
}), A = (l, c) => {
  const s = l.__vccOpts || l;
  for (const [o, t] of c)
    s[o] = t;
  return s;
}, I = /* @__PURE__ */ A(q, [["__scopeId", "data-v-7641dcfa"]]), j = {
  install: (l) => {
    l.component("DialogView", I);
  }
};
export {
  I as DialogView,
  j as DialogViewPlugin,
  j as default
};
//# sourceMappingURL=unobfuscated.es.js.map
