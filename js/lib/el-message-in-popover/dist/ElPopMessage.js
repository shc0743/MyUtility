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
// 在模块加载时直接创建 popover 容器
const popoverContainer = (() => {
    const popover = document.createElement('div');
    popover.popover = 'manual';
    popover.style.width = popover.style.height = '0px';
    popover.style.top = popover.style.left = '-100%';
    popover.style.boxSizing = 'border-box';
    popover.style.padding = '0px';
    popover.style.position = 'fixed';
    document.body.appendChild(popover);
    return popover;
})();
// 消息计数器
let messageCount = 0;
let isPopoverOpen = false;
popoverContainer.addEventListener('toggle', (event) => {
    const toggleEvent = event;
    isPopoverOpen = toggleEvent.newState === 'open';
});
const openPopover = () => {
    messageCount++;
    // 如果 popover 未打开，就打开它
    if (!isPopoverOpen) {
        popoverContainer.showPopover();
        isPopoverOpen = true;
    }
};
const closePopover = () => {
    messageCount--;
    if (messageCount <= 0) {
        messageCount = 0;
        // 只有计数器归零且 popover 还开着时才关闭
        if (isPopoverOpen) {
            popoverContainer.hidePopover();
            isPopoverOpen = false;
        }
    }
};
const createPopMessage = (options) => {
    const config = typeof options === 'string'
        ? { message: options }
        : { ...options };
    if (!isSupported)
        return ElMessage(config);
    // 打开 popover
    openPopover();
    // 保存原始 onClose 回调
    const originalOnClose = config.onClose;
    // 设置 appendTo 和 onClose
    config.appendTo = popoverContainer;
    config.onClose = () => {
        closePopover();
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
    if (!isSupported)
        return;
    messageCount = 0;
    if (isPopoverOpen) {
        popoverContainer.hidePopover();
        isPopoverOpen = false;
    }
};
export { ElPopMessage };
//# sourceMappingURL=ElPopMessage.js.map