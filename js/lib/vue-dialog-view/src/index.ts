import { App, Plugin } from 'vue'
import DialogViewComponent from './DialogView.obf.vue'

export { default as DialogView } from './DialogView.obf.vue'

export const DialogViewPlugin: Plugin = {
  install: (app: App) => {
    app.component('DialogView', DialogViewComponent)
  }
}

export default DialogViewPlugin
