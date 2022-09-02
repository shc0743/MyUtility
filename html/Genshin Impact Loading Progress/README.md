# Genshin Impact Loading Progress
Usage:

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
