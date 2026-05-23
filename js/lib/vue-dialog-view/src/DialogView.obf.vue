<template>
  <dialog
    ref="dialogRef"
    class="_b4102a3b79656a37"
    :data-theme="resolvedTheme"
    v-bind="$attrs"
    @close="handleDialogClose"
    @cancel="handleDialogCancel"
    :closedBy="closedBy"
  >
    <div v-if="showTitleBar" class="_4d394b1507fdc584">
      <span class="_088d860d2fd75292">
        <slot name="title"></slot>
      </span>
      <button
        v-if="showCloseButton && closable"
        type="button"
        aria-label="Close the dialog"
        class="_468ff1da37ead40a"
        @click.prevent="closeDialog"
      >&times;</button>
    </div>
    
    <div class="_0be228fb3f6dcf6a">
      <div class="_da3b3b2a4aeed1ee">
        <slot></slot>
      </div>
    </div>

    <div v-if="$slots.footer" class="_61879ba330d9a71c">
      <slot name="footer"></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount, onDeactivated, onActivated, inject } from 'vue'
import { dialogViewConfig, type DialogViewConfig } from './config'

interface Props {
  modelValue: boolean
  showTitleBar?: boolean
  showCloseButton?: boolean
  closable?: boolean
  closeOnClickMask?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  showTitleBar: true,
  showCloseButton: true,
  closable: true,
  closeOnClickMask: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'closed'): void
}>()

const dialogRef = ref<HTMLDialogElement>();

const openDialog = (): void => {
  emit('update:modelValue', true)
}

const closeDialog = (): void => {
  emit('update:modelValue', false)
}

const handleDialogCancel = (e: Event) => {
  e.preventDefault();
  if (props.closable) closeDialog();
}

const ignoreCloseEvent = ref(false);

const handleDialogClose = (): void => {
  if (ignoreCloseEvent.value) return;
  if (!props.closable) {
    if (props.modelValue) {
      nextTick(() => {
        if (dialogRef.value && !dialogRef.value.open) dialogRef.value.showModal()
      })
      return;
    }
  }
  if (props.modelValue) {
    emit('update:modelValue', false)
  }
  nextTick(() => {
    if (props.modelValue) {
      if (dialogRef.value && !dialogRef.value.open) dialogRef.value.showModal()
    }
  })
  emit('closed')
}

const closedBy = computed(() => props.closable ? (props.closeOnClickMask ? 'any' : 'closerequest') : 'none')

// --- Theme resolution ---
const injectedConfig = inject<DialogViewConfig | undefined>('dialogViewConfig', undefined)

const systemPrefersDark = ref(false)
const systemQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null
let systemQueryListener: ((e: MediaQueryListEvent) => void) | null = null

if (systemQuery) {
  systemPrefersDark.value = systemQuery.matches
  systemQueryListener = (e) => { systemPrefersDark.value = e.matches }
  systemQuery.addEventListener('change', systemQueryListener)
}

const resolvedTheme = computed<'light' | 'dark'>(() => {
  // Priority: component prop > plugin config > module-level config
  const theme = props.theme ?? injectedConfig?.theme ?? dialogViewConfig.value.theme ?? 'light'
  if (theme === 'auto') {
    return systemPrefersDark.value ? 'dark' : 'light'
  }
  return theme
})

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

const initDialog = () => {
  if (props.modelValue) {
    if (dialogRef.value && !dialogRef.value.open) {
      dialogRef.value.showModal()
    }
  }
};

onMounted(() => {
  initDialog();
});

onBeforeUnmount(() => {
  if (dialogRef.value && dialogRef.value.open) {
    dialogRef.value.close()
  }  if (systemQuery && systemQueryListener) {
    systemQuery.removeEventListener('change', systemQueryListener)
  }
});

