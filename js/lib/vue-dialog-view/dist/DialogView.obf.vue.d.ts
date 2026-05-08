interface Props {
    modelValue: boolean;
    showTitleBar?: boolean;
    showCloseButton?: boolean;
    closable?: boolean;
    closeOnClickMask?: boolean;
}
declare var __VLS_1: {}, __VLS_3: {}, __VLS_5: {};
type __VLS_Slots = {} & {
    title?: (props: typeof __VLS_1) => any;
} & {
    default?: (props: typeof __VLS_3) => any;
} & {
    footer?: (props: typeof __VLS_5) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {
    get: () => HTMLDialogElement | undefined;
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
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
