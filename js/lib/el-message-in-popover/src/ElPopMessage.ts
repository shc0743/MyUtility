import { ElMessage, type MessageOptions, type MessageType } from 'element-plus'
// @ts-ignore
import 'element-plus/theme-chalk/el-message.css'

const isSupported = ((): boolean => {
  try {
    const testElement = document.createElement('div')
    return !!(testElement.showPopover)
  } catch {
    return false
  }
})()

const createPopMessage = (options: MessageOptions | string): ReturnType<typeof ElMessage> => {
  const config: MessageOptions = typeof options === 'string' 
    ? { message: options } 
    : { ...options }
  
  if (!isSupported) return ElMessage(config)

  // 为每个消息创建独立的 popover 容器
  const popover = document.createElement('div')
  popover.popover = 'manual'
  popover.style.width = popover.style.height = popover.style.border = '0px'
  popover.style.top = popover.style.left = '-100%'
  popover.style.position = 'fixed'
  document.body.append(popover)
  
  // 打开 popover
  popover.showPopover()
  
  // 保存原始 onClose 回调
  const originalOnClose = config.onClose
  
  // 设置 appendTo 和 onClose
  config.appendTo = popover
  config.onClose = () => {
    popover.hidePopover()
    popover.remove()
    originalOnClose?.()
  }
  
  return ElMessage(config)
}

// 主函数类型
type ElPopMessageFn = {
  (options: MessageOptions | string): ReturnType<typeof ElMessage>;
  closeAll: () => void;
  success: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
  warning: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
  error: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
  info: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
  primary: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
};

const ElPopMessage = ((options: MessageOptions | string) => {
  return createPopMessage(options);
}) as ElPopMessageFn;

(['success', 'warning', 'error', 'info', 'primary'] as MessageType[]).forEach((type) => {
  ElPopMessage[type] = (options: MessageOptions | string): ReturnType<typeof ElMessage> => {
    return createPopMessage({
      ...(typeof options === 'string' ? { message: options } : options),
      type
    })
  }
})

// 关闭所有消息
ElPopMessage.closeAll = (): void => {
  ElMessage.closeAll()
}

export { ElPopMessage }