onDeactivated(() => {
  if (dialogRef.value && dialogRef.value.open) {
    ignoreCloseEvent.value = true;
    dialogRef.value.close();
    nextTick(() => ignoreCloseEvent.value = false);
  }
});

onActivated(() => {
  initDialog();
});

defineExpose({
  get: () => dialogRef.value,
  open: openDialog,
  close: closeDialog,
});
</script>

<style>
._b4102a3b79656a37 {
  --dvinternal-bg: var(--dialog-bg, #fff);
  --dvinternal-text: var(--dialog-text-color, #000);
  --dvinternal-border: var(--dialog-border-color, gray);
  --dvinternal-backdrop: var(--dialog-backdrop-bg, rgba(0, 0, 0, 0.5));
  --dvinternal-close-btn: var(--dialog-close-btn-color, #666);
  --dvinternal-close-btn-hover: var(--dialog-close-btn-hover-color, #333);
  --dvinternal-close-btn-hover-bg: var(--dialog-close-btn-hover-bg, #f0f0f0);
  --dvinternal-close-btn-active-bg: var(--dialog-close-btn-active-bg, #e0e0e0);
  --dvinternal-close-btn-focus: var(--dialog-close-btn-focus-outline, rgb(160, 207, 255));

  padding: var(--dialog-padding, 20px);
  border-radius: 5px;
  border: 1px solid var(--dvinternal-border);
  outline: 0 !important;
  max-width: calc(100% - 2em);
  max-height: calc(100% - 2em);
  box-sizing: border-box;
  overflow: hidden;
  background: var(--dvinternal-bg);
  color: var(--dvinternal-text);
}

._b4102a3b79656a37[data-theme="dark"] {
  --dvinternal-bg: var(--dialog-bg, #1e1e1e);
  --dvinternal-text: var(--dialog-text-color, #e0e0e0);
  --dvinternal-border: var(--dialog-border-color, #555);
  --dvinternal-backdrop: var(--dialog-backdrop-bg, rgba(0, 0, 0, 0.7));
  --dvinternal-close-btn: var(--dialog-close-btn-color, #aaa);
  --dvinternal-close-btn-hover: var(--dialog-close-btn-hover-color, #ddd);
  --dvinternal-close-btn-hover-bg: var(--dialog-close-btn-hover-bg, #333);
  --dvinternal-close-btn-active-bg: var(--dialog-close-btn-active-bg, #444);
  --dvinternal-close-btn-focus: var(--dialog-close-btn-focus-outline, rgb(100, 160, 220));
}

._b4102a3b79656a37[open] {
  display: flex;
  flex-direction: column;
}

._b4102a3b79656a37::backdrop {
  background: var(--dvinternal-backdrop);
}

._4d394b1507fdc584 {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5em;
  min-height: var(--dialog-title-height, 24px);
  white-space: pre;
  overflow: hidden;
  user-select: none;
}

._088d860d2fd75292 {
  flex: 1;
  text-align: center;
  font-weight: bold;
  font-size: large;
  overflow: hidden;
  text-overflow: ellipsis;
}

._468ff1da37ead40a {
  margin-left: 0.5em;
  text-decoration: none;
  color: var(--dvinternal-close-btn);
  font-size: 1.5em;
  line-height: 1;
  width: 24px;
  height: 24px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: none;
}

._468ff1da37ead40a:hover {
  color: var(--dvinternal-close-btn-hover);
  background-color: var(--dvinternal-close-btn-hover-bg);
  border-radius: 3px;
}

._468ff1da37ead40a:active {
  background-color: var(--dvinternal-close-btn-active-bg);
}

._468ff1da37ead40a:focus-visible {
  outline: 2px solid var(--dvinternal-close-btn-focus);
  outline-offset: -2px;
}

._0be228fb3f6dcf6a {
  flex: 1;
  overflow: auto;
}

._da3b3b2a4aeed1ee {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

._61879ba330d9a71c {
  margin-top: 0.5em;
}
</style>
