import { PRODUCTS, CATEGORIES, catById, byId, ROOMS, BLOG, LOOKS, HUB_CITIES, INDIA, CONTACT, STORE, LOGO, SIGNIFY_LOGO, LIVE_ASSETS, money, esc, STUDIO_IDS } from './data.js';
import { catIcon, fixtureArt, wave, flowArt, socialIcon } from './art.js';
import { mountHero } from './hero.js';
import { mountStudio } from './studio.js';
import { CONVO_LOGO } from './brand.js';

const readJSON = (k, f) => { try { const a = JSON.parse(localStorage.getItem('plv3-' + k)); return a === null ? f : a; } catch { return f; } };
const state = { cart: readJSON('cart', {}), saved: readJSON('saved', []), pin: readJSON('pin', ''), drawer: false, modal: null, mega: false, menu: false, search: false, cat: 'all', maxPrice: 40000, smartOnly: false, sort: 'featured', q: '', view: 'grid', look: 0, testi: 0 };
const persist = () => { try { localStorage.setItem('plv3-cart', JSON.stringify(state.cart)); localStorage.setItem('plv3-saved', JSON.stringify(state.saved)); localStorage.setItem('plv3-pin', JSON.stringify(state.pin)); } catch { /* storage blocked: keep in memory */ } };
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cartCount = () => Object.values(state.cart).reduce((a, b) => a + (+b || 0), 0);
const cartTotal = () => Object.entries(state.cart).reduce((a, [id, q]) => a + (byId(id)?.price || 0) * q, 0);
const MOV = 1500;
let cleanup = [];

/* ------------------------------ icons ------------------------------ */
const I = { arrow: 'M4 12h16m-7-7 7 7-7 7', up: 'M7 17 17 7M8 7h9v9', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4', heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.9 8.5 8.8-8.5a5.5 5.5 0 0 0 0-7.8z', bag: 'M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0', pin: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', close: 'M5 5l14 14M19 5L5 19', menu: 'M4 7h16M4 12h16M4 17h16', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', check: 'm4 12 5 5L20 6', truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', ret: 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5', shield: 'm12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z', mail: 'M3 6h18v12H3zM3 7l9 7 9-7', spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z', store: 'M4 9l1-5h14l1 5M4 9v11h16V9M9 20v-6h6v6', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', list: 'M4 6h16M4 12h16M4 18h16', chev: 'm6 9 6 6 6-6' };
const ic = (n, s = 18) => `<svg class="ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[n] || I.spark}"/></svg>`;

/* ------------------------------ shared pieces ------------------------------ */
const pct = p => (p.old ? Math.round((p.old - p.price) / p.old * 100) : 0);
const media = (p, cls = '') => p.img ? `<img class="real ${cls}" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.closest('.pimg,.gal-main,.q-i,.dli-i,.li-img,.sr-p span')?.classList.add('asset-failed');this.remove()">` : '';
const productCard = (p, i = 0) => `<article class="pcard glow tilt rv" style="--d:${(i % 4) * 70}ms" data-id="${p.id}">
  <a class="pimg" href="#/product/${p.id}" aria-label="${esc(p.name)}"><span class="aura"></span>${media(p)}${p.img ? '' : fixtureArt(p.art || 'panel', 30 + (p.price % 60))}
    <span class="ptags">${p.isNew ? '<b class="tg new">New</b>' : ''}${pct(p) ? `<b class="tg off">${pct(p)}% off</b>` : ''}${p.studio ? '<b class="tg st">Studio</b>' : ''}</span></a>
  <div class="pact"><button data-a="quick" data-id="${p.id}" aria-label="Quick view">${ic('eye', 17)}</button><button data-a="save" data-id="${p.id}" class="${state.saved.includes(p.id) ? 'on' : ''}" aria-label="Save">${ic('heart', 17)}</button></div>
  <div class="pbody"><span class="pcls">${esc(p.cls)}</span><h3><a href="#/product/${p.id}">${p.id === 'bulb' || p.id === 'plug' ? '' : 'Philips '}${esc(p.name)}</a></h3>
  <div class="pfoot"><span class="price">${money(p.price)}${p.old ? ` <del>${money(p.old)}</del>` : ''}</span><button class="add" data-a="add" data-id="${p.id}" aria-label="Add to bag">${ic('plus', 17)}</button></div></div></article>`;
const head = (eye, h, em, right = '') => `<div class="sec-head rv"><div><span class="eyebrow">${eye}</span><h2>${h} <em>${em}</em></h2></div>${right}</div>`;
const arrowLink = (t, href) => `<a class="arrow-link" href="${href}">${t} ${ic('up', 15)}</a>`;
const rowOf = ids => ids.map((id, i) => productCard(byId(id), i)).join('');

