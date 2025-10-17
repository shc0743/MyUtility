<template>
  <dialog
    ref="dialogRef"
    class="dialog-view"
    v-bind="$attrs"
    @close="handleDialogClose"
  >
    <div v-if="showTitleBar" class="dialog-title-bar">
      <span class="dialog-title">
        <slot name="title"></slot>
      </span>
      <a
        v-if="showCloseButton"
        href="javascript:void(0)"
        role="button"
        aria-label="Close the dialog"
        class="dialog-close-button"
        @click.prevent="dialogRef?.close()"
      >×</a>
    </div>
    <div class="dialog-content">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="dialog-footer">
      <slot name="footer"></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: boolean
  showTitleBar?: boolean
  showCloseButton?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTitleBar: true,
  showCloseButton: true,
  closable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const openDialog = (): void => {
  emit('update:modelValue', true)
}

const closeDialog = (): void => {
  emit('update:modelValue', false)
}

const handleDialogClose = (): void => {
  if (!props.closable) {
    if (props.modelValue) {
      // not programmatically close
      // re-open the dialog
      nextTick(() => {
        if (dialogRef.value && !dialogRef.value.open) {
          dialogRef.value.showModal()
        }
      }) // Avoid using 'cancel' event because some browsers handle it incorrectly
      return;
    }
  }
  if (props.modelValue) {
    emit('update:modelValue', false)
  }
}

watch(() => props.modelValue, async (newValue: boolean) => {
  await nextTick()
  
  if (newValue) {
    if (dialogRef.value && !dialogRef.value.open) {
      dialogRef.value.showModal()
    }
  } else {
    if (dialogRef.value && dialogRef.value.open) {
      dialogRef.value.close()
    }
  }
})

defineExpose({
  open: openDialog,
  close: closeDialog,
})
</script>

<style>
.dialog-view {
  padding: 20px;
  border-radius: 5px;
  border: 1px solid gray;
  outline: 0 !important;
  max-width: calc(100% - 2em);
  max-height: calc(100% - 2em);
  box-sizing: border-box;
  overflow: hidden;
}

.dialog-view[open] {
  display: flex;
  flex-direction: column;
}

.dialog-view::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.dialog-title-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5em;
  min-height: 24px;
  white-space: pre;
  overflow: hidden;
}

.dialog-title {
  flex: 1;
  text-align: center;
  font-weight: bold;
  font-size: large;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-close-button {
  margin-left: 0.5em;
  text-decoration: none;
  color: #666;
  font-size: 1.5em;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: none;
}

.dialog-close-button:hover {
  color: #333;
  background-color: #f0f0f0;
  border-radius: 3px;
}

.dialog-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.dialog-footer {
  margin-top: 0.5em;
}
</style>