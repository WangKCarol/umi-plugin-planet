# umi-plugin-planet

[![NPM version](https://img.shields.io/npm/v/umi-plugin-planet.svg?style=flat)](https://npmjs.org/package/umi-plugin-planet)
[![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-planet.svg?style=flat)](https://npmjs.org/package/umi-plugin-planet)

config for planet

## Install

```bash
# or yarn
$ npm install umi-plugin-planet
```
## Development UI

UI mini start:

```bash
$ npm run build --watch
$ npm run start
```

## Usage

Configure in `.umirc.js`,

```js
export default {
  plugins: [
    ['umi-plugin-planet'],
  ],
}
```

## Options

```js
export default {
  qiankun: {
    // qiankun config
    master: {
      apps: [
        // config xingxingId only
        { xingxingId: '' }
      ]
    }
  },
  planet: {
    // umi-request config
    proxy: { // cors
      development: 'http://localhost:8008/',
      production: 'http://localhost:8009/',
    },
  }
}
```

## LICENSE

MIT
