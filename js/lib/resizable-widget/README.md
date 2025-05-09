# resizable-widget

## Usage

1. run `npm install resizable-widget`
2. remember to register the widget before using it

```javascript
import { registerResizableWidget } from 'resizable-widget';
registerResizableWidget();
// or use a custom name
registerResizableWidget('my-resizable-widget');
// To register more than one instance, use the following:
registerResizableWidget('my-resizable-widget', true); // force register
```

3. use the widget in your HTML

```html
<resizable-widget id="w">
    <div slot="widget-caption">
        <span>My Widget</span>
        <button data-comment="// close or remove the widget...">x</button>
    </div>

    your content...
</resizable-widget>
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
```

## Tech stack

- Web Components

## Known problems

- Lack of `d.ts` file for TypeScript support. Will be added in the future.

## License

[Unlicense](./LICENSE)
