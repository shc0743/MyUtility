import { ElMessage, type MessageOptions } from 'element-plus';
type ElPopMessageFn = {
    (options: MessageOptions | string): ReturnType<typeof ElMessage>;
    closeAll: () => void;
    success: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
    warning: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
    error: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
    info: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
    primary: (options: MessageOptions | string) => ReturnType<typeof ElMessage>;
};
declare const ElPopMessage: ElPopMessageFn;
export { ElPopMessage };
//# sourceMappingURL=ElPopMessage.d.ts.map