interface Props {
    modelValue: boolean;
    showTitleBar?: boolean;
    showCloseButton?: boolean;
    closable?: boolean;
    closeOnClickMask?: boolean;
}
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        title?(_: {}): any;
        default?(_: {}): any;
        footer?(_: {}): any;
    };
    refs: {
        dialogRef: HTMLDialogElement;
    };
    rootEl: HTMLDialogElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<Props, {
    open: () => void;
    close: () => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:modelValue": (value: boolean) => any;
    closed: () => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: boolean) => any) | undefined;
    onClosed?: (() => any) | undefined;
}>, {
    showTitleBar: boolean;
    showCloseButton: boolean;
    closable: boolean;
    closeOnClickMask: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    dialogRef: HTMLDialogElement;
}, HTMLDialogElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
