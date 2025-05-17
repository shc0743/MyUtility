# play-video-streamed

A simple utility library for streaming MP4 video playback in HTML5 `<video>` elements, supporting custom chunk reading and playback control.

## Installation

```bash
npm i play-video-streamed
```

## API

### setLogEnabled(enabled: boolean): void

Enable or disable logging.

- `enabled`: Whether to enable logging (`true`/`false`)

**Notice**: It is *NOT* recommended to enable logging in production environments.

### class NotSupportError extends Error

Exception that is thrown when the browser does not support the `MediaSource` API or the video format is not supported.

### PlayMp4Video

```typescript
PlayMp4Video(
  video: HTMLVideoElement,
  fileReader: (start: number, end: number, abort?: AbortController) => Promise<ArrayBuffer>,
  bs?: number,
  onVideoEnd?: ((end_of_stream_func: () => void) => void) | null
): Promise<() => void>
```

- `video`: Target `<video>` element
- `fileReader`: Async function to read file data for the specified range, returns `ArrayBuffer`
- `bs`: Buffer size in bytes (default: 1MB)
- `onVideoEnd`: Optional callback when video **buffer loading is complete**, receives a callable `end_of_stream_func`
- Returns: Promise that resolves to a cleanup function (call to stop playback)

> **Note:** The `onVideoEnd` callback is **not** the same as the `<video>` element's `onended` event handler.  
> - `onVideoEnd` is called when the **video buffer has finished loading**, which is more similar to the `canplaythrough` event.
> - The `<video>` element's `onended` event is triggered when **video playback has actually finished** (i.e., the playhead reaches the end).
>  
> Please be aware of this distinction when handling video end logic in your application.

### About the `abort` parameter in `fileReader`

If possible, you should handle the third parameter `abort` in your `fileReader` implementation. For example, when using `fetch` to load data from a server, you can pass `abort.signal` to the fetch call to allow aborting in-flight requests and save network traffic:

```javascript
// Example: fileReader with abort support for network requests
async function fileReader(start, end, abort) {
    const response = await fetch(`/video.mp4`, {
        headers: {
            'Range': `bytes=${start}-${end-1}`
        }，
        signal: abort?.signal
    });
    return await response.arrayBuffer();
}
```

If you are reading from a local file (e.g., using `Blob.slice()`), you can safely ignore the `abort` parameter, as aborting is not necessary in this scenario:

```javascript
// Example: fileReader for local files (abort can be ignored)
async function fileReader(start, end) {
    return await file.slice(start, end).arrayBuffer();
}
```

## Example

```javascript
import { PlayMp4Video } from "play-video-streamed";

// Assume you have a fileReader function and a video element
const video = document.getElementById("myVideo");
const file = document.getElementById("myFile").value[0];
async function fileReader(start, end) {
    return await (file.slice(start, end).arrayBuffer());
}

// Play video
const cleanup = await PlayMp4Video(video, fileReader);

// When you want to remove the video, call the cleanup function
something.addEventListener("click", () => {
    cleanup();
})
```

## Notice about `onVideoEnd` callback

We *did not* call the `mediaSource.endOfStream()` method defaultly. This is because: If the endOfStream() method is called, the video will be unable to play again (because we cannot add new data to the source buffer of a 'ended' MediaSource object). This *should not be* a problem, because we have added a `timeupdate` event listener, which will process the end event (If the video.loop is false, the onended will pause the video; If the video.loop is true, the onended will seek to the beginning of the video). So it is **not recommended** to call the `mediaSource.endOfStream()` method.

However, if you have a specific need to call the `mediaSource.endOfStream()` method, you can pass the `onVideoEnd` callback to the `PlayMp4Video` function. The parameter passed to the `onVideoEnd` callback is a callable `end_of_stream_func`. You can call the `end_of_stream_func`, which will call the `mediaSource.endOfStream()` method.

**Important**: If you do **not** call the `end_of_stream_func`, the `<video>` element's `onended` event will **never** be triggered when playback reaches the end. You will need to handle the end-of-video logic manually in your application if you rely on this event. (e.g. use the `timeupdate` event to check if the video has reached the end)

```javascript
// Play video
const cleanup = await PlayMp4Video(video, fileReader, undefined/*keep default block size*/, (end_of_stream_func) => {
    // Call the end_of_stream_func to call the mediaSource.endOfStream() method.
    end_of_stream_func();
});

// When you want to remove the video, call the cleanup function
something.addEventListener("click", () => {
    cleanup();
})
```

**Notice again**: It is *NOT* recommended to call the `mediaSource.endOfStream()` method unless you can provide that you have a very specific need to do so. e.g. You will only play the video once, and you disallow the user from seeking the video. In this case, you can call the `mediaSource.endOfStream()` method to save memory. Otherwise, *Never* call it since it will break the video seeking.

## License

MIT
