import { App } from 'vue'
import DialogView from './DialogView.vue'

DialogView.install = (app: App) => {
  app.component('DialogView', DialogView)
}

export default DialogView
