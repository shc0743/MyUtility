# resizable-widget

## Online Demo

[See a online demo here](https://codepen.io/shc0743/pen/bNNmVjz)

## Usage

1. run `npm install resizable-widget`
2. remember to **import the library** before using it (it will be automatically registered as `<resizable-widget>`; if not registered, the widget will not work)

```javascript
import 'resizable-widget';
```

**Notice**: The old-styled `registerResizableWidget` has been removed. Now we automatically register the widget as `<resizable-widget>`. If you want to use the old-styled `registerResizableWidget`, you will have to install `<=1.1.1` version.

3. use the widget in your HTML

```html
<!-- Example code: Modify it if you want to use in your project -->
<div id="container">
    <resizable-widget id="w" style="width: 400px; height: 300px;">
        <div slot="widget-caption" id="t">
            <span>My Widget</span>
            <button data-comment="// close or remove the widget..." id=x data-exclude-bindmove>x</button>
        </div>
        your content... (you can put anything, and the overflow will be automatically proceeded)
    </resizable-widget>
</div>
```

Stylesheet:
```css
#container {
    position: absolute;
    inset: 0;
}
#t {
    display: flex;
    overflow: hidden;
}
#t > span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

4. Open the widget by:

```javascript
document.getElementById('w').open = true;
```

5. Close the widget by:

```javascript
document.getElementById('w').open = false;
// or:
document.getElementById('w').close();
// example:
document.getElementById('x').onclick = () => {
    document.getElementById('w').open = false;
}
```

## Notice

1. **The container must have a height**. In the example, we use `position: absolute; inset: 0;` to make the container full screen. If you directly put the widget in the body **AND** the `height` of your body is `0` (often seen in some SPA apps), it will **NOT** work and the widget will "disappear" when you try to move it. (In fact, in the case the element will have a "negative" `top` value, that's why it will "disappear".)
2. The container **can** be the body, but you must ensure that the `height` of your body is not `0`. In some SPA apps, the following DOM is often seen: `<div id=app></div>` Then if the `#app` is `position: absolute; inset: 0;`, the `height` of your body will be `0`. 
3. **In the caption**, you *must* put `data-exclude-bindmove` attribute on clickable or interactive elements. Otherwise, the `onclick` (and other) event will **never** be triggered.
4. **The caption bar is not necessary**. It is *not* required to have a `slot="widget-caption"` element in a widget. If not provided, the widget will be `plain`. 
5. **There is no default caption bar**. If not provided, the widget will *not* be moveable. To make it moveable, you must provide a `slot="widget-caption"` element.

## Tech stack

- Web Components

## Known problems

- Doesn't work well in some browsers

## License

[Unlicense](./LICENSE)
