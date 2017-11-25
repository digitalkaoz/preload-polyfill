module.exports = {
  "plugins": [],
  "presets": [
    ["@babel/preset-env", {
      "modules" : false,
      "targets": {
        "browsers": ["IE 9"]
      }
    }]
  ],
  "env": {
    "production": {
      "plugins" : [
        ["babel-plugin-transform-remove-console", { "exclude": [ "error", "warn"] }]
      ]
    },
    "staging": {
      "plugins" : [
        ["babel-plugin-transform-remove-console", { "exclude": [ "error", "warn"] }]
      ]
    }
  }
}