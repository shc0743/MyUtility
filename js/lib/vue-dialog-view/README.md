# vue-dialog-view

A modern Vue 3 dialog component using the native HTML5 `<dialog>` element.

## Features

- 🎯 **Native HTML5 Dialog** - Uses the built-in `<dialog>` element for better accessibility and performance
- 🎨 **Customizable** - Configurable title bar and close button
- ♿ **Accessible** - Proper ARIA labels and keyboard support
- 📱 **Responsive** - Adapts to different screen sizes
- 🎪 **Slot Support** - Flexible content slots for title and main content
- 🎭 **Vue 3 Ready** - Built with Composition API and TypeScript
- 🎨 **Zero CSS Setup** - Styles are automatically injected, no need to import CSS files

## Installation

```bash
npm i vue-dialog-view
```

## Usage

### Global Registration

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import DialogView from 'vue-dialog-view'

const app = createApp(App)
app.use(DialogView)
app.mount('#app')
```

### Local Registration

```vue
<template>
  <div>
    <button @click="showDialog = true">Open Dialog</button>
    
    <DialogView v-model="showDialog">
      <template #title>
        Dialog Title
      </template>
      
      <p>This is your dialog content!</p>
      <p>You can put any content here.</p>
    </DialogView>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DialogView } from 'vue-dialog-view'

const showDialog = ref(false)
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | **required** | Controls the visibility of the dialog |
| `showTitleBar` | `boolean` | `true` | Whether to show the title bar |
| `showCloseButton` | `boolean` | `true` | Whether to show the close button in title bar |

## Events

| Event | Description |
|-------|-------------|
| `update:modelValue` | Emitted when dialog visibility changes |

## Slots

| Slot | Description |
|------|-------------|
| `#title` | Content for the dialog title |
| `default` | Main content of the dialog |

## Methods

The component exposes the following methods via template refs:

```vue
<template>
  <DialogView ref="dialogRef" v-model="showDialog">
    <!-- content -->
  </DialogView>
</template>

<script setup>
import { ref } from 'vue'

const dialogRef = ref()

// Open dialog programmatically
dialogRef.value.open()

// Close dialog programmatically  
dialogRef.value.close()
</script>
```

## Browser Support

This component requires a browser that supports the HTML5 `<dialog>` element. For older browsers, consider using a polyfill.

## License

Unlicense - See LICENSE file for details.

## Contributing

Issues and pull requests are welcome! Please feel free to contribute.
