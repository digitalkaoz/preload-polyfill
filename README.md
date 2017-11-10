# Preload Polyfill


> it somehow works...

TODOS:
-----

- [ ] on error handling ()
- [ ] With "disable-cache" the requests will be made twice

- [ ] implement all preloadable resources
    - [x] js
    - [x] css
    - [x] font
    - [ ] image
    - [ ] audio
    - [ ] document
    - [ ] embed
    - [ ] fetch
    - [ ] object
    - [ ] track
    - [x] worker
    - [ ] video
- [x] make MutationObserver optional
- [x] make type=module nomodule work
- [x] sort preloads according to preload-scanner priorities
- [ ] document all the things
- [ ] tests
- [ ] get rid of `onload` attr

## Usage

### Additional Features

> beware those are not spec compliant features

**critical**

those resources will be fetched non blocking, but executed first in order they appear

```html
<link rel="preload" critical as="script" href="jquery.js" onload="loaded(this);revealJs(this)" />
```

**async**

those resources will be fetched non blocking, but executed async

```html
<link rel="preload" async as="script" href="async.js" onload="loaded(this);revealJs(this)" />
```

**type="module"**

those resources will only be fetched if browser understands es6

```html
<link rel="preload" type="module" as="script" href="app.es6.js" onload="loaded(this);revealJs(this)" />
```

**nomodule**

those resources will only be fetched if browser cant understand es6

```html
<link rel="preload" nomodule as="script" href="app.legacy.js" onload="loaded(this);revealJs(this)" />
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

