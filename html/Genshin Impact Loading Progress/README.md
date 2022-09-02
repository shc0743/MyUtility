# Genshin Impact Loading Progress
## Usage:

`<script src="progress_2.js"></script>`

```
<script>
let progress = new GenshinImpactLoadingProgressClass();
progress.show();

// Do your thing...
progress.value = YourValue;

// Completed
progress.value = 100;
progress.hide();

// Destroy after use
progress.destroy();

// Or you can use vvvv to destroy with animals:
//progress.hide_and_destroy();
</script>
```

See live demo [here](https://shc0743.github.io/test/demo/GenshinImpactLoadingProgress/).

## Commands list:

```
let prog = new GenshinImpactLoadingProgressClass([Parent Element])
[Parent Element]: Special a element to be the progress's parent. Default: (document.body || document.documentElement)
```

```
prog.min [=NewValue]
Get or set the min value for the progress.
```
```
prog.max [=NewValue]
Get or set the max value for the progress.
```
```
prog.value [=NewValue]
Get or set the current value for the progress.
```

```
prog.hide()
Hide the progress with animation.
```
```
prog.show()
Show the progress. Call this after init.
```
```
prog.toggle()
Toggle the progress visible state.
```
```
prog.getState()
Get current state.
[Return value] [Object]{
    state: {
        value: [value],
        min: [min],
        max: [max],
        visible: [Visible],
        visibility: ((0 -> Hidden)|(1 -> Shown)|(2 -> Hiding))
    }
}
```
```
prog.redraw()
Redraw backdrop for the progress. Please call this when parent element (or page) resize.
```
```
prog.hide_and_destroy()
Destroy the progress after hide it with animation.
```
```
prog.destroy()
Destroy the progress directly.
```

