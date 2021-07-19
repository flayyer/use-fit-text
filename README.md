# @flyyer/use-fit-text

React hook that iteratively adjusts the font size so that text will fit in a div.

  - checks if text is overflowing by [using `scrollHeight` and `offsetHeight`](https://stackoverflow.com/a/10017343/101911)
  - recalculates when container is resized (using ([polyfilled](https://github.com/que-etc/resize-observer-polyfill)) [`ResizeObserver`](https://developers.google.com/web/updates/2016/10/resizeobserver))
  - recalculates when content changes
  - uses binary search; with default options, makes a maximum of 5 adjustments with a resolution of 5% font size from 20-100%
  - [< 4 kB](https://bundlephobia.com/result?p=@flyyer/use-fit-text) minified + gzipped
  - written in TypeScript

## Installation

This module is meant for Flyyer.io templates to generate dynamic og:images for your links. But you can use it in other projects if it fits your needs.

```sh
yarn add @flyyer/use-fit-text
```

## Usage

```tsx
import React from "react";
import clsx from "clsx";
import useFitText from "@flyyer/use-fit-text";

// Example for a flyyer.io template: $ npm create flyyer-app
export default function ExampleTemplate({ variables }) {
  const title = variables["title"];
  const description = variables["description"];

  // UI-dependent variables (title and description) are added to the hook's dependency array.
  const { fontSize, ref, isCalculating } = useFitText(
    {
      /** Depends on body's fontSize (usually 16px) */
      maxFontSize: 1000, // 1000%
      /** Lower values are more strict but causes more renders, defaults to `5` */
      resolution: 10,
    },
    [title, description],
  );

  const className = clsx({ "flyyer-wait": isCalculating }) // use class flyyer-wait to prevent eager renders of flyyer templates.
  return (
    <div ref={ref} style={{ fontSize, height: 40, width: 100 }} className={className}>
      <h1 style={{ fontSize: "2em" }}>
        {title}
      </h1>
      <p style={{ fontSize: "1.2em" }}>
        {description}
      </p>
    </div>
  );
}
```

If your text also depends on other style variables such as `fontFamily`, `letterSpacing`, etc; you should add them to the dependency array:

```tsx
const title = variables["title"];
const fontFamily = variables["fontFamily"];
const { fontSize, ref, isCalculating } = useFitText({}, [title, fontFamily, letterSpacing]);
// ...
```

## About

This project is a fork from [saltycrane/use-fit-text](https://github.com/saltycrane/use-fit-text).

The main difference is:

- The original project depends on the `innerHTML` of the `ref` element to check for changes.
- This fork has an explicit dependency array (same concept as `useEffect(, [dependencies])`).

The main benefic is explicit control and easier to trigger re-calculations.

## API

### `useFitText(options)`
- Returns an object with the following properties:
  - `fontSize` (`string`) - the font size as a string (CSS percent) to be passed as the `fontSize` property of the `style` prop of the `div`
  - `ref` (`React.MutableRefObject<HTMLDivElement>`) - the ref to be passed to the `ref` attribute of the `div`
- `options` (optional) - an object with the following optional properties:

  - `logLevel` (`string`, default: `info`) - one of `debug`, `info`, `warn`, `error`, or `none`
  - `maxFontSize` (`number`, default: `100`) - maximum font size in percent
  - `minFontSize` (`number`, default: `20`) - minimum font size in percent
  - `onFinish` (`(fontSize: number) => void`, default: `undefined`) - function that is called when resizing
      finishes. The final fontSize is passed to the function as an argument.
  - `onStart` (`() => void`, default: `undefined`) - function that is called when resizing starts
  - `resolution` (`number`, default: `5`) - font size resolution to adjust to in percent

## Questions

- Why doesn't it work with Flexbox `justify-content: flex-end;`?
  This appears [to be](https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar) [a bug](https://github.com/philipwalton/flexbugs/issues/53) with Flexbox. Try using CSS Grid or `margin-top: auto;`
- What does the "reached `minFontSize = 20` without fitting text" message in the console mean?
  This means `use-fit-text` was not able to fit the text using the `minFontSize` setting of 20. To ensure the text fits, set `minFontSize` to a smaller value.
