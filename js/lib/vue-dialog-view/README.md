# vue-dialog-view

A modern Vue 3 dialog component using the native HTML5 `<dialog>` element.

---

## ✨ Features

- 🎯 **Native `<dialog>`** – Built‑in element for better accessibility and performance  
- ♿ **Accessible** – Proper ARIA labels, keyboard support  
- 🎨 **Customizable** – Title bar, close button, backdrop click behaviour  
- 🧩 **Slot support** – Title, footer, and main content slots  
- 📦 **Vue 3 + TypeScript** – Composition API, tree‑shakable  
- 🎭 **Flexible styling** – CSS variables for easy theming

---

## 📦 Installation

```bash
npm i vue-dialog-view
```

---

## 🚀 Quick Start

The default build automatically injects the required CSS – no extra import needed.

### Global registration

```js
import { createApp } from 'vue'
import App from './App.vue'
import DialogView from 'vue-dialog-view'

const app = createApp(App)
app.use(DialogView)
app.mount('#app')
```

### Local registration

```vue
<script setup>
import { ref } from 'vue'
import { DialogView } from 'vue-dialog-view'

const showDialog = ref(false)
</script>

<template>
  <DialogView v-model="showDialog">
    <p>Your content here</p>
  </DialogView>
</template>
```

---

## 🧩 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | **required** | Controls dialog visibility (use `v-model`) |
| `showTitleBar` | `boolean` | `true` | Show/hide the title bar |
| `showCloseButton` | `boolean` | `true` | Show/hide the close button |
| `closable` | `boolean` | `true` | Whether the user can close the dialog |
| `closeOnClickMask` | `boolean` | `false` | Whether clicking the backdrop closes the dialog |

---

## 📣 Events

| Event | Description |
|-------|-------------|
| `update:modelValue` | Emitted when visibility changes |
| `closed` | Emitted after the dialog is fully closed |

---

## 🧪 Slots

| Slot | Description |
|------|-------------|
| `#title` | Custom title content (replaces default title bar text) |
| `#footer` | Footer content |
| `default` | Main content area |

---

## 🔧 Methods (via template ref)

The component exposes the following methods using `defineExpose`:

```vue
<script setup>
import { ref } from 'vue'
import { DialogView } from 'vue-dialog-view'

const dialogRef = ref()

// Open programmatically
dialogRef.value.open()

// Close programmatically
dialogRef.value.close()

// Access the underlying native <dialog> element
dialogRef.value.get()
</script>

<template>
  <DialogView ref="dialogRef" v-model="show">
    <!-- content -->
  </DialogView>
</template>
```

| Method | Description |
|--------|-------------|
| `open()` | Opens the dialog (sets `modelValue` to `true`) |
| `close()` | Closes the dialog (sets `modelValue` to `false`) |
| `get()` | Returns the native `<dialog>` DOM element |

---

## 🎨 Styling & Customisation

### CSS Variables

```css
--dialog-padding        /* default: 20px */
--dialog-title-height   /* default: 24px */
```

Example:

```css
:root {
  --dialog-padding: 24px;
  --dialog-title-height: 32px;
}
```

These variables work across all builds and are the recommended way to adjust spacing.

### Content Area Layout

The dialog's content area is a flex column container. Child components can use `flex: 1` (or `height: 100%`) to fill the available space, and overflow scrolling is handled by the wrapper — avoiding the `display:flex` + `overflow:auto` combination on the same element that causes issues in some browsers.

---

## 🛠️ Advanced: Build Variants

The package provides multiple entry points to balance bundle size, debuggability, and CSS control. **Most projects should use the default build** – the variants are only needed for special cases.

| Build | Import Path | CSS Injected | Class Names | Use Case |
|-------|-------------|--------------|-------------|----------|
| **Default** | `vue-dialog-view` | ✅ | Obfuscated | Recommended for production |
| Unobfuscated | `vue-dialog-view/unobfuscated` | ✅ | Readable | Debugging / development |
| CSS‑less | `vue-dialog-view/cssless` | ❌ | Readable | When you need manual CSS control |
| CSS‑less obfuscated | `vue-dialog-view/cssless-obfuscated` | ❌ | Obfuscated | Advanced production setups |

For CSS‑less builds you must import the style separately:

```js
import DialogView from 'vue-dialog-view/cssless'
import 'vue-dialog-view/style'
```

If you need the obfuscated style:

```js
import DialogView from 'vue-dialog-view/cssless-obfuscated'
import 'vue-dialog-view/style-obfuscated'
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
