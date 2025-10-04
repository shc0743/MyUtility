export declare const menu_class = "WINCLASS-_32768";
export declare const LAST_POSITION: unique symbol;
type MenuType = string | 'separator' | typeof String;
interface MenuConfig {
    submenu?: boolean;
    disabled?: boolean;
    align?: 'left' | 'right' | 'center';
}
type MenuPosition = number | typeof LAST_POSITION | 'center';
type MenuFlags = number | {
    align: {
        left: boolean;
        right: boolean;
        bottom: boolean;
        top: boolean;
    };
    closeOnBlur?: boolean;
};
export declare function CreatePopupMenu(): HTMLDivElement;
export declare function AppendMenu(hMenu: HTMLElement, type: MenuType, config: MenuConfig, data: string, event: (this: HTMLDivElement, ev: PointerEvent) => any): HTMLDivElement | undefined;
export declare function TrackPopupMenu(hMenu: HTMLElement, x: MenuPosition, y: MenuPosition, flags?: MenuFlags): boolean;
export {};
//# sourceMappingURL=main.d.ts.map