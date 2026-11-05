import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox'] });
const url = 'file:///home/claude/philips-v3/dist/Philips_Lighting_V3_Experience.html';
const errs=[]; 
async function mk(w,h){const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(e.stack.split('\n').slice(0,3).join('|')));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|ERR_/.test(m.text()))errs.push(m.text())});await p.route(/^https?:\/\/(?!file)/,r=>r.abort());return p}
const p = await mk(1440,900);
await p.goto(url+'#/studio'); await p.waitForTimeout(2500);
const get=()=>p.evaluate(()=>{const s=window.__studio.sol;return {avg:+s.Eavg.toFixed(1),u0:+s.U0.toFixed(2)}});
const a0=await get();
for(let i=0;i<3;i++){await p.click('[data-a="n+"]');await p.waitForTimeout(400)}
const a1=await get();
console.log('1 unit',a0,'4 units',a1, 'ratio', (a1.avg/a0.avg).toFixed(2));
await p.fill('input[type=range] >> nth=0','100').catch(()=>{});
for (const t of ['Lux map','Plan view']) { await p.click(`text=${t}`); await p.waitForTimeout(900); await p.locator('.st-stage').screenshot({path:`shots/studio-${t.replace(' ','')}.png`}); }
await p.click('text=Bedroom'); await p.waitForTimeout(1500);
console.log('bedroom', await get());
await p.goto(url+'#/shop'); await p.waitForTimeout(1500);
const href = await p.evaluate(()=>document.querySelector('a[href^="#/product"]')?.getAttribute('href'));
console.log('pdp link', href);
await p.goto(url+href); await p.waitForTimeout(1500);
await p.click('text=/Add to bag/i').catch(e=>console.log('no add btn'));
await p.waitForTimeout(800);
console.log('drawer', await p.evaluate(()=>!!document.querySelector('.drawer')));
await p.screenshot({path:'shots/pdp-cart.png'});
const m = await mk(390,844);
await m.goto(url); await m.waitForTimeout(2500); await m.screenshot({path:'shots/m-home.png'});
await m.goto(url+'#/studio'); await m.waitForTimeout(2500); await m.screenshot({path:'shots/m-studio.png'});
const ov = await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
console.log('mobile h-overflow', ov);
console.log('ERRORS',errs.length,errs.slice(0,8));
await b.close();
