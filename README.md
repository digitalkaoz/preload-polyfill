# Preload Polyfill

> it just works...

## What & Why

`preload` seems the best async loading mechanism today...

https://caniuse.com/#search=preload

some good reads:

* https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf
* https://hacks.mozilla.org/2017/09/building-the-dom-faster-speculative-parsing-async-defer-and-preload/
* https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/
* https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

## Install with npm

```
npm install @digitalkaoz/preload-polyfill
```

## Usage

This Polyfill supports the following types:

- [x] js
- [x] css
- [x] font
- [x] image
- [ ] audio (not well tested)
- [ ] document (not well tested)
- [ ] embed (not well tested)
- [ ] fetch (not well tested)
- [ ] object (not well tested)
- [ ] track (not well tested)
- [ ] worker (not well tested)
- [ ] video (not well tested)

https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

**Integration in your Page**

> the `polyfill` and the `invoke` script are seperated

```html
    <script src="/dist/preload-polyfill.min.js"></script>
    <script src="/dist/preload-polyfill-invoke.min.js"></script>
```

additionally you need an inline script (for browsers that are preload capable, preloading stuff could be faster than loading an external sync script, and you would miss the `load` event)

```html
    <script>/dist/preload-polyfill-inline.min.js</script>
```

**Preloading Stuff**

simply use it as follows:

```html
<link rel="preload" as="script" href="jquery.js" />
```


### Additional Features

> beware those are not spec compliant features

**critical**

those resources will be fetched non blocking, but executed first in order they appear

```html
<link rel="preload" critical as="script" href="jquery.js" />
```

**fonts**

to preload fonts correctly you have to set a name property on the links

```html
<link rel="preload" name="FontName" weight="bold" as="font" crossorigin type="font/woff2" href="font.woff2" />
```

**module**

those resources will only be fetched if browser understands es6

```html
<link rel="preload" module as="script" href="app.es6.js" />
```

**nomodule**

those resources will only be fetched if browser cant understand es6

```html
<link rel="nomodule" as="script" href="app.legacy.js" />
```

**AllScriptsExecuted Event**

`window.onload` can be fired even if not all preloaded scripts are executed, therefore we dispatch an event `AllScriptsExecuted` which indicates all preloaded stuff is executed too.

## Development

```
$ npm start
```

now visit https://localhost:5000

## TODOS

- [ ] With "disable-cache" the requests will be made twice
- [ ] tests
- [ ] make the execution of the preloaded scripts delay `window.onload` so we can get rid of the custom Event (already works in Chrome)
- [ ] media support (https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content#Including_media)

## Thanks

* https://github.com/jonathantneal/preloadfill
* https://github.com/aFarkas/link-preload

