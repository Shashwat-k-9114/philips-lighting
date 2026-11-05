import { build } from 'esbuild';
import fs from 'node:fs';
const js = await build({ entryPoints: ['src/app.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', legalComments: 'none', loader: { '.svg': 'dataurl' } });
const css = await build({ entryPoints: ['src/styles.css'], bundle: true, minify: true, write: false, loader: { '.woff2': 'dataurl' } });
const html = fs.readFileSync('src/index.template.html', 'utf8')
  .replace('/*CSS*/', () => css.outputFiles[0].text)
  .replace('/*JS*/', () => js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
fs.writeFileSync('dist/Philips_Lighting_V3_Experience.html', html);
console.log('built', (html.length / 1024).toFixed(0) + ' KB');
