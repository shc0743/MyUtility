<template>
  <dialog
    ref="dialogRef"
    class="_0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f"
    v-bind="$attrs"
    @close="handleDialogClose"
  >
    <div v-if="showTitleBar" class="_f365dae0582379d563ee03ab860c73c916d68f096a41a8bd34e05e566987b1f6-bar">
      <span class="_f365dae0582379d563ee03ab860c73c916d68f096a41a8bd34e05e566987b1f6">
        <slot name="title"></slot>
      </span>
      <a
        v-if="showCloseButton"
        href="javascript:void(0)"
        role="button"
        aria-label="Close the dialog"
        class="_2b0f1321796c8091f668958929ed738b53afcb63d79387dc52ddc75b55ffb46c"
        @click.prevent="closeDialog"
      >×</a>
    </div>
    <div class="_3b2bdd19ddec80c5f0f162bc4b423dafa4f687f6f831e58742be40fb0e80838e">
      <slot></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: boolean
  showTitleBar?: boolean
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTitleBar: true,
  showCloseButton: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const openDialog = (): void => {
  if (dialogRef.value && !dialogRef.value.open) {
    dialogRef.value.showModal()
  }
}

const closeDialog = (): void => {
  if (dialogRef.value && dialogRef.value.open) {
    dialogRef.value.close()
  }
}

const handleDialogClose = (): void => {
  if (props.modelValue) {
    emit('update:modelValue', false)
  }
}

watch(() => props.modelValue, async (newValue) => {
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
._0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f {
  padding: 20px;
  border-radius: 5px;
  border: 1px solid gray;
  outline: 0 !important;
  max-width: calc(100% - 2em);
  max-height: calc(100% - 2em);
}

._0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f[open] {
  display: flex;
  flex-direction: column;
}

._0e414b08e017324be9d8055e33e9e57a5d618fd64445845aa3d1c9c71a1cf19f::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

._f365dae0582379d563ee03ab860c73c916d68f096a41a8bd34e05e566987b1f6-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5em;
  min-height: 24px;
  white-space: pre;
}

._f365dae0582379d563ee03ab860c73c916d68f096a41a8bd34e05e566987b1f6 {
  flex: 1;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
}

._2b0f1321796c8091f668958929ed738b53afcb63d79387dc52ddc75b55ffb46c {
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

._2b0f1321796c8091f668958929ed738b53afcb63d79387dc52ddc75b55ffb46c:hover {
  color: #333;
  background-color: #f0f0f0;
  border-radius: 3px;
}

._3b2bdd19ddec80c5f0f162bc4b423dafa4f687f6f831e58742be40fb0e80838e {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>