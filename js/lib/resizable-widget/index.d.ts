import { ZIndexManagerClass } from "dom-zindex-manager";

declare global {
    class HTMLResizableWidgetElement extends HTMLElement {
        get [Symbol.toStringTag](): string;

        /**
         * A boolean value indicating whether the widget is open. (getter/setter)
         */
        open: boolean;

        /**
         * If true, the widget's z-index will not be managed by the zIndexManager. (getter/setter)
         */
        zIndexManagementProhibited: boolean;

        static readonly MIN_SIZE: number;
        static readonly SIZING_ATTRS: string[];

        // Close the widget.
        close(): void;

        // Activate the widget.
        // To call `activate()`, the widget must *be managed*.
        activate(): void;
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