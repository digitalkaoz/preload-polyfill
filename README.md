# Preload Polyfill


> it somehow works...

TODOS:
-----

- [x] delay invokation until all resources are fetched
- [ ] on error handling ()
- [ ] somehow sometimes resources are fetched again while invoking (only when triggering on DOMContentLoaded, window.load works as expected) (do the browser need some time to mark this file as cached?)
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

