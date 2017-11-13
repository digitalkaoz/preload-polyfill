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

TODOS:
-----

- [ ] firefox sometimes failed to grep the preloaded resources from cache
- [ ] With "disable-cache" the requests will be made twice
- [ ] document all the things
- [ ] include simplehttp2server for `npm run dev`
- [ ] tests 
- [ ] media support (https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content#Including_media)

## Usage

This Polyfill supports the following types:

- [] js
- [x] css
- [x] font
- [x] image
- [] audio
- [] document
- [] embed
- [] fetch
- [] object
- [] track
- [] worker
- [] video

https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

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
<link rel="preload" name="FontName" as="font" crossorigin type="font/woff2" href="font.woff2" />
```

**async**

those resources will be fetched non blocking, but executed async

```html
<link rel="preload" async as="script" href="async.js" />
```

**module**

those resources will only be fetched if browser understands es6

```html
<link rel="preload" module as="script" href="app.es6.js" />
```

**nomodule**

those resources will only be fetched if browser cant understand es6

```html
<link rel="preload" nomodule as="script" href="app.legacy.js" />
```


## Development

```
$ npm i
$ npm run dev &
$ simplehttp2server
```

now visit https://localhost:5000

## Thanks

* https://github.com/jonathantneal/preloadfill
* https://github.com/aFarkas/link-preload

