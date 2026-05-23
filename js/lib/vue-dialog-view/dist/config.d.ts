export interface DialogViewConfig {
    theme: 'light' | 'dark' | 'auto';
}
export declare const dialogViewConfig: import("vue").Ref<{
    theme: "light" | "dark" | "auto";
}, DialogViewConfig | {
    theme: "light" | "dark" | "auto";
}>;
export declare function setDialogViewConfig(newConfig: Partial<DialogViewConfig>): void;
