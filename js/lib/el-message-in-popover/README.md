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

---

## 中文

### 解决 Element Plus ElMessage 在 HTML5 Dialog 中的显示问题

一个轻量级解决方案，使用 Popover API 让 Element Plus 的 ElMessage 在 HTML5 `<dialog>` 元素中正常显示。

### 问题描述

Element Plus 的 ElMessage 组件在 HTML5 `<dialog>` 元素内无法正常显示，因为：

- Dialog 元素创建了新的顶层堆叠上下文
- ElMessage 的 z-index 无法突破 dialog 的上下文
- 消息会显示在 dialog 后面或完全不可见

### 解决方案

本包使用现代的 Popover API 创建消息容器，可以突破 dialog 的堆叠上下文，确保消息始终显示在最顶层。

### 特性

- 🎯 **无缝 API** - 与原始 ElMessage 相同的 API
- 🚀 **零配置** - 开箱即用
- 📦 **轻量级** - 仅 2KB gzipped
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 🎨 **自动降级** - 浏览器不支持 Popover 时自动回退到原始 ElMessage

### 安装

```bash
npm install el-message-in-popover
```

### 使用方法

```typescript
import { ElPopMessage } from 'el-message-in-popover'
// 或者: 
//import { ElPopMessage as ElMessage } from 'el-message-in-popover'

// 用法与 ElMessage 完全相同
ElPopMessage.success('操作成功!')
ElPopMessage.error('出错了!')

// 在 HTML5 dialog 中 - 这会正常工作!
dialogElement.showModal()
ElPopMessage.warning('这条消息将会可见!')
```

### API

与 Element Plus ElMessage 完全相同：

```typescript
ElPopMessage(options)
ElPopMessage.success(message)
ElPopMessage.error(message)
ElPopMessage.warning(message) 
ElPopMessage.info(message)
ElPopMessage.primary(message)
ElPopMessage.closeAll()
```

### 浏览器支持

- ✅ Chrome/Edge 114+
- ✅ Safari 17+
- ✅ Firefox (需开启标志)
- ⚠️ 不支持的浏览器会自动回退到原始 ElMessage

### 许可证

Unlicense