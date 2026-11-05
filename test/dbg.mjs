import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'] });
const url = 'file:///home/claude/philips-v3/dist/Philips_Lighting_V3_Experience.html';
const m = await b.newPage({viewport:{width:390,height:844}});
m.on('pageerror',e=>console.log('ERR',e.stack.split('\n').slice(0,4).join('|')));
await m.route(/^https?:\/\/(?!file)/,r=>r.abort());
for (const r of ['','#/studio','#/shop','#/rooms','#/contact','#/stores','#/inspiration']) {
 await m.goto(url+r); await m.waitForTimeout(1800);
 const w = await m.evaluate(()=>{const W=innerWidth;const bad=[...document.querySelectorAll('#app *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>W+2&&r.width>0&&getComputedStyle(e).position!=='fixed'}).slice(0,4).map(e=>e.className.toString().slice(0,40)||e.tagName);return {sw:document.documentElement.scrollWidth,bad}});
 console.log(r||'home',JSON.stringify(w));
}
await b.close();
