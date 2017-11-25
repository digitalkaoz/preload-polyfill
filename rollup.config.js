import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
  input: `src/polyfill.js`,
  output: {
    file: `dist/preload-polyfill${process.env.BABEL_ENV === 'production' ? '.min' : process.env.BABEL_ENV === 'staging' ? '' : '.dev'}.js`,
    format: "iife",
    name: `preload_polyfill`
  },
  plugins: [babel(), process.env.BABEL_ENV === 'production' && uglify()]
};
