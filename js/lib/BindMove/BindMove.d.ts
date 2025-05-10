declare module "bindmove" {
    /**
     * 版本号
     */
    export const VERSION: bigint;

    /**
     * 产品ID
     */
    export const ProductId: string;

    /**
     * 空操作函数，用于阻止默认事件
     * @param ev 事件对象
     */
    export function nop(ev: Event): false;

    /**
     * 绑定移动功能的选项
     */
    export interface BindMoveOptions {
        /**
         * 容器元素，默认为 document.documentElement
         */
        container?: HTMLElement | Document;
        /**
         * 是否使用CSS transform居中定位(即使用了`transform:translate(-50%,-50%)`的居中元素)
         * 设置此选项可确保这类元素的拖动位置计算正确
         */
        isTranslatedToCenter?: boolean;
        /**
         * 是否使用 fixed 定位
         */
        isFixed?: boolean;
    }


    /**
     * 为元素绑定移动功能
     * @param el 要绑定移动功能的元素
     * @param target 实际移动的目标元素，默认为 el
     * @param options 配置选项
     */
    export function BindMove(el: HTMLElement, target?: HTMLElement, options?: BindMoveOptions): void;

    /**
     * 解除元素的移动功能绑定
     * @param el 要解除绑定的元素（对应BindMove方法的`el`而不是`target`）
     */
    export function UnBindMove(el: HTMLElement): void;

    /**
     * 添加CSS样式
     * @param css CSS样式字符串
     * @param el 要添加到的元素，默认为 null (添加到document)
     * @param adopt 是否使用 adoptedStyleSheets，默认为 false
     * @returns 返回添加的样式表或style元素
     */
    export function addCSS(css: string, el?: Document | ShadowRoot | null, adopt?: boolean): CSSStyleSheet | HTMLStyleElement;

    /**
     * 绑定移动功能使用的CSS样式
     */
    export const BindMove_css: CSSStyleSheet | HTMLStyleElement;
}
