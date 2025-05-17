declare module "play-video-streamed" {
    /**
     * Enables or disables logging
     * @param enabled - Whether to enable logging
     */
    export function setLogEnabled(enabled: boolean): void;

    /**
     * Exception class for unsupported operations
     */
    export class NotSupportError extends Error {
        constructor(message: string);
        name: "NotSupportError";
    }

    /**
     * Simplified wrapper for playing MP4 videos
     * @param video - The video element to play the stream in
     * @param fileReader - Function to read file chunks
     * @param bs - Buffer size in bytes (default: 1MB)
     * @param onVideoEnd - Optional callback when video ends.
     * @throws {NotSupportError} If the browser does not support MediaSource or the video codec
     * @throws {Error} If the load timed out
     * @returns A cleanup function to stop playback
     */
    export function PlayMp4Video(
        video: HTMLVideoElement,
        fileReader: (
            start: number,
            end: number,
            abort?: AbortController
        ) => Promise<ArrayBuffer>,
        bs?: number,
        onVideoEnd?: ((end_of_stream_func: function (): void) => void) | null
    ): Promise<() => void>;
}