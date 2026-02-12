# vue-dialog-view

A modern Vue 3 dialog component using the native HTML5 `<dialog>` element.

---

## ✨ Features

* 🎯 **Native HTML5 Dialog** - Uses the built-in `<dialog>` element for better accessibility and performance
* 🎨 **Customizable** - Configurable title bar and close button
* 🖱️ **Click-to-close** - Optional backdrop click to close (using native closedby attribute)
* ♿ **Accessible** - Proper ARIA labels and keyboard support
* 📱 **Responsive** - Adapts to different screen sizes
* 🎪 **Slot Support** - Flexible content slots for title, footer and main content
* 🎭 **Vue 3 Ready** - Built with Composition API and TypeScript
* 📦 **Multiple Distributions** - Choose between obfuscated / unobfuscated builds
* 🎨 **Flexible CSS Strategy** - Automatic CSS injection (zero setup) or fully manual CSS loading
* 🧩 **Tree-shake Friendly** - ESM and UMD builds available

---

## 📦 Installation

```bash
npm i vue-dialog-view
```

---

## 🚀 Quick Start (Default Build)

By default, styles are automatically injected into the page — no CSS import required.

```js
import { createApp } from 'vue'
import App from './App.vue'
import DialogView from 'vue-dialog-view'

const app = createApp(App)
app.use(DialogView)
app.mount('#app')
```

Or local registration:

```vue
<script setup>
import { ref } from 'vue'
import { DialogView } from 'vue-dialog-view'

const showDialog = ref(false)
</script>
```

---

## 📚 Entry Points & Build Variants

This package provides multiple entry points so you can choose the best trade-off between:

* readability vs bundle size
* debuggability vs encapsulation
* automatic vs manual CSS loading

### Overview

| Entry                   | Import Path                          | Obfuscated | CSS Injected | Scoped CSS | Typical Use                    |
| ----------------------- | ------------------------------------ | ---------- | ------------ | ---------- | ------------------------------ |
| **Default**             | `vue-dialog-view`                    | ✅          | ✅            | ❌          | Production (zero setup)        |
| **Unobfuscated**        | `vue-dialog-view/unobfuscated`       | ❌          | ✅            | ✅          | Debugging / Development        |
| **CSS-less**            | `vue-dialog-view/cssless`            | ❌          | ❌            | ✅          | Manual CSS control             |
| **CSS-less Obfuscated** | `vue-dialog-view/cssless-obfuscated` | ✅          | ❌            | ❌          | Advanced production setups     |
| **Style**               | `vue-dialog-view/style`              | —          | —            | —          | Manual CSS import              |
| **Style (Obfuscated)**  | `vue-dialog-view/style-obfuscated`   | —          | —            | —          | Manual CSS import (obfuscated) |

---

### 🔹 Default Build (Recommended)

```js
import DialogView from 'vue-dialog-view'
```

* ✔️ Obfuscated class names
* ✔️ CSS automatically injected at runtime
* ✔️ Zero configuration
* ✔️ Small bundle size
* ❌ Not intended for external CSS overrides

Best choice for most applications.

---

### 🔹 Unobfuscated Build

```js
import DialogView from 'vue-dialog-view/unobfuscated'
```

* ✔️ Human-readable class names
* ✔️ Scoped CSS to avoid collisions
* ✔️ Easier DOM inspection and debugging
* ❌ Slightly larger output

Recommended for development, debugging, and learning.

---

### 🔹 CSS-less Build (Manual CSS Loading)

```js
import DialogView from 'vue-dialog-view/cssless'
import 'vue-dialog-view/style'
```

* ✔️ No runtime CSS injection
* ✔️ CSS loaded explicitly by the user
* ✔️ Scoped CSS (non-obfuscated)
* ✔️ Works well with bundler CSS pipelines

Useful when your project enforces explicit CSS imports.

---

### 🔹 CSS-less Obfuscated Build

```js
import DialogView from 'vue-dialog-view/cssless-obfuscated'
import 'vue-dialog-view/style-obfuscated'
```

* ✔️ Obfuscated class names
* ✔️ No runtime CSS injection
* ✔️ Smallest runtime footprint
* ❌ Not suitable for CSS customization

Best for highly controlled production environments.

---

## 🎨 Styling & Customization

### CSS Custom Properties

DialogView exposes a small set of CSS variables for safe customization:

```css
--dialog-padding        /* default: 20px */
--dialog-title-height  /* default: 24px */
```

Example:

```css
:root {
  --dialog-padding: 24px;
  --dialog-title-height: 32px;
}
```

These variables work consistently across all build variants.

> ⚠️ Direct class-based overrides are discouraged in obfuscated builds.

---

## 🧩 Props

| Prop               | Type      | Default      | Description                                 |
| ------------------ | --------- | ------------ | ------------------------------------------- |
| `modelValue`       | `boolean` | **required** | Controls dialog visibility                  |
| `showTitleBar`     | `boolean` | `true`       | Show or hide title bar                      |
| `showCloseButton`  | `boolean` | `true`       | Show close button                           |
| `closable`         | `boolean` | `true`       | Whether the user can close the dialog       |
| `closeOnClickMask` | `boolean` | `false`      | Whether clicking backdrop closes the dialog |

---

## 📣 Events

| Event               | Description                   |
| ------------------- | ----------------------------- |
| `update:modelValue` | Fired when visibility changes |
| `closed` | Fired when the dialog really closed |

---

## 🧪 Slots

| Slot      | Description    |
| --------- | -------------- |
| `#title`  | Title content  |
| `#footer` | Footer content |
| `default` | Main content   |

---

## 🔧 Methods

```vue
const dialogRef = ref()

dialogRef.value.open()
dialogRef.value.close()
```

---

## 🌍 Browser Support

Requires native HTML5 `<dialog>` support.
Use a polyfill for legacy browsers.

---

## 📄 License

Unlicense

---

## 🤝 Contributing

Issues and pull requests are welcome.
