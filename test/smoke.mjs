import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.route(/^https?:\/\/(?!file)/, r => r.abort());
const url = 'file:///home/claude/philips-v3/dist/Philips_Lighting_V3_Experience.html';
await p.goto(url); await p.waitForTimeout(2500);
await p.screenshot({ path: 'shots/home.png' });
const routes = ['#/shop','#/rooms','#/inspiration','#/stores','#/contact','#/studio','#/product/'+(await p.evaluate(()=>'')) ];
for (const r of ['#/shop','#/rooms','#/inspiration','#/stores','#/contact','#/studio']) {
  await p.goto(url + r); await p.waitForTimeout(2200);
  const n = await p.evaluate(() => document.querySelector('#app').innerText.length);
  console.log(r, 'textLen', n);
  await p.screenshot({ path: 'shots/' + r.replace(/\W/g,'') + '.png' });
}
const s = await p.evaluate(() => { const w = window.__studio; return w ? { sol: w.sol && Object.keys(w.sol).slice(0,12), avg: w.sol && (w.sol.avg ?? w.sol.Eavg) } : null; });
console.log('studio', JSON.stringify(s));
console.log('ERRORS', errs.length); errs.slice(0,15).forEach(e => console.log(e));
await b.close();
