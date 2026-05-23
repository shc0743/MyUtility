import { App, Plugin } from 'vue'
import DialogViewComponent from './DialogView.obf.vue'
import { type DialogViewConfig } from './config'

export { default as DialogView } from './DialogView.obf.vue'
export { dialogViewConfig, setDialogViewConfig, type DialogViewConfig } from './config'

export const DialogViewPlugin: Plugin = {
  install: (app: App, options?: DialogViewConfig) => {
    if (options) {
      app.provide('dialogViewConfig', options)
    }
    app.component('DialogView', DialogViewComponent)
  }
}

export default DialogViewPlugin
