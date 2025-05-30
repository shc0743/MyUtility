import { ZIndexManagerClass } from "dom-zindex-manager";

declare global {
    class HTMLResizableWidgetElement extends HTMLElement {
        get [Symbol.toStringTag](): string;

        open: boolean;
        zIndexManagementProhibited: boolean;

        static readonly MIN_SIZE: number;
        static readonly SIZING_ATTRS: string[];

        close(): void;
    }
    interface HTMLElementTagNameMap {
        'resizable-widget': HTMLResizableWidgetElement;
    }
}
declare module "resizable-widget" {
    export const ResizableWidgetCSS1: string;
    export const ResizableWidgetCSS2: string;
    export const zIndexManager: ZIndexManagerClass;

    /**
     * @deprecated Deprecated. See [README.md]
     */
    export function registerResizableWidget(tagName = 'resizable-widget', force = false): void;

    export type HTMLResizableWidgetElement = globalThis.HTMLResizableWidgetElement;
}