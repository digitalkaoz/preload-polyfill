# Preload Polyfill


> it somehow works...

Problems:
* DOMContentLoaded is too early (not all resources may be loaded at this point
* With "disable-cache" the requests will be made twice

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

