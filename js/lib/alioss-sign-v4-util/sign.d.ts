declare module 'alioss-sign-v4-util' {
    /**
     * 将 Date 对象转换为 OSS V4 签名所需的 ISO8601 格式字符串 (e.g. "20250201T053008Z")
     * @param date 可选，默认为当前时间
     */
    export function ISO8601(date?: Date): string;

    /**
     * 生成 CanonicalHeaders 字符串
     * @param date (没有用到，属于遗留问题，可以直接不提供此参数)ISO8601 格式日期字符串
     * @param host (没有用到，属于遗留问题，可以直接不提供此参数)主机名
     * @param additionalHeadersList 额外的请求头
     */
    export function getCanonicalHeaders(
        date: string,
        host: string,
        additionalHeadersList?: Record<string, string>
    ): {
        result: string;
        headers: string;
        headers_additional: string;
    };

    /**
     * 对路径进行标准化编码 (替换特殊字符)
     * @param pathname 原始路径
     */
    export function makePathNameStandard(pathname: string): string;

    /**
     * 生成规范化的查询字符串
     * @param url URL 对象
     */
    export function getCanonicalQueryString(url?: URL): string;

    /**
     * 阿里云 OSS V4 签名 - URL 签名
     * @param user_url 要签名的URL（字符串或URL对象）
     * @param options 签名配置
     */
    export function sign_url(
        user_url: string | URL,
        options: {
            access_key_id: string;
            access_key_secret: string;
            additionalHeadersList?: Record<string, string>;
            base_url?: string;
            expires?: number;
            bucket?: string | null;
            region: string;
            method?: string;
            date?: Date;
        }
    ): Promise<string>;

    /**
     * 阿里云 OSS V4 签名 - 请求头签名
     * @param user_url 要签名的URL（字符串或URL对象）
     * @param options 签名配置
     * @returns 签名后的`Authorization`请求头值，直接整个提供给fetch即可
     */
    export function sign_header(
        user_url: string | URL,
        options: {
            access_key_id: string;
            access_key_secret: string;
            additionalHeadersList?: Record<string, string>;
            base_url?: string;
            expires?: number;
            bucket?: string | null;
            region: string;
            method?: string;
            date?: Date;
        }
    ): Promise<string>;

// HMAC-SHA256 内部实现 (不需要导出)
// function hmacsha256(key: any, message: string): any;
  }