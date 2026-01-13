import { App, Plugin } from 'vue'
import DialogViewComponent from './DialogView.vue'

export { default as DialogView } from './DialogView.vue'

export const DialogViewPlugin: Plugin = {
  install: (app: App) => {
    app.component('DialogView', DialogViewComponent)
  }
}

export default DialogViewPlugin