/* ------------------------------ chrome ------------------------------ */
const convoMark = (compact = false) => `<span class="cc-brand ${compact ? 'compact' : ''}" aria-label="Convo &amp; Connects"><img class="cc-logo" src="${esc(CONVO_LOGO)}" alt="Convo &amp; Connects logo"><span class="cc-copy"><b>Convo &amp; Connects</b><small>Brand &amp; experience concept</small></span></span>`;
const clientMarks = () => `<span class="brand-lockup" aria-label="Philips Lighting and Signify"><span class="philips-mark"><img src="${esc(LOGO)}" alt="Philips"></span><span class="mark-rule" aria-hidden="true"></span><span class="signify-mark"><img src="${esc(SIGNIFY_LOGO)}" alt="Signify"></span></span>`;
function logo() { return `<a class="brand" href="#/" aria-label="Convo &amp; Connects concept for Philips Lighting India, home">${convoMark()}${clientMarks()}<span class="bsub"><i>Philips Lighting India</i><small>Concept storefront</small></span></a>`; }
function mega() {
  const groups = [...new Set(CATEGORIES.map(c => c.g))];
  return `<div class="mega ${state.mega ? 'open' : ''}" id="mega" role="menu"><div class="mega-in"><div class="mega-cols">${groups.map(g => `<div><h4>${g}</h4>${CATEGORIES.filter(c => c.g === g).map(c => `<a href="#/shop?cat=${c.id}" role="menuitem">${catIcon(c.ic, 26)}<span>${c.n}</span><small>${PRODUCTS.filter(p => p.cats.includes(c.id)).length || ''}</small></a>`).join('')}</div>`).join('')}</div>
  <aside class="mega-promo"><span class="eyebrow">New · Light Studio</span><h3>See light before<br>you live it.</h3><p>Photometrically modelled rooms. Real lux, real colour temperature.</p><a class="btn light" href="#/studio">Enter the studio ${ic('arrow', 16)}</a><a class="all" href="#/shop?cat=all">All products ${ic('up', 14)}</a></aside></div></div>`;
}
function header(page) {
  const nav = [['', 'Home', 'home'], ['shop', 'Products', 'shop'], ['studio', 'Light Studio', 'studio'], ['rooms', 'Spaces', 'rooms'], ['inspiration', 'Inspiration', 'inspiration'], ['stores', 'Smart Light Hubs', 'stores'], ['contact', 'Contact', 'contact']];
  return `<div class="topbar"><div class="ticker"><span>${state.pin ? 'Delivering to ' + esc(state.pin) : 'Let’s light up your coordinates'}</span></div>
    <div class="tb-msg"><b>Diwali Utsav Sale LIVE NOW</b><span>·</span><span>Free doorstep delivery</span><span>·</span><span>7-day returns, no questions asked</span><span>·</span><span>Orders above ₹1,500</span></div>
    <button class="tb-pin" data-a="pin">${ic('pin', 14)} ${state.pin ? esc(state.pin) : 'Set delivery pincode'}</button></div>
  <header class="head" id="head"><div class="head-in">${logo()}
    <nav class="nav" aria-label="Main">${nav.map(([h, t, k]) => k === 'shop' ? `<button class="nav-btn ${page === 'shop' || page === 'product' ? 'active' : ''}" data-a="mega" aria-expanded="${state.mega}">${t} ${ic('chev', 14)}</button>` : `<a href="#/${h}" class="${page === k ? 'active' : ''}">${t}${k === 'studio' ? '<i class="pulse"></i>' : ''}</a>`).join('')}</nav>
    <div class="hacts"><button class="sbtn" data-a="search" aria-label="Search">${ic('search', 18)}<span>Search lights</span><kbd>/</kbd></button><button class="ib" data-a="account" aria-label="My account">${ic('user', 20)}</button><button class="ib" data-a="saved" aria-label="Saved">${ic('heart', 20)}${state.saved.length ? `<b class="cnt">${state.saved.length}</b>` : ''}</button><button class="bagbtn" data-a="cart" aria-label="Open bag">${ic('bag', 19)}<span>Bag</span><b class="cnt" id="cnt">${cartCount()}</b></button><button class="ib burger" data-a="menu" aria-label="Menu">${ic(state.menu ? 'close' : 'menu', 22)}</button></div></div>${mega()}</header>
  <div class="mnav ${state.menu ? 'open' : ''}"><a href="#/">Home</a><a href="#/shop?cat=all">All products</a><div class="mn-cats">${CATEGORIES.map(c => `<a href="#/shop?cat=${c.id}">${c.n}</a>`).join('')}</div><a href="#/studio">Light Studio</a><a href="#/rooms">Spaces</a><a href="#/inspiration">Inspiration</a><a href="#/stores">Smart Light Hubs</a><a href="#/contact">Contact</a></div>`;
}
function footer() {
  const pol = [['Site owner', 'site-owner'], ['Privacy policy', 'privacy'], ['Cookies notice', 'cookies'], ['Terms of sale', 'terms'], ['Cancel / return policy', 'returns'], ['Shipping policy', 'shipping']];
  return `${wave('#070b16', { amp: 22, per: 2.5, flip: true })}<footer class="foot"><div class="foot-glow"></div>
  <div class="foot-top"><div class="foot-brand">${logo()}<h2>Good light<br><em>changes everything.</em></h2><p>${esc(CONTACT.company)}.<br>Independent redesign concept by Convo &amp; Connects.</p>
    <div class="soc">${CONTACT.social.map(s => s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener" aria-label="${s.n}" title="${s.n} · ${esc(s.h)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${socialIcon(s.n)}</svg></a>` : `<span class="proposed" title="${s.n}: ${esc(s.h)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${socialIcon(s.n)}</svg></span>`).join('')}</div><small class="soc-note">Follow us · dashed icons are proposed channels</small></div>
    <div class="fcol"><h4>Product categories</h4><div class="two">${CATEGORIES.map(c => `<a href="#/shop?cat=${c.id}">${c.n}</a>`).join('')}</div></div>
    <div class="fcol"><h4>About &amp; policies</h4>${pol.map(([t, k]) => `<a href="#/policy/${k}">${t}</a>`).join('')}<a href="#/contact">Contact us</a></div>
    <div class="fcol"><h4>Business</h4><a href="#/stores">Philips Smart Light Hub stores</a><a href="#/contact?tab=partner">Become a partner</a><a href="#/contact?tab=sales">Contact sales</a><a href="#/contact?tab=distributor">Become a distributor</a><h4 class="mt">Support</h4><a href="#/stores">Store locator</a><a href="#/contact">Customer service</a><a href="${STORE}" target="_blank" rel="noopener">Download catalog ${ic('up', 12)}</a></div></div>
  <div class="foot-bar"><span>© 2018–2026 Signify Holding. All rights reserved. Philips and the Philips shield are trademarks of Koninklijke Philips N.V., used under licence by Signify.</span><span>Concept by Convo &amp; Connects · not affiliated with or endorsed by Philips or Signify · no live checkout</span></div></footer>
  <div class="ribbon" role="note">Independent redesign concept · Convo &amp; Connects · Demonstration only</div>`;
}

/* ------------------------------ pages ------------------------------ */
const heroCats = ['chandeliers', 'smart', 'ceiling', 'bulbs', 'wall', 'floor', 'strips', 'outdoor'];
function home() {
  const hubs = 345;
  const heroProduct = byId('gradient');
  return `<main class="home"><section class="hero" id="hero"><div class="hero-photo" aria-hidden="true"><img src="${esc(LIVE_ASSETS.hero)}" alt="" fetchpriority="high"></div><div class="hero-gl" id="hero-gl"></div><div class="hero-veil"></div>
    <div class="hero-in"><div class="hero-copy"><span class="eyebrow"><i class="pulse"></i> A Convo &amp; Connects concept for Philips Lighting India</span><h1><span class="l1">Light</span> <em class="l2">for the life</em><br><span class="l3">you live.</span></h1><p>From the first switch-on to the last quiet corner, discover Philips lighting by <em>mood, room and moment</em> — with real products, honest specs and a better way to choose.</p>
      <div class="hero-cta"><a class="btn light lg" href="#/shop?cat=all">Shop the collection ${ic('arrow', 18)}</a><a class="ghost" href="#/studio">Try Light Studio ${ic('up', 15)}</a></div>
      <ul class="trust"><li>${ic('truck', 18)}<b>Free doorstep delivery</b><small>5–7 business days</small></li><li>${ic('ret', 18)}<b>7-day returns</b><small>No questions asked</small></li><li>${ic('shield', 18)}<b>DigiShield warranty</b><small>Extended, by Signify</small></li></ul></div>
      <a class="hero-feature glow" href="#/product/${heroProduct.id}"><span class="hero-feature-kicker">Designed for the moment</span><div class="hero-feature-media"><img src="${esc(heroProduct.img)}" alt="${esc(heroProduct.name)}" fetchpriority="high"></div><div class="hero-feature-copy"><small>Philips smart lighting</small><b>${esc(heroProduct.name)}</b><span>${money(heroProduct.price)} <i>${pct(heroProduct)}% off</i> ${ic('up', 14)}</span></div></a></div>
    <div class="hero-orbs" aria-label="Shop by category">${heroCats.map((id, i) => { const c = catById(id); return `<a href="#/shop?cat=${id}" class="orb" style="--i:${i}"><span>${catIcon(c.ic, 30)}</span><b>${c.n}</b></a>`; }).join('')}</div>
    <div class="hero-caption"><span>Lighting that feels like you</span><i></i><small>Explore 19 categories</small></div><div class="scrollhint"><span>Scroll</span><i></i></div></section>
  ${wave('#f5f1ea', { amp: 30, per: 2, h: 140, cls: 'over-hero' })}
  <section class="sec paper"><div class="cats-wrap"><div class="sec-head rv"><div><span class="eyebrow">01 · Shop by category</span><h2>Every kind of light, <em>in one place.</em></h2></div>${arrowLink('All products', '#/shop?cat=all')}</div>
    <div class="cat-grid">${CATEGORIES.map((c, i) => { const n = PRODUCTS.filter(p => p.cats.includes(c.id)).length; return `<a class="cat glow rv" style="--d:${(i % 6) * 50}ms;--h:${(i * 19) % 360}" href="#/shop?cat=${c.id}"><span class="cat-art">${catIcon(c.ic, 58)}</span><b>${c.n}</b><small>${n ? n + ' in this snapshot' : 'Opens on the live feed'}</small><i>${ic('up', 15)}</i></a>`; }).join('')}</div></div></section>

  <section class="sec paper2 campaign-section"><div class="wrap"><div class="campaign-card rv"><div class="campaign-art"><img src="${esc(LIVE_ASSETS.campaign)}" alt="Current Philips Lighting India string-light promotion" loading="lazy"></div><div class="campaign-copy"><span class="eyebrow">02 · From the official store</span><h2>Bring home a little <em>more magic.</em></h2><p>Campaigns, launches and seasonal moments should feel native to the storefront — not bolted on. This live-store creative becomes a clear, shoppable story with the offer front and centre.</p><a class="btn dark" href="${STORE}" target="_blank" rel="noopener">See the live offer ${ic('up', 15)}</a><small>Official campaign artwork · offer terms and availability live on the Philips store.</small></div></div></div></section>

  <section class="sec paper2"><div class="wrap"><div class="sec-head rv"><div><span class="eyebrow">03 · New arrivals</span><h2>Fresh from <em>Signify.</em></h2></div>${arrowLink('View all new', '#/shop?cat=all')}</div><div class="rail">${rowOf(['chandelier', 'bulb', 'ultraglow', 'lucidus', 'fullglow'])}</div></div></section>
  ${wave('#080c1a', { amp: 34, per: 2.2, h: 150 })}
  <section class="sec dark studio-promo"><div class="sp-bg"></div><div class="wrap two"><div class="rv"><span class="eyebrow">03 · Introducing the Light Studio</span><h2>See light.<br><em>Before you live it.</em></h2><p>Pick a real Philips fixture, drop it in a room, and read the actual numbers: lux at the work plane, colour temperature on the Planckian locus, uniformity, watts and running cost. Where Signify’s listing doesn’t state a value, we say so and let you enter the datasheet or an IES file.</p>
    <ul class="ticks"><li>${ic('check', 16)} Lumens → candela → lux, in SI units</li><li>${ic('check', 16)} Virtual lux meter and false-colour map</li><li>${ic('check', 16)} Upload a manufacturer <b>.ies</b> file</li></ul><a class="btn light lg" href="#/studio">Open the studio ${ic('arrow', 18)}</a></div>
    <div class="sp-art rv" aria-hidden="true"><div class="sp-room"><div class="sp-glow"></div><div class="sp-fl"></div><div class="sp-readout"><b>148 lx</b><span>avg · 0.62 U₀ · 3000 K</span></div><div class="sp-sofa"></div></div></div></div></section>
  ${wave('#f5f1ea', { amp: 30, per: 2.8, h: 140, flip: true })}
  <section class="sec paper"><div class="wrap">${head('04 · Shop our bestsellers', 'Loved by', 'homes across India', arrowLink('See all', '#/shop?cat=all'))}<div class="grid4">${rowOf(['gradient', 'plug', 'downlight', 'lucidus'])}</div></div></section>
  <section class="sec paper2"><div class="wrap"><div class="two-rails"><div>${head('Wall lights', 'Our bestselling', 'wall lights')}<div class="grid3">${rowOf(['divine', 'trumpet', 'glow'])}</div></div><div>${head('Ceiling lights', 'Our bestselling', 'ceiling lights')}<div class="grid2">${rowOf(['fullglow', 'ultraglow'])}</div></div></div></div></section>
  ${wave('#0b1020', { amp: 28, per: 2, h: 130 })}
  <section class="sec dark look" id="look"><div class="wrap">${head('05 · Shop the look', 'The right light', 'for the right room')}<div class="look-tabs rv">${LOOKS.map((l, i) => `<button class="${state.look === i ? 'active' : ''}" data-a="look" data-id="${i}">${l.n}</button>`).join('')}</div><div id="look-body">${lookBody()}</div></div></section>
  ${wave('#f5f1ea', { amp: 28, per: 3, h: 130, flip: true })}
  <section class="sec paper"><div class="wrap rooms-love">${head('06 · Home owners love Philips lighting', 'The right light', 'for the right room')}<div class="room-tiles">${Object.entries(ROOMS).map(([n, r], i) => `<a href="#/rooms?room=${encodeURIComponent(n)}" class="rtile glow rv" style="--h:${[38, 265, 195, 150][i]};--d:${i * 70}ms"><span class="rt-art"><img src="${esc(r.img)}" alt="${esc(n)} lighting" loading="lazy"></span><span class="rt-n">0${i + 1}</span><div><small>${r.tag}</small><h3>${n} ${ic('up', 18)}</h3><p>${r.blurb}</p></div></a>`).join('')}</div></div></section>

  ${wave('#0b1020', { amp: 26, per: 2, h: 130 })}
  <section class="sec signify"><div class="sig-glow"></div><div class="wrap two"><div class="rv"><span class="eyebrow">07 · Light, by Signify</span><h2>The company behind <em>every Philips light.</em></h2><p>Signify (Euronext: LIGHT) is the world leader in lighting for professionals and consumers. Every product on this store is imported or made in India by <b>Signify Innovations India Ltd.</b>, formerly Philips Lighting India Ltd, and backed by Signify’s DigiShield extended warranty. The store’s own tagline calls Philips the “World’s No. 1 lighting brand”.</p><div class="stats"><div><b data-count="${hubs}">0</b><span>Philips Smart Light Hubs<br><small>announced May 2026</small></span></div><div><b data-count="19">0</b><span>product categories<br><small>on the official store</small></span></div><div><b data-count="50000">0</b><span>hour lifetime<br><small>Dura Slim, per listing</small></span></div></div><a class="btn light" href="#/stores">Find a Smart Light Hub ${ic('arrow', 16)}</a></div>
    <div class="sig-card rv"><span class="eyebrow">Corporate</span><dl><dt>Seller &amp; manufacturer</dt><dd>${esc(CONTACT.company)}</dd><dt>Registered office</dt><dd>Kolkata 700 017</dd><dt>Corporate office</dt><dd>DLF Cyber City, Gurugram 122002</dd><dt>Customer care</dt><dd>${CONTACT.phone}<br><small>${CONTACT.hours}</small></dd></dl><a class="arrow-link" href="#/contact">Contact &amp; grievance officer ${ic('up', 15)}</a></div></div></section>
  ${wave('#f5f1ea', { amp: 24, per: 2.6, h: 130, flip: true })}
  <section class="sec paper"><div class="wrap testi">${head('08 · What customers say', 'Light that', 'fits real lives')}<div class="tslider rv" id="tslider">${testimonials()}</div><p class="ill">Illustrative copy. Production migrates the verified testimonials already on the official store.</p></div></section>
  <section class="sec paper2"><div class="wrap">${head('09 · Inspiration', 'Ideas worth', 'switching on', arrowLink('All articles', '#/inspiration'))}<div class="blog-grid">${BLOG.slice(0, 3).map(blogCard).join('')}</div></div></section>
  ${wave('#0b1020', { amp: 30, per: 2, h: 130 })}
  <section class="sec social-sec"><div class="wrap"><div class="sec-head rv"><div><span class="eyebrow">10 · Follow Philips Lighting India</span><h2>Light, <em>in the wild.</em></h2></div><div class="soc-links">${CONTACT.social.filter(s => s.u).map(s => `<a href="${esc(s.u)}" target="_blank" rel="noopener">${s.n} <small>${esc(s.h)}</small> ${ic('up', 13)}</a>`).join('')}</div></div>
    <div class="soc-wall">${[LIVE_ASSETS.hero, LIVE_ASSETS.blogStrip, LIVE_ASSETS.bedroom, LIVE_ASSETS.kitchen, LIVE_ASSETS.blogLiving, LIVE_ASSETS.bathroom, LIVE_ASSETS.outdoor, LIVE_ASSETS.campaign].map((img, i) => `<a class="stile rv" style="--d:${i * 50}ms" href="${i < 3 ? esc(BLOG[i]?.href || STORE) : STORE}" target="_blank" rel="noopener"><img src="${esc(img)}" alt="Philips Lighting India inspiration" loading="lazy"><span>${['Living room layers', 'Strip lights, 5 ways', 'Smart bedroom light', 'Kitchen task light', 'The right living-room fixture', 'Bathroom brightness', 'Outdoor welcome', 'Seasonal campaign'][i]}</span></a>`).join('')}</div><p class="ill">Official-store photography and editorial references are used here as the content system; production can connect the same surfaces to a verified social feed.</p></div></section>
  ${wave('#f5f1ea', { amp: 28, per: 3, h: 130, flip: true })}
  <section class="sec news"><div class="wrap"><div class="news-card rv"><div><span class="eyebrow">11 · Newsletter</span><h2>First to see <em>what’s next.</em></h2><p>Launches, sales and lighting ideas. No spam.</p></div>${newsForm()}</div></div></section>
  </main>`;
}
const lookBody = () => { const l = LOOKS[state.look]; const items = l.ids.map(byId); return `<div class="look-grid"><div class="look-scene glow" style="--h:${l.hue};--bg:url('${esc(l.img)}')"><img class="look-photo" src="${esc(l.img)}" alt="${esc(l.n)} lighting inspiration" loading="lazy"><div class="look-shade"></div><div class="ls-glow"></div><div class="ls-glow b"></div><div class="ls-title"><small>Shop the look</small><h3>${l.n}</h3><p>${l.line}</p></div>${items.map((p, i) => `<a href="#/product/${p.id}" class="hot" style="--x:${22 + i * 22 + (i % 2) * 6}%;--y:${30 + (i % 3) * 20}%" data-hot="${p.id}"><i></i><span>${esc(p.name)}</span></a>`).join('')}</div><div class="look-items">${items.map(p => `<a class="li glow" href="#/product/${p.id}" data-hot-item="${p.id}"><span class="li-img">${media(p)}${p.img ? '' : fixtureArt(p.art || 'panel', l.hue)}</span><span><small>${esc(p.cls)}</small><b>${esc(p.name)}</b><em>${money(p.price)}</em></span>${ic('up', 15)}</a>`).join('')}</div></div>`; };
const TESTI = [['P.M.', 'Delhi · Homeowner', 'Noticed the drop in the electricity bill within two months of switching.'], ['R.S.', 'Mumbai · Facility manager', 'Consistent output across the whole floor, and replacements are easy to source.'], ['A.K.', 'Bengaluru · Interior designer', 'My clients can finally see what a colour temperature does before they commit.'], ['A.T.', 'Pune · Retail owner', 'Track lights and spotlights made the displays look completely different.'], ['N.V.', 'Hyderabad · Smart-home user', 'Scenes, schedules and voice control, and it all just works together.']];
const testimonials = () => TESTI.map((t, i) => `<figure class="tcard glow ${i === state.testi ? 'on' : ''}"><blockquote>“${t[2]}”</blockquote><figcaption><span class="av">${t[0]}</span><span><b>${t[0]}</b><small>${t[1]}</small></span></figcaption></figure>`).join('') + `<div class="tdots">${TESTI.map((_, i) => `<button class="${i === state.testi ? 'on' : ''}" data-a="testi" data-id="${i}" aria-label="Testimonial ${i + 1}"></button>`).join('')}</div>`;
const blogCard = (b, i = 0) => `<a href="${esc(b.href || STORE)}" target="_blank" rel="noopener" class="bcard glow rv" style="--d:${i * 70}ms"><div class="b-art ${b.img ? 'has-photo' : ''}">${b.img ? `<img src="${esc(b.img)}" alt="${esc(b.t)}" loading="lazy">` : flowArt(b.hue, BLOG.indexOf(b) + 21)}<span>${b.k}</span></div><div class="b-body"><small>${b.d}</small><h3>${esc(b.t)}</h3><span class="rm">Read on the official store ${ic('up', 14)}</span></div></a>`;
const newsForm = () => `<form class="nf" id="nf" novalidate><div class="nf-row"><input type="email" id="nf-mail" placeholder="Your email address" aria-label="Email address" required><button class="btn light" type="submit">Subscribe</button></div><label class="chk"><input type="checkbox" id="nf-ok"><span>I agree to receive promotional communications from Signify. I have read the <a href="#/policy/terms">Terms of Use</a> and <a href="#/policy/privacy">Privacy notice</a>.</span></label><small class="nf-msg" id="nf-msg" aria-live="polite"></small></form>`;

/* --- shop --- */
function filtered() {
  const q = state.q.toLowerCase();
  let r = PRODUCTS.filter(p => (state.cat === 'all' || p.cats.includes(state.cat)) && p.price <= state.maxPrice && (!state.smartOnly || p.cats.includes('smart')) && (!q || `${p.name} ${p.cls} ${p.features.join(' ')}`.toLowerCase().includes(q)));
  if (state.sort === 'low') r.sort((a, b) => a.price - b.price); if (state.sort === 'high') r.sort((a, b) => b.price - a.price); if (state.sort === 'off') r.sort((a, b) => pct(b) - pct(a));
  return r;
}
function shop() {
  const r = filtered(), cat = state.cat === 'all' ? null : catById(state.cat);
  const side = `<aside class="filters" id="filters"><div class="f-blk"><h4>Categories</h4><button class="fcat ${state.cat === 'all' ? 'on' : ''}" data-a="cat" data-id="all">${catIcon('orb', 20)}<span>All products</span><small>${PRODUCTS.length}</small></button>${CATEGORIES.map(c => `<button class="fcat ${state.cat === c.id ? 'on' : ''}" data-a="cat" data-id="${c.id}">${catIcon(c.ic, 20)}<span>${c.n}</span><small>${PRODUCTS.filter(p => p.cats.includes(c.id)).length || '·'}</small></button>`).join('')}</div>
    <div class="f-blk"><h4>Max price <output id="o-price">${money(state.maxPrice)}</output></h4><input type="range" id="f-price" min="500" max="40000" step="500" value="${state.maxPrice}"></div>
    <div class="f-blk"><label class="chk"><input type="checkbox" id="f-smart" ${state.smartOnly ? 'checked' : ''}><span>Smart lights only (Wi-Fi / WiZ)</span></label></div></aside>`;
  return `<main class="shop"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><nav class="crumb"><a href="#/">Home</a><span>/</span><a href="#/shop?cat=all">Products</a>${cat ? `<span>/</span><b>${cat.n}</b>` : ''}</nav><h1>${cat ? cat.n : 'All'} <em>${cat ? '' : 'lights.'}</em></h1><p>${cat ? `Philips ${cat.n.toLowerCase()} from Signify.` : 'Real Philips India listings, snapshot of 5 November 2026. Prices and availability must be verified on the official store.'}</p></div></section>
  <section class="wrap shop-body">${side}<div class="shop-main"><div class="shop-bar"><span id="count"><b>${r.length}</b> ${r.length === 1 ? 'product' : 'products'}</span><div class="sb-r"><label class="sbox">${ic('search', 16)}<input id="f-q" value="${esc(state.q)}" placeholder="Find a light…" aria-label="Search this collection"></label><select id="f-sort" aria-label="Sort"><option value="featured">Featured</option><option value="low" ${state.sort === 'low' ? 'selected' : ''}>Price: low to high</option><option value="high" ${state.sort === 'high' ? 'selected' : ''}>Price: high to low</option><option value="off" ${state.sort === 'off' ? 'selected' : ''}>Biggest saving</option></select><button class="ib vw ${state.view === 'grid' ? 'on' : ''}" data-a="view" data-id="grid" aria-label="Grid">${ic('grid', 17)}</button><button class="ib vw ${state.view === 'list' ? 'on' : ''}" data-a="view" data-id="list" aria-label="List">${ic('list', 17)}</button></div></div>
  <div id="grid" class="pgrid ${state.view}">${gridInner(r, cat)}</div></div></section></main>`;
}
const gridInner = (r, cat) => r.length ? r.map((p, i) => productCard(p, i)).join('') : `<div class="empty"><div>${catIcon(cat?.ic || 'bulb', 70)}</div><h3>${cat ? `${cat.n}: the live catalogue plugs in here` : 'No lights matched'}</h3><p>${cat ? 'This concept ships with a snapshot of 16 real SKUs. In production every product in this category loads from the Shopify catalogue feed.' : 'Try a different term, category or price.'}</p><a class="btn dark" href="${STORE}" target="_blank" rel="noopener">See this on the official store ${ic('up', 15)}</a></div>`;

/* --- product --- */
function product(id) {
  const p = byId(id); if (!p) return notFound();
  const rel = PRODUCTS.filter(x => x.id !== p.id && x.cats.some(c => p.cats.includes(c))).slice(0, 4);
  const variants = p.variants ? `<div class="pv"><h4>Available options <small>snapshot · 6 Nov 2026</small></h4><table><thead><tr><th>Wattage</th><th>Colour</th><th>Price</th><th></th></tr></thead><tbody>${p.variants.map(v => `<tr class="${v.ok ? '' : 'sold'}"><td>${v.w} W</td><td>${v.c}</td><td>${v.p ? money(v.p) : '—'}</td><td>${v.ok ? '<span class="tg st">In stock</span>' : '<span class="tg sold">Sold out</span>'}</td></tr>`).join('')}</tbody></table></div>` : '';
  return `<main class="pdp"><div class="wrap"><nav class="crumb"><a href="#/">Home</a><span>/</span><a href="#/shop?cat=all">Products</a><span>/</span><a href="#/shop?cat=${p.cats[0]}">${catById(p.cats[0]).n}</a><span>/</span><b>${esc(p.name)}</b></nav>
  <div class="pdp-grid"><div class="gal"><div class="gal-main glow"><span class="aura"></span>${media(p)}${p.img ? '' : fixtureArt(p.art || 'panel', 40)}${p.scene ? `<img class="scn" src="${esc(p.scene)}" alt="" onerror="this.remove()">` : ''}<span class="ptags">${p.isNew ? '<b class="tg new">New</b>' : ''}${pct(p) ? `<b class="tg off">${pct(p)}% off</b>` : ''}</span></div></div>
  <div class="pdp-info"><span class="eyebrow">Philips · ${esc(catById(p.cats[0]).n)}</span><h1>${esc(p.name)}</h1><p class="tagl">${esc(p.tag || '')}</p>
    <div class="pp"><b>${money(p.price)}</b>${p.old ? `<del>${money(p.old)}</del><span class="tg off">${pct(p)}% off</span>` : ''}<small>Inclusive of all taxes · price snapshot, verify on the official store</small></div>
    <ul class="pf">${p.features.map(f => `<li>${ic('check', 16)} ${esc(f)}</li>`).join('')}</ul>${variants}
    <div class="pdp-act"><button class="btn dark lg" data-a="add" data-id="${p.id}">Add to bag ${ic('plus', 16)}</button><button class="btn out lg ${state.saved.includes(p.id) ? 'on' : ''}" data-a="save" data-id="${p.id}">${ic('heart', 16)} ${state.saved.includes(p.id) ? 'Saved' : 'Save'}</button></div>
    ${p.studio ? `<a class="studio-cta glow" href="#/studio?p=${p.id}"><span>${ic('spark', 22)}</span><span><b>Test this light in the Studio</b><small>Real lux, colour temperature and uniformity in a modelled room</small></span>${ic('arrow', 18)}</a>` : ''}
    <div class="dlv"><div><h4>${ic('pin', 16)} Delivery</h4>${state.pin ? `<p>Delivering to <b>${esc(state.pin)}</b>. Dispatch within 48 hours, delivery in 5–7 business days. Free shipping.</p>` : `<form id="pin-form" class="pinf"><input inputmode="numeric" maxlength="6" placeholder="Enter 6-digit pincode" aria-label="Pincode"><button class="btn out">Check</button></form><small class="nf-msg" id="pin-msg"></small>`}</div><div><h4>${ic('ret', 16)} Returns</h4><p>7-day return / refund window for eligible products. Report missing or damaged items within 24–48 hours of delivery.</p></div><div><h4>${ic('shield', 16)} Warranty</h4><p>Extended warranty with Signify DigiShield. Terms are shown on the official listing.</p></div></div>
    <p class="mfr">Manufactured or imported by <b>Signify Innovations India Ltd.</b> · Minimum order value ₹${MOV.toLocaleString('en-IN')} · <a href="${esc(p.url)}" target="_blank" rel="noopener">Verify product, variant and availability on the official store ${ic('up', 13)}</a></p>
    <p class="caution">${ic('spark', 15)} ${esc(p.note)}</p></div></div></div>
  <section class="spec"><div class="wrap two"><div><span class="eyebrow">Technical details</span><h2>Built on <em>facts.</em></h2><p>From the public Philips India listing, not a live feed. Anything the listing does not state is left unstated.</p></div><div class="spec-t">${p.details.map(([a, b]) => `<div><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('')}</div></div></section>
  ${rel.length ? `<section class="wrap related">${head('Complete the room', 'You may also', 'like')}<div class="grid4">${rel.map(productCard).join('')}</div></section>` : ''}</main>`;
}

function rooms(room) {
  const names = Object.keys(ROOMS), cur = ROOMS[room] ? room : 'Living room', r = ROOMS[cur];
  const items = PRODUCTS.filter(p => p.rooms.includes(cur));
  return `<main class="rooms"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><span class="eyebrow">Shop by space</span><h1>Your space. <em>Your light.</em></h1><p>Find fixtures by where they live, then test them in the Studio with real room dimensions and targets.</p></div></section>
  <section class="wrap"><div class="rtabs">${names.map(n => `<a href="#/rooms?room=${encodeURIComponent(n)}" class="${n === cur ? 'on' : ''}">${n}</a>`).join('')}</div>
  <div class="rfeat glow"><div class="rf-copy"><span class="eyebrow">${cur.toUpperCase()}</span><h2>${r.tag}.</h2><p>${r.blurb}</p><dl><div><dt>Room</dt><dd>${r.W} × ${r.D} × ${r.H} m</dd></div><div><dt>Floor area</dt><dd>${(r.W * r.D).toFixed(1)} m²</dd></div><div><dt>Typical target</dt><dd>${r.acts[1][1]} lx general</dd></div></dl><a class="btn dark" href="#/studio?room=${encodeURIComponent(cur)}">Experience this space ${ic('arrow', 16)}</a></div><div class="rf-art"><img src="${esc(r.img)}" alt="${esc(cur)} lighting inspiration" loading="eager"></div></div>
  ${head('Selected for ' + cur.toLowerCase(), 'Find your', 'fixture')}<div class="grid4">${items.map(productCard).join('')}</div></section></main>`;
}
const inspiration = () => `<main class="insp"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><span class="eyebrow">Inspiration</span><h1>Ideas worth <em>switching on.</em></h1><p>Guides from the official store, redesigned for reading.</p></div></section><section class="wrap"><div class="blog-grid big">${BLOG.map(blogCard).join('')}</div></section></main>`;

function indiaMap() {
  const sx = x => (x - 67) / 32 * 560 + 20, sy = y => (38 - y) / 31 * 600 + 10; const poly = INDIA.map(([x, y]) => [sx(x), sy(y)]);
  const inside = (px, py) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; };
  let dots = ''; for (let x = 20; x < 590; x += 11) for (let y = 10; y < 620; y += 11) if (inside(x, y)) dots += `<circle cx="${x}" cy="${y}" r="2.1"/>`;
  const cities = HUB_CITIES.map((c, i) => `<g class="city" style="--i:${i}" transform="translate(${sx(c.x)} ${sy(c.y)})"><circle class="pr" r="8"/><circle class="pd" r="4.2"/><text x="10" y="4">${c.n}</text></g>`).join('');
  return `<svg viewBox="0 0 600 640" class="imap" role="img" aria-label="Illustrative map of Smart Light Hub cities"><g class="dots">${dots}</g>${cities}</svg>`;
}
const stores = () => `<main class="stores"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><span class="eyebrow">Philips Smart Light Hubs</span><h1>Touch it. <em>Then take it home.</em></h1><p>345 Philips Smart Light Hubs across India (as announced by Signify in May 2026), with the same range you see here.</p></div></section>
<section class="wrap two stores-body"><div class="map-card glow">${indiaMap()}<small class="ill">Illustrative city markers. Use the official locator for exact addresses.</small></div><div class="st-side"><form class="pinf lg" id="locate"><input inputmode="numeric" maxlength="6" placeholder="Your pincode or city" aria-label="Pincode or city"><button class="btn dark">Find hubs</button></form><small class="nf-msg" id="loc-msg" aria-live="polite"></small>
<div class="regions">${CONTACT.offices.map(o => `<div class="rg glow"><b>${o.k}</b><p>${o.a}</p>${o.t ? `<small>${o.t}</small>` : ''}</div>`).join('')}</div><a class="btn light" href="https://www.lighting.philips.co.in/consumer/where-to-buy" target="_blank" rel="noopener">Open the official store locator ${ic('up', 15)}</a></div></section></main>`;

