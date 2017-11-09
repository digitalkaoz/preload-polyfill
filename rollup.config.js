import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
  input: `src/${process.env.FILE}.js`,
  output: {
    file: `dist/${process.env.FILE}.js`,
    format: "iife",
    name: `preload${process.env.FILE.charAt(0).toUpperCase() +
      process.env.FILE.slice(1)}`
  },
  plugins: [babel(), process.env.BABEL_ENV === 'production' && uglify()]
};
