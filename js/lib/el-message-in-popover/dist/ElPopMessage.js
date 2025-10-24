import { ElMessage } from 'element-plus';
const isSupported = (() => {
    try {
        const testElement = document.createElement('div');
        return !!(testElement.showPopover);
    }
    catch {
        return false;
    }
})();
const createPopMessage = (options) => {
    const config = typeof options === 'string'
        ? { message: options }
        : { ...options };
    if (!isSupported)
        return ElMessage(config);
    // 为每个消息创建独立的 popover 容器
    const popover = document.createElement('div');
    popover.popover = 'manual';
    popover.style.width = popover.style.height = popover.style.border = '0px';
    popover.style.top = popover.style.left = '-100%';
    popover.style.position = 'fixed';
    document.body.append(popover);
    // 打开 popover
    popover.showPopover();
    // 保存原始 onClose 回调
    const originalOnClose = config.onClose;
    // 设置 appendTo 和 onClose
    config.appendTo = popover;
    config.onClose = () => {
        popover.hidePopover();
        popover.remove();
        originalOnClose?.();
    };
    return ElMessage(config);
};
const ElPopMessage = ((options) => {
    return createPopMessage(options);
});
['success', 'warning', 'error', 'info', 'primary'].forEach((type) => {
    ElPopMessage[type] = (options) => {
        return createPopMessage({
            ...(typeof options === 'string' ? { message: options } : options),
            type
        });
    };
});
// 关闭所有消息
ElPopMessage.closeAll = () => {
    ElMessage.closeAll();
};
export { ElPopMessage };
//# sourceMappingURL=ElPopMessage.js.map