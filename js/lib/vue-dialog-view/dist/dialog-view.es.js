(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode("._0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f{padding:20px;border-radius:5px;border:1px solid gray;outline:0!important;max-width:calc(100% - 2em);max-height:calc(100% - 2em);box-sizing:border-box;overflow:hidden}._0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f[open]{display:flex;flex-direction:column}._0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f::backdrop{background:#00000080}._f1bcbda2e971453cc116bd5c6d4a303f38ac3e0618c26210b206271398b2f619{display:flex;flex-direction:row;align-items:center;margin-bottom:.5em;min-height:24px;white-space:pre;overflow:hidden}._f365dae0582379d563ee03ab860c73c916d68f096a41a8bd34e05e566987b1f6{flex:1;text-align:center;font-weight:700;font-size:large;overflow:hidden;text-overflow:ellipsis}._2b0f1321796c8091f668958929ed738b53afcb63d79387dc52ddc75b55ffb46c{margin-left:.5em;text-decoration:none;color:#666;font-size:1.5em;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none}._2b0f1321796c8091f668958929ed738b53afcb63d79387dc52ddc75b55ffb46c:hover{color:#333;background-color:#f0f0f0;border-radius:3px}._3b2bdd19ddec80c5f0f162bc4b423dafa4f687f6f831e58742be40fb0e80838e{flex:1;overflow:auto;display:flex;flex-direction:column}")),document.head.appendChild(e)}}catch(d){console.error("vite-plugin-css-injected-by-js",d)}})();
import { defineComponent as m, ref as v, watch as h, nextTick as g, createElementBlock as l, openBlock as t, mergeProps as w, createCommentVNode as d, createElementVNode as n, renderSlot as i, withModifiers as V } from "vue";
const _ = {
  key: 0,
  class: "_f1bcbda2e971453cc116bd5c6d4a303f38ac3e0618c26210b206271398b2f619"
}, B = { class: "_f365dae0582379d563ee03ab860c73c916d68f096a41a8bd34e05e566987b1f6" }, C = { class: "_3b2bdd19ddec80c5f0f162bc4b423dafa4f687f6f831e58742be40fb0e80838e" }, k = /* @__PURE__ */ m({
  __name: "DialogView.obf",
  props: {
    modelValue: { type: Boolean },
    showTitleBar: { type: Boolean, default: !0 },
    showCloseButton: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue"],
  setup(o, { expose: f, emit: u }) {
    const s = o, r = u, e = v(null), b = () => {
      e.value && !e.value.open && e.value.showModal();
    }, c = () => {
      e.value && e.value.open && e.value.close();
    }, p = () => {
      s.modelValue && r("update:modelValue", !1);
    };
    return h(() => s.modelValue, async (a) => {
      await g(), a ? e.value && !e.value.open && e.value.showModal() : e.value && e.value.open && e.value.close();
    }), f({
      open: b,
      close: c
    }), (a, y) => (t(), l("dialog", w({
      ref_key: "dialogRef",
      ref: e,
      class: "_0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f"
    }, a.$attrs, { onClose: p }), [
      o.showTitleBar ? (t(), l("div", _, [
        n("span", B, [
          i(a.$slots, "title")
        ]),
        o.showCloseButton ? (t(), l("a", {
          key: 0,
          href: "javascript:void(0)",
          role: "button",
          "aria-label": "Close the dialog",
          class: "_2b0f1321796c8091f668958929ed738b53afcb63d79387dc52ddc75b55ffb46c",
          onClick: V(c, ["prevent"])
        }, "×")) : d("", !0)
      ])) : d("", !0),
      n("div", C, [
        i(a.$slots, "default")
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
