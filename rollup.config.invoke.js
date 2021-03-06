import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
  input: `src/invoke.js`,
  output: {
    file: `dist/preload-polyfill-invoke${process.env.BABEL_ENV === 'production' ? '.min' : process.env.BABEL_ENV === 'staging' ? '' : '.dev'}.js`,
    format: "iife",
    name: `preload_polyfill_invoke`
  },
  plugins: [babel(), process.env.BABEL_ENV === 'production' && uglify()]
};
