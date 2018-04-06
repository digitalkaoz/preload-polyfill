const fs = require('fs');

const INPUT = `${__dirname}/dist/preload-polyfill-inline.dev.js`;
const HTML = `${__dirname}/example/_index.html`;
const HTML_RESULT = `${__dirname}/example/index.html`;

const inlineScript = fs.readFileSync(INPUT);
const htmlContent = fs.readFileSync(HTML, 'utf-8').toString();

fs.writeFileSync(HTML_RESULT, htmlContent.replace('//INLINE//', inlineScript));