function contact(tab = 'support') {
  const tabs = [['support', 'Customer support'], ['sales', 'Contact sales'], ['partner', 'Become a partner'], ['distributor', 'Become a distributor']];
  const forms = { support: '', sales: 'Tell us about your project and we’ll connect you with Signify sales.', partner: 'Join the Philips partner network.', distributor: 'Distribution enquiries for your region.' };
  return `<main class="contact"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><span class="eyebrow">Contact us</span><h1>We’re <em>here to help.</em></h1><p>${CONTACT.company}</p></div></section>
  <section class="wrap two cbody"><div><div class="ctabs">${tabs.map(([k, t]) => `<button class="${k === tab ? 'on' : ''}" data-a="ctab" data-id="${k}">${t}</button>`).join('')}</div>${tab === 'support' ? `<div class="cc glow"><h3>Customer support</h3><a href="tel:${CONTACT.phone.replace(/\s/g, '')}" class="cl">${ic('phone', 20)}<span><b>${CONTACT.phone}</b><small>International toll-free · ${CONTACT.hours}</small></span></a><a href="mailto:${CONTACT.email}" class="cl">${ic('mail', 20)}<span><b>${CONTACT.email}</b><small>We reply within one business day</small></span></a></div>` : ''}
  <form class="cform glow" id="cform" novalidate><h3>${tabs.find(t => t[0] === tab)[1]}</h3><p>${forms[tab]}</p><div class="fr"><label>Name<input required autocomplete="name"></label><label>Phone<input inputmode="tel" autocomplete="tel"></label></div><label>Email<input type="email" required autocomplete="email"></label><label>Pincode<input inputmode="numeric" maxlength="6"></label><label>${tab === 'support' ? 'Order number (optional)' : 'Company'}<input></label><label>Message<textarea rows="4"></textarea></label><button class="btn dark lg" type="submit">Send message</button><small class="nf-msg" id="cf-msg" aria-live="polite"></small></form></div>
  <div><div class="cc glow"><h3>Grievance Redressal</h3><p><b>${CONTACT.grievance.name}</b><br>${CONTACT.grievance.role}<br><a href="mailto:${CONTACT.grievance.email}">${CONTACT.grievance.email}</a></p></div><div class="cc glow"><h3>Offices</h3>${CONTACT.offices.map(o => `<div class="of"><b>${o.k}</b><p>${o.a}</p>${o.t ? `<small>${o.t}</small>` : ''}</div>`).join('')}</div><div class="cc glow"><h3>Follow us</h3><div class="soc dark">${CONTACT.social.map(s => s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener" aria-label="${s.n}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${socialIcon(s.n)}</svg></a>` : '').join('')}</div></div></div></section></main>`;
}
const POL = { 'site-owner': ['Site owner', `This store is operated by ${CONTACT.company}. Registered office: ${CONTACT.offices[0].a}.`], privacy: ['Privacy policy', 'Describes how Signify handles personal data collected through the store and newsletter. The full text migrates verbatim from the official policy.'], cookies: ['Cookies notice', 'Describes the cookies used by the store. In production this page also hosts the cookie-consent preference centre.'], terms: ['Terms of sale', 'Minimum order value ₹1,500. Free shipping. Orders are usually dispatched within 48 hours, with delivery in 5–7 business days.'], returns: ['Cancel / return policy', '7-day return or refund window for eligible products, subject to terms. Missing or damaged items must be reported within 24–48 hours of delivery.'], shipping: ['Shipping policy', 'Free shipping. Dispatch usually within 48 hours of ordering; delivery in 5–7 business days. Minimum order value ₹1,500.'] };
const policy = k => { const p = POL[k] || POL.terms; return `<main class="policy"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><span class="eyebrow">Policies</span><h1>${p[0]}</h1></div></section><section class="wrap narrow"><p class="lead">${p[1]}</p><p class="ill">Summary of what the public store states. The legally binding text is on the official store: <a href="${STORE}" target="_blank" rel="noopener">in.shop.lighting.philips.com</a>.</p><div class="pol-nav">${Object.entries(POL).map(([k2, v]) => `<a href="#/policy/${k2}" class="${k2 === k ? 'on' : ''}">${v[0]}</a>`).join('')}</div></section></main>`; };
const saved = () => `<main class="shop"><section class="page-hero"><div class="ph-glow"></div><div class="wrap"><span class="eyebrow">Your shortlist</span><h1>Worth a second <em>look.</em></h1><p>Saved in this browser only.</p></div></section><section class="wrap"><div class="pgrid grid">${state.saved.length ? state.saved.map(byId).filter(Boolean).map(productCard).join('') : '<div class="empty"><h3>Nothing saved yet</h3><a class="btn dark" href="#/shop?cat=all">Browse products</a></div>'}</div></section></main>`;
const notFound = () => `<main class="policy"><section class="page-hero"><div class="wrap"><h1>Nothing at <em>this address.</em></h1><a class="btn light" href="#/">Back home</a></div></section></main>`;

/* ------------------------------ overlays ------------------------------ */
function portal() {
  let h = '';
  if (state.drawer) { const e = Object.entries(state.cart).filter(([id, q]) => byId(id) && q > 0), tot = cartTotal(), need = Math.max(0, MOV - tot);
    h += `<div class="scrim" data-a="cart"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Bag"><div class="dh"><div><span class="eyebrow">Your bag · demonstration</span><h2>Shopping bag <small>(${cartCount()})</small></h2></div><button class="ib" data-a="cart" aria-label="Close">${ic('close', 22)}</button></div>
    <div class="mov"><div class="mov-t">${need ? `Add <b>${money(need)}</b> to reach the ₹1,500 minimum order` : `<b>Minimum order reached.</b> Free doorstep delivery`}</div><div class="mov-b"><i style="width:${Math.min(100, tot / MOV * 100)}%"></i></div></div>
    <div class="dl">${e.length ? e.map(([id, q]) => { const p = byId(id); return `<div class="dli"><div class="dli-i">${media(p)}${p.img ? '' : fixtureArt(p.art || 'panel', 40)}</div><div><h3>${esc(p.name)}</h3><span>${money(p.price)}</span><div class="qty"><button data-a="dec" data-id="${id}" aria-label="Less">${ic('minus', 14)}</button><b>${q}</b><button data-a="inc" data-id="${id}" aria-label="More">${ic('plus', 14)}</button></div></div><button class="rm" data-a="rem" data-id="${id}">Remove</button></div>`; }).join('') : `<div class="dempty">${catIcon('bulb', 56)}<h3>Your bag is empty</h3><p>Build a shortlist of lights to explore.</p><a class="btn dark" href="#/shop?cat=all" data-a="cart">Browse products</a></div>`}</div>
    <div class="df"><div class="sub"><span>Reference subtotal</span><b>${money(tot)}</b></div><p>No purchase, payment or personal details are processed here. For current prices and orders use the official store.</p><a class="btn dark lg" href="${STORE}" target="_blank" rel="noopener">Continue on the official store ${ic('up', 15)}</a></div></aside>`; }
  if (state.modal === 'account') h += `<div class="scrim" data-a="close"></div><div class="modal acct" role="dialog" aria-modal="true" aria-label="Account"><button class="ib x" data-a="close" aria-label="Close">${ic('close', 20)}</button><div class="tabs2"><button class="on" data-a="atab" data-id="in">Sign in</button><button data-a="atab" data-id="up">Create account</button></div><form id="aform" novalidate><label>Email<input type="email" required autocomplete="email"></label><label class="pw">Password<input type="password" required autocomplete="current-password"></label><label class="up" hidden>Full name<input autocomplete="name"></label><label class="up" hidden>Mobile number<input inputmode="tel" autocomplete="tel"></label><button class="btn dark lg">Continue</button><a href="#" data-a="forgot" class="fgt">Forgot password?</a><small class="nf-msg" id="a-msg" aria-live="polite"></small></form><p class="ill">Concept UI. No credentials are collected or stored.</p></div>`;
  if (state.modal === 'pin') h += `<div class="scrim" data-a="close"></div><div class="modal" role="dialog" aria-modal="true" aria-label="Delivery location"><button class="ib x" data-a="close" aria-label="Close">${ic('close', 20)}</button><span class="eyebrow">Delivery</span><h2>Let’s light up <em>your coordinates.</em></h2><form id="pin-modal" class="pinf lg"><input inputmode="numeric" maxlength="6" placeholder="6-digit pincode" aria-label="Pincode" value="${esc(state.pin)}" autofocus><button class="btn dark">Apply</button></form><small class="nf-msg" id="pm-msg" aria-live="polite"></small></div>`;
  if (state.modal?.startsWith?.('quick:')) { const p = byId(state.modal.slice(6)); h += `<div class="scrim" data-a="close"></div><div class="modal quick" role="dialog" aria-modal="true" aria-label="${esc(p.name)}"><button class="ib x" data-a="close" aria-label="Close">${ic('close', 20)}</button><div class="q-i">${media(p)}${p.img ? '' : fixtureArt(p.art || 'panel', 40)}</div><div class="q-b"><span class="eyebrow">Philips · ${esc(catById(p.cats[0]).n)}</span><h2>${esc(p.name)}</h2><p class="tagl">${esc(p.tag || '')}</p><ul class="pf">${p.features.slice(0, 3).map(f => `<li>${ic('check', 15)} ${esc(f)}</li>`).join('')}</ul><b class="qp">${money(p.price)}</b><div class="pdp-act"><button class="btn dark" data-a="add" data-id="${p.id}">Add to bag</button><a class="btn out" href="#/product/${p.id}" data-a="close">Details</a></div></div></div>`; }
  if (state.search) h += `<div class="scrim dim" data-a="search"></div><div class="searchov" role="dialog" aria-modal="true" aria-label="Search"><div class="sr-in">${ic('search', 22)}<input id="sq" placeholder="What are you looking for?" aria-label="Search" autofocus autocomplete="off"><button class="ib" data-a="search" aria-label="Close">${ic('close', 20)}</button></div><div id="sres" class="sres">${searchResults('')}</div></div>`;
  $('#portal').innerHTML = h; document.body.classList.toggle('locked', !!(state.drawer || state.modal || state.search));
  if (state.search) $('#sq')?.focus(); if (state.modal === 'pin') $('#pin-modal input')?.focus();
}
function searchResults(q) {
  q = q.trim().toLowerCase(); const ps = PRODUCTS.filter(p => !q || `${p.name} ${p.cls} ${p.cats.join(' ')}`.toLowerCase().includes(q)).slice(0, 6), cs = CATEGORIES.filter(c => !q || c.n.toLowerCase().includes(q)).slice(0, 8), bs = q ? BLOG.filter(b => b.t.toLowerCase().includes(q)).slice(0, 2) : [];
  return `<div class="sr-sec"><h4>Categories</h4><div class="sr-cats">${cs.map(c => `<a href="#/shop?cat=${c.id}" data-a="search">${catIcon(c.ic, 18)} ${c.n}</a>`).join('')}</div></div><div class="sr-sec"><h4>Products</h4>${ps.length ? ps.map(p => `<a class="sr-p" href="#/product/${p.id}" data-a="search"><span>${media(p)}${p.img ? '' : fixtureArt(p.art || 'panel', 40)}</span><b>${esc(p.name)}</b><em>${money(p.price)}</em></a>`).join('') : '<p class="ill">No matching products.</p>'}</div>${bs.length ? `<div class="sr-sec"><h4>Inspiration</h4>${bs.map(b => `<a class="sr-b" href="#/inspiration" data-a="search">${esc(b.t)}</a>`).join('')}</div>` : ''}`;
}
function toast(t) { let n = $('.toast'); if (!n) { n = document.createElement('div'); n.className = 'toast'; n.setAttribute('role', 'status'); document.body.appendChild(n); } n.textContent = t; n.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => n.classList.remove('on'), 2300); }

/* ------------------------------ router ------------------------------ */
function parse() { const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?'); return { path: path || '', parts: (path || '').split('/'), q: new URLSearchParams(qs || '') }; }
function render(first) {
  const r = parse(), root = parse().parts[0]; cleanup.forEach(f => f()); cleanup = [];
  state.mega = false; state.menu = false;
  let page = root || 'home', body = '';
  if (root === '' || root === 'home') { page = 'home'; body = home(); }
  else if (root === 'shop') { state.cat = r.q.get('cat') && (r.q.get('cat') === 'all' || catById(r.q.get('cat'))) ? r.q.get('cat') : 'all'; body = shop(); }
  else if (root === 'product') { page = 'product'; body = product(r.parts[1]); }
  else if (root === 'studio') { body = `<main class="studio-page"><section class="st-hero"><div class="wrap"><span class="eyebrow"><i class="pulse"></i> Interactive · photometrically modelled</span><h1>The <em>Light</em> Studio<span class="dot">.</span></h1><p>Real Philips fixtures in a room with real dimensions. Change what the product can actually change, and read what the light really does.</p></div></section><div class="wrap" id="studio-root"></div></main>`; }
  else if (root === 'rooms') body = rooms(r.q.get('room') || 'Living room');
  else if (root === 'inspiration') body = inspiration();
  else if (root === 'stores') body = stores();
  else if (root === 'contact') body = contact(r.q.get('tab') || 'support');
  else if (root === 'policy') body = policy(r.parts[1]);
  else if (root === 'saved') body = saved();
  else { page = 'x'; body = notFound(); }
  const dark = ['home', 'studio'].includes(page);
  $('#app').innerHTML = `<div class="site ${dark ? 'is-dark' : ''}" data-page="${page}">${header(page)}${body}${footer()}</div>`;
  portal(); window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(afterRender); document.title = ({ home: 'Light changes everything · Philips Lighting India (concept)', shop: 'Products · Philips Lighting India (concept)', studio: 'Light Studio · Philips Lighting India (concept)' })[page] || 'Philips Lighting India · independent concept';
  if (page === 'home') { const gl = mountHero($('#hero-gl')); cleanup.push(gl.dispose); }
  if (page === 'studio') { const s = mountStudio($('#studio-root'), { pid: r.q.get('p'), room: r.q.get('room'), onAdd: (id, n) => { state.cart[id] = (state.cart[id] || 0) + n; persist(); updateCount(); toast(`${n} × ${byId(id).name} added to the demo bag`); } }); cleanup.push(s.dispose); }
}
function afterRender() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.matches('.stats')) countUp(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv,.stats').forEach(n => io.observe(n)); cleanup.push(() => io.disconnect());
  const onScroll = () => $('#head')?.classList.toggle('stuck', scrollY > 40); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); cleanup.push(() => window.removeEventListener('scroll', onScroll));
  if (parse().parts[0] === 'home' || parse().parts[0] === '') { const t = setInterval(() => { state.testi = (state.testi + 1) % TESTI.length; const el = $('#tslider'); if (el) el.innerHTML = testimonials(); }, 6500); cleanup.push(() => clearInterval(t)); }
}
function countUp(root) { $$('[data-count]', root).forEach(el => { const to = +el.dataset.count, t0 = performance.now(); const f = n => { const k = Math.min(1, (n - t0) / 1400), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e).toLocaleString('en-IN'); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }); }
const updateCount = () => { const c = $('#cnt'); if (c) c.textContent = cartCount(); };
function updateShop() { if (!$('#grid')) return; const r = filtered(), cat = state.cat === 'all' ? null : catById(state.cat); $('#grid').innerHTML = gridInner(r, cat); $('#grid').className = 'pgrid ' + state.view; $('#count').innerHTML = `<b>${r.length}</b> ${r.length === 1 ? 'product' : 'products'}`; $$('.fcat').forEach(b => b.classList.toggle('on', b.dataset.id === state.cat)); requestAnimationFrame(() => $$('#grid .rv').forEach(n => n.classList.add('in'))); }

/* ------------------------------ events ------------------------------ */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) { if (state.mega && !e.target.closest('#mega')) { state.mega = false; $('#mega')?.classList.remove('open'); } return; }
  const k = a.dataset.a, id = a.dataset.id;
  if (a.matches('a[href="#"]')) e.preventDefault();
  if (k === 'mega') { state.mega = !state.mega; $('#mega')?.classList.toggle('open', state.mega); a.setAttribute('aria-expanded', state.mega); e.stopPropagation(); return; }
  if (k === 'menu') { state.menu = !state.menu; $('.mnav')?.classList.toggle('open', state.menu); return; }
  if (k === 'search') { state.search = !state.search; portal(); return; }
  if (k === 'cart') { state.drawer = !state.drawer; portal(); return; }
  if (k === 'close') { state.modal = null; portal(); return; }
  if (k === 'account') { state.modal = 'account'; portal(); return; }
  if (k === 'pin') { state.modal = 'pin'; portal(); return; }
  if (k === 'saved') { location.hash = '#/saved'; return; }
  if (k === 'quick') { state.modal = 'quick:' + id; portal(); return; }
  if (k === 'add') { state.cart[id] = (state.cart[id] || 0) + 1; persist(); state.modal = null; state.drawer = true; portal(); updateCount(); return; }
  if (k === 'inc' || k === 'dec' || k === 'rem') { if (k === 'rem') delete state.cart[id]; else state.cart[id] = Math.max(0, (state.cart[id] || 0) + (k === 'inc' ? 1 : -1)); if (!state.cart[id]) delete state.cart[id]; persist(); portal(); updateCount(); return; }
  if (k === 'save') { state.saved = state.saved.includes(id) ? state.saved.filter(x => x !== id) : [...state.saved, id]; persist(); $$(`[data-a="save"][data-id="${id}"]`).forEach(b => { b.classList.toggle('on', state.saved.includes(id)); if (b.classList.contains('btn')) b.innerHTML = `${ic('heart', 16)} ${state.saved.includes(id) ? 'Saved' : 'Save'}`; }); toast(state.saved.includes(id) ? 'Saved to your shortlist' : 'Removed from shortlist'); return; }
  if (k === 'cat') { state.cat = id; history.replaceState(null, '', '#/shop?cat=' + id); updateShop(); return; }
  if (k === 'view') { state.view = id; $$('.vw').forEach(b => b.classList.toggle('on', b.dataset.id === id)); updateShop(); return; }
  if (k === 'look') { state.look = +id; $$('.look-tabs button').forEach((b, i) => b.classList.toggle('active', i === state.look)); $('#look-body').innerHTML = lookBody(); return; }
  if (k === 'testi') { state.testi = +id; $('#tslider').innerHTML = testimonials(); return; }
  if (k === 'ctab') { location.hash = '#/contact?tab=' + id; return; }
  if (k === 'atab') { const up = id === 'up'; $$('.tabs2 button').forEach(b => b.classList.toggle('on', b.dataset.id === id)); $$('#aform .up').forEach(x => x.hidden = !up); $('#aform .pw').hidden = false; $('#aform button.btn').textContent = up ? 'Create account' : 'Continue'; return; }
  if (k === 'forgot') { $('#a-msg').textContent = 'Concept UI: a reset link would be emailed here.'; return; }
});
document.addEventListener('submit', e => {
  const f = e.target, say = (id, t, ok = true) => { const m = $('#' + id); if (m) { m.textContent = t; m.dataset.ok = ok; } }; e.preventDefault();
  if (f.id === 'nf') { const m = $('#nf-mail').value.trim(), ok = $('#nf-ok').checked; if (!/^\S+@\S+\.\S+$/.test(m)) return say('nf-msg', 'Please enter a valid email address.', false); if (!ok) return say('nf-msg', 'Please tick the consent box to subscribe.', false); say('nf-msg', 'Thanks. Concept demo: nothing was sent or stored.'); f.reset(); }
  else if (f.id === 'pin-form' || f.id === 'pin-modal') { const v = f.querySelector('input').value.trim(); if (!/^[1-9]\d{5}$/.test(v)) return say(f.id === 'pin-form' ? 'pin-msg' : 'pm-msg', 'Enter a valid 6-digit Indian pincode.', false); state.pin = v; persist(); toast(`Delivering to ${v}. Free, 5–7 business days.`); state.modal = null; render(); }
  else if (f.id === 'locate') { const v = f.querySelector('input').value.trim(); say('loc-msg', v ? 'Concept demo: results come from the official Smart Light Hub locator in production.' : 'Enter a pincode or city.', !!v); }
  else if (f.id === 'cform') { if (!f.checkValidity()) return say('cf-msg', 'Please fill the required fields.', false); say('cf-msg', 'Thank you. Concept demo: the message was not sent.'); f.reset(); }
  else if (f.id === 'aform') { say('a-msg', 'Concept UI: no account is created and no credentials are stored.'); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'f-q') { state.q = t.value; updateShop(); } else if (t.id === 'f-price') { state.maxPrice = +t.value; $('#o-price').textContent = money(state.maxPrice); updateShop(); }
  else if (t.id === 'f-smart') { state.smartOnly = t.checked; updateShop(); } else if (t.id === 'sq') { $('#sres').innerHTML = searchResults(t.value); }
});
document.addEventListener('change', e => { if (e.target.id === 'f-sort') { state.sort = e.target.value; updateShop(); } if (e.target.id === 'f-smart') { state.smartOnly = e.target.checked; updateShop(); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { state.drawer = false; state.modal = null; state.search = false; state.mega = false; $('#mega')?.classList.remove('open'); portal(); }
  if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); state.search = true; portal(); }
});
/* light follows the cursor on glowing cards + 3D tilt */
document.addEventListener('pointermove', e => {
  const c = e.target.closest?.('.glow'); if (!c) return; const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
  if (c.classList.contains('tilt') && !matchMedia('(prefers-reduced-motion: reduce)').matches) { c.style.setProperty('--rx', ((y / r.height - .5) * -6).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x / r.width - .5) * 8).toFixed(2) + 'deg'); }
}, { passive: true });
document.addEventListener('pointerout', e => { const c = e.target.closest?.('.tilt'); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });
document.addEventListener('mouseover', e => { const h = e.target.closest?.('[data-hot],[data-hot-item]'); if (!h) return; const id = h.dataset.hot || h.dataset.hotItem; $$('[data-hot],[data-hot-item]').forEach(x => x.classList.toggle('hl', (x.dataset.hot || x.dataset.hotItem) === id)); });

/* page-turn wave wipe */
let wiping = false;
window.addEventListener('hashchange', () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { render(); return; }
  if (wiping) { render(); return; } wiping = true; const w = $('#wipe'); w.classList.add('go'); setTimeout(() => { render(); setTimeout(() => { w.classList.remove('go'); wiping = false; }, 60); }, 380);
});
if (!location.hash) history.replaceState(null, '', '#/'); render(true);
window.__app = { state, render };
