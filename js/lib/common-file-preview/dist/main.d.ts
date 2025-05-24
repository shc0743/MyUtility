export type ConfigName = 'DisallowTextPreview' | 'DisallowMediaPreview' | 'DisallowAudioPreview' | 'DisallowVideoPreview' | 'DisallowImagePreview' | 'DisallowOnlinePreview' | 'DisallowPdfPreview' | 'DisallowOnlineOfficeFilePreview' | 'PreferredVolume';
export interface ConfigProvider {
    get(name: ConfigName): Promise<string | null>;
    set(name: ConfigName, value: string): Promise<void>;
}
export declare const setConfigProvider: (provider: ConfigProvider) => void;
export declare function config(name: ConfigName, value: string): Promise<void>;
export declare class HTMLCommonFilePreviewElement extends HTMLElement {
    #private;
    static stylesheet: CSSStyleSheet;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    init(get_url: (expiration?: number) => Promise<string>, fileType: string, fileName: string): Promise<void>;
}
