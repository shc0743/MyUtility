# ElMessage In Popover

[English](#english) | [中文](#中文)

---

## English

### Solve Element Plus ElMessage Display Issues in HTML5 Dialog

A lightweight solution that enables Element Plus ElMessage to work properly within HTML5 `<dialog>` elements using the Popover API.

### Problem

Element Plus's ElMessage component cannot display when used inside HTML5 `<dialog>` elements because:

- Dialog elements create a new top-layer stacking context
- ElMessage's z-index cannot break out of the dialog's context
- Messages appear behind the dialog or are completely invisible

### Solution

This package uses the modern Popover API to create a message container that can break out of the dialog's stacking context, ensuring messages are always visible on top.

### Features

- 🎯 **Seamless API** - Same API as original ElMessage
- 🚀 **Zero Configuration** - Works out of the box
- 📦 **Lightweight** - Only 2KB gzipped
- 🔒 **Type Safe** - Full TypeScript support
- 🎨 **Auto Fallback** - Falls back to original ElMessage if Popover not supported

### Installation

```bash
npm i el-message-in-popover
```

### Usage

```typescript
import { ElPopMessage } from 'el-message-in-popover'
// or this:
//import { ElPopMessage as ElMessage } from 'el-message-in-popover'

// Use exactly like ElMessage
ElPopMessage.success('Operation successful!')
ElPopMessage.error('Something went wrong!')

// In HTML5 dialog - this will work!
dialogElement.showModal()
ElPopMessage.warning('This message will be visible!')
```

### API

Same as Element Plus ElMessage:

```typescript
ElPopMessage(options)
ElPopMessage.success(message)
ElPopMessage.error(message) 
ElPopMessage.warning(message)
ElPopMessage.info(message)
ElPopMessage.primary(message)
ElPopMessage.closeAll()
```

### Browser Support

- ✅ Chrome/Edge 114+
- ✅ Safari 17+
- ✅ Firefox (behind flag)
- ⚠️ Falls back to original ElMessage in unsupported browsers

### License

Unlicense
