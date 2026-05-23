import { ref } from 'vue'

export interface DialogViewConfig {
  theme: 'light' | 'dark' | 'auto'
}

const defaultConfig: DialogViewConfig = {
  theme: 'light'
}

export const dialogViewConfig = ref<DialogViewConfig>({ ...defaultConfig })

export function setDialogViewConfig(newConfig: Partial<DialogViewConfig>): void {
  dialogViewConfig.value = { ...dialogViewConfig.value, ...newConfig }
}
