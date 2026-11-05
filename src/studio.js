import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import * as P from './photometry.js';
import { byId, STUDIO_IDS, ROOMS, FINISHES, money, esc } from './data.js';

const PRESETS = {
  Relax: { mode: 'white', cct: 2700, dim: 45 }, Evening: { mode: 'white', cct: 3000, dim: 35 }, Focus: { mode: 'white', cct: 6000, dim: 100 },
  Sunset: { mode: 'color', color: '#ff9e59', dim: 55 }, Ocean: { mode: 'color', color: '#54c3ff', dim: 68 }, Cinema: { mode: 'color', color: '#aa80ff', dim: 40 }
};
const SWATCH = ['#aa80ff', '#54c3ff', '#f17db9', '#ff9e59', '#5ee4bd', '#ffc88a'];
const BASE_EV_SCALE = Math.PI / 200; /* a perfect white diffuser at 200 lx renders as display white (before ACES) */
const imgTag = p => (p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '');

export function mountStudio(root, ctx) {
  const S = { room: ctx.room && ROOMS[ctx.room] ? ctx.room : 'Living room', pid: ctx.pid && byId(ctx.pid)?.studio ? ctx.pid : 'rune', count: 1, dim: 80, cct: 3000, mode: 'white', color: '#ffb35c', preset: 'Relax',
    finish: 'Medium', act: 1, mf: 0.8, lightsOn: true, overlay: false, meter: true, ev: 0, planeH: 0.75, view: 'persp', vw: 12, vc: 'Natural white', fluxOverride: null, hours: 5, tariff: 8, ies: null, adv: false };
  const room = () => ROOMS[S.room];
  const prod = () => byId(S.pid);
  const st = () => prod().studio;
  S.planeH = S.room === 'Kitchen' ? 0.9 : 0.75;
  if (prod().studio.cct) S.cct = prod().studio.cct.def;

  /* ---------- three setup ---------- */
  let renderer, composer, bloom, scene, cam, controls, raf = 0, alive = true, canvasOK = true;
  const stageEl = () => root.querySelector('#st-stage');
  RectAreaLightUniformsLib.init();
  const group = { room: null, lights: null, overlay: null };
  const reg = []; /* light registry: {obj, kind, nits|cd, tint:[r,g,b], mat?} */
  let sol = null, lumsCache = [];
  const meterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.75);
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let meterEl;

  function initGL() {
    const host = stageEl();
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    } catch (e) { canvasOK = false; host.classList.add('no-webgl'); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    host.prepend(renderer.domElement); renderer.domElement.className = 'st-canvas';
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070a);
    cam = new THREE.PerspectiveCamera(52, 1, .05, 60);
    controls = new OrbitControls(cam, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .08; controls.maxPolarAngle = Math.PI * .56; controls.minDistance = 1.2; controls.maxDistance = 14;
    composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cam));
    bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .38, .55, 1.0); composer.addPass(bloom); composer.addPass(new OutputPass());
    const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); composer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(host); resize();
    renderer.domElement.addEventListener('pointermove', onPointer); renderer.domElement.addEventListener('pointerleave', () => { if (meterEl) meterEl.style.opacity = 0; });
    setView(S.view, true);
    const loop = () => { raf = requestAnimationFrame(loop); if (!alive || document.hidden) return; controls.update(); composer.render(); };
    loop();
  }

  /* ---------- room ---------- */
  const lin = (r, g = r, b = r) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);
  function plankTexture() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) { const v = 232 + Math.floor(Math.random() * 23); g.fillStyle = `rgb(${v},${v - 3},${v - 8})`; g.fillRect(0, i * 64, 512, 62); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, i * 64 + 62, 512, 2); for (let k = 0; k < 3; k++) g.fillRect(Math.random() * 512, i * 64, 2, 62); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  const blobTex = (() => { let t; return () => t || (t = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 4, 32, 32, 32); r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })()); })();

  function buildRoom() {
    if (group.room) { scene.remove(group.room); group.room.traverse(o => { o.geometry?.dispose?.(); }); }
    const { W, D, H } = room(); const f = FINISHES[S.finish]; const g = new THREE.Group(); group.room = g;
    const mat = (r, extra = {}) => new THREE.MeshStandardMaterial({ color: lin(r), roughness: .92, metalness: 0, ...extra });
    const plane = (w, h, m, pos, rot) => { const x = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); x.position.set(...pos); x.rotation.set(...rot); g.add(x); return x; };
    const tex = plankTexture(); tex.repeat.set(W / 1.6, D / 1.6);
    plane(W, D, new THREE.MeshStandardMaterial({ color: lin(f.floor * 1.0), map: tex, roughness: .75 }), [W / 2, 0, D / 2], [-Math.PI / 2, 0, 0]);
    plane(W, D, mat(f.ceil), [W / 2, H, D / 2], [Math.PI / 2, 0, 0]);
    plane(W, H, mat(f.wall), [W / 2, H / 2, 0], [0, 0, 0]);
    plane(D, H, mat(f.wall), [0, H / 2, D / 2], [0, Math.PI / 2, 0]);
    plane(D, H, mat(f.wall), [W, H / 2, D / 2], [0, -Math.PI / 2, 0]);
    const box = (w, h, d, x, y, z, col, rough = .8) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: col, roughness: rough })); m.position.set(x, y + h / 2, z); g.add(m); return m; };
    const blob = (w, d, x, z, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, d * 1.5), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: o, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, .004, z); g.add(m); };
    const cyl = (r, h, x, y, z, col) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), new THREE.MeshStandardMaterial({ color: col, roughness: .7 })); m.position.set(x, y + h / 2, z); g.add(m); return m; };
    const plant = (x, z) => { cyl(.17, .35, x, 0, z, 0x6b5a4a); const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.34, 1), new THREE.MeshStandardMaterial({ color: 0x2f5a3a, roughness: .9, flatShading: true })); s.position.set(x, .78, z); g.add(s); blob(.5, .5, x, z); };
    if (S.room === 'Living room') {
      const rug = box(2.9, .012, 2.1, W / 2, 0, D * .55, 0x8a7d70); blob(3.2, 2.4, W / 2, D * .55, .35);
      box(2.3, .42, .95, W / 2, 0, 1.05, 0x3d4350); box(2.3, .5, .2, W / 2, .35, .6, 0x353b47); box(.22, .22, .95, W / 2 - 1.05, .42, 1.05, 0x353b47); box(.22, .22, .95, W / 2 + 1.05, .42, 1.05, 0x353b47); blob(2.5, 1.2, W / 2, 1.1);
      box(1.1, .38, .6, W / 2, 0, D * .5, 0x8c6a48, .6); blob(1.3, .8, W / 2, D * .5, .8);
      box(.45, .5, 1.9, .3, 0, D / 2, 0x2b2623); box(.06, .75, 1.3, .2, .95, D / 2, 0x0d0f12, .3); plant(W - .5, .55);
      box(.4, 1.9, 1.2, W - .22, 0, D * .55, 0x6a5946); box(.45, .5, .45, W / 2 + 1.55, 0, .75, 0x8c6a48);
      const pic = box(1.1, .75, .03, W / 2, 1.3, .02, 0x9a8366); pic.material.roughness = .5;
    } else if (S.room === 'Bedroom') {
      box(1.9, .6, 2.1, W / 2, 0, 1.3, 0xd9d2c8, .95); box(1.9, 1.0, .12, W / 2, 0, .08, 0x5d5149); box(.7, .12, .45, W / 2 - .5, .6, .6, 0xf2eee6); box(.7, .12, .45, W / 2 + .5, .6, .6, 0xf2eee6); blob(2.2, 2.4, W / 2, 1.3);
      box(.5, .5, .45, W / 2 - 1.3, 0, .3, 0x6a5946); box(.5, .5, .45, W / 2 + 1.3, 0, .3, 0x6a5946); box(.5, 2.1, 1.5, W - .28, 0, D * .55, 0x7a6955); box(2.3, .012, 1.6, W / 2, 0, 1.7, 0x9c9488); plant(.45, D - .5);
    } else if (S.room === 'Workspace') {
      box(1.7, .04, .75, W / 2, .72, .45, 0x8c6a48, .55); box(.05, .72, .7, W / 2 - .8, 0, .45, 0x2b2623); box(.05, .72, .7, W / 2 + .8, 0, .45, 0x2b2623); blob(1.9, 1.0, W / 2, .55);
      box(.62, .36, .03, W / 2, .78 + .25, .4, 0x0d0f12, .3); box(.06, .25, .06, W / 2, .76, .42, 0x2b2623);
      box(.55, .08, .55, W / 2 + .1, .5, 1.25, 0x23272e); box(.55, .55, .08, W / 2 + .1, .55, 1.5, 0x23272e); cyl(.03, .5, W / 2 + .1, 0, 1.25, 0x23272e); blob(.9, .9, W / 2 + .1, 1.3);
      box(.4, 1.9, 1.4, .24, 0, D * .55, 0x6a5946); plant(W - .5, .5);
    } else { /* Kitchen */
      box(W, .88, .6, W / 2, 0, .3, 0x5c6470); box(W, .04, .62, W / 2, .88, .3, 0xb9b5ad, .4); box(.6, .88, D - .6, W - .3, 0, .6 + (D - .6) / 2, 0x5c6470); box(.62, .04, D - .6, W - .31, .88, .6 + (D - .6) / 2, 0xb9b5ad, .4);
      box(W - .6, .7, .34, (W - .6) / 2, 1.5, .17, 0x6b7380); box(1.5, .88, .8, W * .38, 0, D * .58, 0x5c6470); box(1.6, .04, .86, W * .38, .88, D * .58, 0xb9b5ad, .4);
      [-.4, .4].forEach(o => { box(.4, .45, .4, W * .38 + o, 0, D * .58 + .78, 0x8c6a48); }); blob(1.7, 1.0, W * .38, D * .58);
    }
    scene.add(g);
    meterPlane.constant = -S.planeH;
    controlsReset();
  }

  /* ---------- luminaire layout (photometric + visual) ---------- */
  function lidFor() {
    if (S.ies) return S.ies;
    const m = st().mount; if (m === 'pendant') return P.lidOmni(); if (m === 'desk') return P.lidLambert(75); if (S.pid === 'downlight') return P.lidLambert(80); return P.lidLambert(90);
  }
  function spec() {
    const s = st(), p = prod();
    let flux = S.fluxOverride != null ? S.fluxOverride : s.flux.v, watts = s.watts.v;
    if (s.kind === 'variant') { watts = S.vw; if (S.fluxOverride == null) flux = S.vw * s.efficacy.v; }
    let cct = s.kind === 'variant' ? s.cctMap[S.vc] : s.cct ? Math.min(s.cct.max, Math.max(s.cct.min, S.mode === 'white' || s.kind !== 'rgb' ? S.cct : S.cct)) : 3000;
    if (s.kind === 'fixed') cct = s.cct.def;
    const colour = s.kind === 'rgb' && S.mode === 'color' ? P.hexToLinearRGB(S.color) : P.cctToLinearRGB(cct);
    const dim = (s.kind === 'fixed' || s.kind === 'variant') ? 1 : S.dim / 100;
    return { flux, watts, cct, colour, dim, isColour: s.kind === 'rgb' && S.mode === 'color' };
  }
  function gridPos(n, W, D) {
    const cols = Math.max(1, Math.round(Math.sqrt(n * W / D))), rows = Math.ceil(n / cols), out = [];
    for (let k = 0; k < n; k++) { const r = Math.floor(k / cols), c = k % cols, inRow = r === rows - 1 ? n - cols * (rows - 1) : cols; out.push([(c + .5) * W / inRow, (r + .5) * D / rows]); }
    return out;
  }
  /** luminaires for N units: [{pos,axis,flux,lid, vis:{type,...}}] - flux here is the *undimmed* flux */
  function layout(n, sp) {
    const { W, D, H } = room(), s = st(), lid = lidFor(), out = [];
    if (s.mount === 'ceiling') gridPos(n, W, D).forEach(([x, z]) => out.push({ pos: [x, H - .015, z], axis: [0, -1, 0], flux: sp.flux, lid, vis: { t: 'disc', r: (s.size || .2) / 2 } }));
    else if (s.mount === 'pendant') gridPos(n, W, D).forEach(([x, z]) => { for (let a = 0; a < 5; a++) { const an = a / 5 * Math.PI * 2; out.push({ pos: [x + Math.cos(an) * .28, H - .72, z + Math.sin(an) * .28], axis: [0, -1, 0], flux: sp.flux / 5, lid, vis: { t: 'bulb', cx: x, cz: z } }); } });
    else if (s.mount === 'desk') { const row = Math.min(n, 4); for (let k = 0; k < n; k++) out.push({ pos: [W / 2 + (k - (row - 1) / 2) * .9, S.planeH + .36, S.room === 'Workspace' ? .5 : D * .4 + Math.floor(k / 4) * .7], axis: [0, -1, 0], flux: sp.flux, lid, vis: { t: 'desk' } }); }
    else if (s.mount === 'floor') { for (let k = 0; k < n; k++) { const left = k % 2 === 0, zi = (Math.floor(k / 2) + 1) / (Math.ceil(n / 2) + 1); out.push({ pos: [left ? .3 : W - .3, .85, D * (left ? zi : 1 - zi * .9)], axis: [left ? -1 : 1, 0, 0], flux: sp.flux, lid, vis: { t: 'floor', left } }); } }
    else if (s.mount === 'cove') {
      const per = 2 * (W + D), len = Math.min(per, 5 * n), M = Math.max(2, Math.round(len / .25)), fl = sp.flux * len / 5 / M;
      const at = d => { d = ((d % per) + per) % per; if (d < W) return [d, 0.06]; d -= W; if (d < D) return [W - .06, d]; d -= D; if (d < W) return [W - d, D - .06]; d -= W; return [.06, D - d]; };
      for (let k = 0; k < M; k++) { const [x, z] = at(.8 + (k + .5) * len / M); out.push({ pos: [x, H - .18, z], axis: [0, 1, 0], flux: fl, lid, vis: { t: 'cove', seg: len / M } }); }
    }
    return out;
  }
  const dimmed = (lums, sp) => lums.map(l => ({ ...l, flux: l.flux * sp.dim * (S.lightsOn ? 1 : 0) }));

  /* ---------- 3D lights ---------- */
  function clearLights() { if (group.lights) { scene.remove(group.lights); group.lights.traverse(o => { o.geometry?.dispose?.(); o.dispose?.(); }); } reg.length = 0; group.lights = new THREE.Group(); scene.add(group.lights); }
  let ambient, moon;
  function buildLights() {
    clearLights(); const { W, D, H } = room(), sp = spec(), s = st(), lg = group.lights, nominal = layout(S.count, sp); lumsCache = nominal;
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b1f26, roughness: .5, metalness: .4 });
    const emit = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1) });
    const addRect = (w, h, pos, target, flux, vis) => {
      const l = new THREE.RectAreaLight(0xffffff, 1, w, h); l.position.set(...pos); l.lookAt(...target); lg.add(l); reg.push({ obj: l, kind: 'rect', area: w * h, flux, tint: 0 }); return l; };
    const emitMesh = (geo, pos, rot) => { const m = new THREE.Mesh(geo, emit()); m.position.set(...pos); if (rot) m.rotation.set(...rot); lg.add(m); reg.push({ kind: 'emit', mat: m.material, area: geo.userData.area || 1, mesh: m }); return m; };
    nominal.forEach((L, i) => {
      const v = L.vis;
      if (v.t === 'disc') {
        const a = v.r * v.r * Math.PI, side = Math.sqrt(a);
        const g = new THREE.CircleGeometry(v.r, 40); g.userData.area = a; emitMesh(g, [L.pos[0], L.pos[1] - .004, L.pos[2]], [Math.PI / 2, 0, 0]);
        const rim = new THREE.Mesh(new THREE.RingGeometry(v.r, v.r + .012, 40), new THREE.MeshStandardMaterial({ color: 0xdfe3e6, roughness: .6, side: THREE.DoubleSide })); rim.position.set(L.pos[0], L.pos[1] - .003, L.pos[2]); rim.rotation.x = Math.PI / 2; lg.add(rim);
        addRect(side, side, [L.pos[0], L.pos[1] - .02, L.pos[2]], [L.pos[0], 0, L.pos[2]], L.flux);
      } else if (v.t === 'bulb') {
        const g = new THREE.SphereGeometry(.035, 12, 10); g.userData.area = 4 * Math.PI * .035 * .035; emitMesh(g, L.pos);
        const pl = new THREE.PointLight(0xffffff, 1, 0, 2); pl.position.set(...L.pos); lg.add(pl); reg.push({ obj: pl, kind: 'point', flux: L.flux });
        if (i % 5 === 0) { const arm = new THREE.Mesh(new THREE.TorusGeometry(.28, .008, 6, 40), new THREE.MeshStandardMaterial({ color: 0xc8a96a, metalness: .8, roughness: .3 })); arm.rotation.x = Math.PI / 2; arm.position.set(v.cx, H - .78, v.cz); lg.add(arm); const rod = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .75, 6), new THREE.MeshStandardMaterial({ color: 0xc8a96a, metalness: .8, roughness: .3 })); rod.position.set(v.cx, H - .38, v.cz); lg.add(rod);
          const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.06), new THREE.MeshStandardMaterial({ color: 0xcfe9ff, roughness: .05, metalness: .1, transparent: true, opacity: .7 })); crystal.position.set(v.cx, H - .98, v.cz); lg.add(crystal); }
      } else if (v.t === 'desk') {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(.07, .08, .02, 20), dark); base.position.set(L.pos[0] + .18, S.planeH + .01, L.pos[2]); lg.add(base);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .4, 8), dark); arm.position.set(L.pos[0] + .09, S.planeH + .19, L.pos[2]); arm.rotation.z = .5; lg.add(arm);
        const head = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .02, 24), dark); head.position.set(L.pos[0], L.pos[1] + .01, L.pos[2]); lg.add(head);
        const g = new THREE.CircleGeometry(.065, 24); g.userData.area = Math.PI * .065 * .065; emitMesh(g, [L.pos[0], L.pos[1] - .002, L.pos[2]], [Math.PI / 2, 0, 0]);
        addRect(.115, .115, [L.pos[0], L.pos[1] - .015, L.pos[2]], [L.pos[0], 0, L.pos[2]], L.flux);
      } else if (v.t === 'floor') {
        const dir = v.left ? -1 : 1, x = L.pos[0], tube = new THREE.CylinderGeometry(.03, .03, 1.36, 16);
        const m = new THREE.Mesh(tube, dark); m.position.set(x - dir * .0, .68, L.pos[2]); lg.add(m);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(.14, .16, .03, 24), dark); base.position.set(x, .015, L.pos[2]); lg.add(base);
        for (let k = 0; k < 3; k++) { const y = .35 + k * .45, seg = new THREE.BoxGeometry(.012, .38, .05); seg.userData.area = .38 * .05; const em = emitMesh(seg, [x + dir * .03, y + .1, L.pos[2]]); reg.push({ kind: 'hue', mat: em.material, off: (k - 1) * 42 });
          const rl = new THREE.RectAreaLight(0xffffff, 1, .05, .38); rl.position.set(x + dir * .04, y + .1, L.pos[2]); rl.lookAt(dir * 100 + x, y + .1, L.pos[2]); lg.add(rl); reg.push({ obj: rl, kind: 'rect', area: .05 * .38 * 3, flux: L.flux, tint: (k - 1) * 42, split: 3 }); }
      } else if (v.t === 'cove') {
        const g = new THREE.BoxGeometry(.25, .012, .012); g.userData.area = .25 * .012; const along = Math.abs(L.pos[2] - .06) < .01 || Math.abs(L.pos[2] - (D - .06)) < .01;
        const mesh = emitMesh(g, L.pos); if (!along) mesh.rotation.y = Math.PI / 2;
      }
    });
    /* merge cove segments into a few long rect lights for the renderer (analytic engine uses all points) */
    if (s.mount === 'cove') {
      const walls = [[W / 2, .06, W, 0, 'h'], [W - .06, D / 2, D, 0, 'v'], [W / 2, D - .06, W, 0, 'h'], [.06, D / 2, D, 0, 'v']];
      const used = nominal.length, totalFlux = nominal.reduce((a, l) => a + l.flux, 0);
      const wallOf = l => (Math.abs(l.pos[2] - .06) < .02 ? 0 : Math.abs(l.pos[0] - (W - .06)) < .02 ? 1 : Math.abs(l.pos[2] - (D - .06)) < .02 ? 2 : 3);
      const buckets = [0, 0, 0, 0]; nominal.forEach(l => { buckets[wallOf(l)] += l.flux; });
      walls.forEach((w, k) => { if (buckets[k] <= 0) return; const rl = new THREE.RectAreaLight(0xffffff, 1, w[4] === 'h' ? w[2] : .04, w[4] === 'h' ? .04 : w[2]); rl.position.set(w[0], H - .17, w[1]); rl.rotation.set(Math.PI / 2, 0, 0); rl.lookAt(w[0], H, w[1]); lg.add(rl); reg.push({ obj: rl, kind: 'rect', area: w[2] * .04, flux: buckets[k], tint: 0 }); });
    }
    if (!ambient) { ambient = new THREE.AmbientLight(0xffffff, 1); } if (!moon) { moon = new THREE.AmbientLight(0x6f8fd8, 1); }
    scene.add(ambient); scene.add(moon);
    applyState(true);
  }

  const evScale = () => BASE_EV_SCALE * Math.pow(2, S.ev);
  function applyState(solveToo) {
    const sp = spec(), scale = evScale(), on = S.lightsOn ? 1 : 0, c = sp.colour;
    const tint = off => { if (!off || !sp.isColour) return c; const hsl = {}; new THREE.Color().setRGB(c[0], c[1], c[2], THREE.LinearSRGBColorSpace).getHSL(hsl); const col = new THREE.Color().setHSL((hsl.h + off / 360 + 1) % 1, Math.max(.6, hsl.s), hsl.l); const l = col.r * .2126 + col.g * .7152 + col.b * .0722 || 1; return [col.r / l, col.g / l, col.b / l]; };
    for (const r of reg) {
      if (r.kind === 'rect') { const t = tint(r.tint), Lum = (r.flux * sp.dim * on) / (Math.PI * r.area); r.obj.color.setRGB(t[0], t[1], t[2], THREE.LinearSRGBColorSpace); r.obj.intensity = Lum * scale; }
      else if (r.kind === 'point') { r.obj.color.setRGB(c[0], c[1], c[2], THREE.LinearSRGBColorSpace); r.obj.intensity = (r.flux * sp.dim * on) / (4 * Math.PI) * scale; }
      else if (r.kind === 'emit' || r.kind === 'hue') {
        const t = r.kind === 'hue' ? tint(r.off) : c; const L0 = emitLuminance(r) * sp.dim * on * scale; const vis = Math.min(L0, 22);
        r.mat.color.setRGB(t[0] * vis, t[1] * vis, t[2] * vis, THREE.LinearSRGBColorSpace);
        if (!on) r.mat.color.setRGB(.01, .01, .01, THREE.LinearSRGBColorSpace);
      }
    }
    if (solveToo) solve();
    if (ambient) { const c2 = c; ambient.color.setRGB(c2[0], c2[1], c2[2], THREE.LinearSRGBColorSpace); ambient.intensity = (sol ? sol.Eir / S.mf : 0) * scale; }
    if (moon) moon.intensity = 1.6 * scale;
  }
  /* visual surface luminance of an emitter mesh (cd/m2) so it matches the area light feeding the engine */
  function emitLuminance(r) { const total = lumsCache.reduce((a, l) => a + l.flux, 0); const sp = spec(); const m = st().mount;
    const n = lumsCache.length || 1, per = total / n; const area = r.area || 1;
    if (m === 'cove') return per / (Math.PI * area) * 0.6; if (m === 'floor') return per / 3 / (Math.PI * area) * 0.4; if (m === 'pendant') return per / (Math.PI * area) * .08;
    return per / (Math.PI * area) * (sp ? 1 : 1) * (m === 'ceiling' ? .55 : 1); }

  /* ---------- engine ---------- */
  function engineRoom() { const { W, D, H } = room(), f = FINISHES[S.finish]; return { W, D, H, planeH: S.planeH, rho: f }; }
  function solve() {
    const sp = spec(), lums = dimmed(lumsCache, sp);
    sol = P.solveRoom(engineRoom(), lums, { mf: S.mf, nx: 44, nz: 36 }); sol.lums = lums;
    updateOverlay(); updateMetrics(); drawPlan(); drawPolar();
  }
  function metersAt(x, z) { return P.eAt(engineRoom(), sol.lums, sol.Eir / S.mf, [x, S.planeH, z], S.mf); }

  /* ---------- false-colour overlay ---------- */
  const TURBO = [[0, '#1b1060'], [.12, '#2a3fd8'], [.28, '#13b5e6'], [.42, '#25d9a1'], [.58, '#a6e12f'], [.74, '#fcd22b'], [.88, '#f57a1e'], [1, '#d3202a']];
  function colormap(t) { t = Math.max(0, Math.min(1, t)); for (let i = 1; i < TURBO.length; i++) if (t <= TURBO[i][0]) { const a = TURBO[i - 1], b = TURBO[i], u = (t - a[0]) / (b[0] - a[0]); const ca = new THREE.Color(a[1]), cb = new THREE.Color(b[1]); return ca.lerp(cb, u); } return new THREE.Color(TURBO[TURBO.length - 1][1]); }
  const targetLux = () => room().acts[S.act][1];
  const maxScale = () => Math.max(targetLux() * 2, 100);
  function heatCanvas(w, h) {
    const c = document.createElement('canvas'); c.width = sol.nx; c.height = sol.nz; const g = c.getContext('2d'), im = g.createImageData(sol.nx, sol.nz), mx = maxScale();
    for (let j = 0; j < sol.nz; j++) for (let i = 0; i < sol.nx; i++) { const col = colormap(sol.grid[j * sol.nx + i] / mx); const k = (j * sol.nx + i) * 4; im.data[k] = col.r * 255; im.data[k + 1] = col.g * 255; im.data[k + 2] = col.b * 255; im.data[k + 3] = 255; }
    g.putImageData(im, 0, 0); const o = document.createElement('canvas'); o.width = w; o.height = h; const og = o.getContext('2d'); og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high'; og.drawImage(c, 0, 0, w, h); return o;
  }
  function updateOverlay() {
    if (!scene) return; if (group.overlay) { scene.remove(group.overlay); group.overlay.material.map?.dispose(); group.overlay.geometry.dispose(); group.overlay = null; }
    if (!S.overlay) return; const { W, D } = room(); const tex = new THREE.CanvasTexture(heatCanvas(512, Math.round(512 * D / W))); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .8, depthWrite: false, color: new THREE.Color(1.5, 1.5, 1.5) })); m.rotation.x = -Math.PI / 2; m.position.set(W / 2, S.planeH + .004, D / 2); scene.add(m); group.overlay = m;
  }

  /* ---------- camera ---------- */
  function controlsReset() { if (!cam) return; setView(S.view, true); }
  function setView(v, instant) {
    S.view = v; const { W, D, H } = room(); if (!cam) return;
    if (v === 'plan') { cam.up.set(0, 0, -1); const h = Math.max(W / cam.aspect, D) * 1.05 / (2 * Math.tan(cam.fov * Math.PI / 360)) + 1; cam.position.set(W / 2, h + .6, D / 2 + .01); controls.target.set(W / 2, 0, D / 2); controls.enableRotate = false; }
    else { cam.up.set(0, 1, 0); cam.position.set(W / 2, 1.55, D + 2.6); controls.target.set(W / 2, 1.15, D * .35); controls.enableRotate = true; }
    controls.update();
  }

  function onPointer(e) {
    if (!S.meter || !sol || !meterEl) return; const r = renderer.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)); ray.setFromCamera(ptr, cam);
    const hit = new THREE.Vector3(); const { W, D } = room();
    if (ray.ray.intersectPlane(meterPlane, hit) && hit.x > 0 && hit.x < W && hit.z > 0 && hit.z < D) { const lx = metersAt(hit.x, hit.z); meterEl.style.opacity = 1; meterEl.style.transform = `translate(${e.clientX - r.left + 14}px,${e.clientY - r.top + 14}px)`; meterEl.innerHTML = `<b>${Math.round(lx)} lx</b><small>maintained · ${S.planeH.toFixed(2)} m plane</small>`; }
    else meterEl.style.opacity = 0;
  }

  /* ---------- 2D plan + polar ---------- */
  function drawPlan() {
    const cv = root.querySelector('#st-plan'); if (!cv || !sol) return; const { W, D } = room(); const w = cv.width = 360, h = cv.height = Math.round(360 * D / W) + 0; const g = cv.getContext('2d');
    g.drawImage(heatCanvas(w, h), 0, 0); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.5; g.strokeRect(.75, .75, w - 1.5, h - 1.5);
    g.setLineDash([4, 4]); g.strokeStyle = 'rgba(255,255,255,.5)'; g.strokeRect(.5 / W * w, .5 / D * h, w - 1 / W * w, h - 1 / D * h); g.setLineDash([]);
    const mx = maxScale(); const marks = [[.25, .25], [.5, .25], [.75, .25], [.25, .5], [.5, .5], [.75, .5], [.25, .75], [.5, .75], [.75, .75]];
    g.font = '600 11px Manrope, Arial'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,.72)';
    marks.forEach(([u, v]) => { const lx = metersAt(u * W, v * D); g.fillStyle = 'rgba(8,10,14,.62)'; g.fillRect(u * w - 17, v * h - 9, 34, 16); g.fillStyle = '#fff'; g.fillText(Math.round(lx), u * w, v * h + 3); });
    const lmap = new Map(); sol.lums.forEach(l => { const key = (l.pos[0] * 10 | 0) + ',' + (l.pos[2] * 10 | 0); lmap.set(key, l); });
    sol.lums.forEach(l => { if (st().mount === 'cove' || st().mount === 'pendant') return; g.beginPath(); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.arc(l.pos[0] / W * w, l.pos[2] / D * h, 5, 0, 7); g.fill(); g.stroke(); });
    const lg = root.querySelector('#st-legend'); if (lg) lg.innerHTML = `<i style="background:linear-gradient(90deg,${TURBO.map(t => t[1] + ' ' + t[0] * 100 + '%').join(',')})"></i><span>0</span><span>${Math.round(mx / 2)}</span><span>${Math.round(mx)} lx</span>`;
  }
  function drawPolar() {
    const cv = root.querySelector('#st-polar'); if (!cv) return; const s = 240, g = cv.getContext('2d'); cv.width = cv.height = s; g.clearRect(0, 0, s, s); const lid = lidFor(), sp = spec(); const cx = s / 2, cy = s / 2 + 4, R = s / 2 - 22;
    const peak = Math.max(...Array.from({ length: 181 }, (_, d) => lid.I(d * Math.PI / 180))) * sp.flux; const rings = [.25, .5, .75, 1];
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.fillStyle = 'rgba(255,255,255,.5)'; g.font = '9px Manrope, Arial'; g.textAlign = 'left';
    rings.forEach(f => { g.beginPath(); g.arc(cx, cy, R * f, 0, 7); g.stroke(); g.fillText(Math.round(peak * f) + ' cd', cx + 3, cy - R * f + 10); });
    for (let a = 0; a < 360; a += 30) { const r = a * Math.PI / 180; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(r) * R, cy + Math.cos(r) * R); g.stroke(); }
    g.beginPath(); for (let a = 0; a <= 360; a++) { const th = a <= 180 ? a : 360 - a, I = lid.I(th * Math.PI / 180) * sp.flux; const r = peak ? I / peak * R : 0; const x = cx + Math.sin(a * Math.PI / 180) * r, y = cy + Math.cos(a * Math.PI / 180) * r; a ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath(); g.fillStyle = 'rgba(255,196,120,.22)'; g.fill(); g.strokeStyle = '#ffc47a'; g.lineWidth = 2; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.textAlign = 'center'; g.fillText('0° nadir', cx, cy + R + 14); g.fillText('180°', cx, cy - R - 6);
    const note = root.querySelector('#st-lidnote'); if (note) note.innerHTML = `${esc(lid.name)} · peak <b>${Math.round(peak)} cd</b> at ${Math.round(sp.flux * sp.dim)} lm · beam (FWHM) <b>${Math.round(P.beamAngle(lid))}°</b>`;
  }

  /* ---------- metrics ---------- */
  const fmt = (n, d = 0) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d });
  function updateMetrics() {
    const sp = spec(), s = st(), { W, D, H } = room(), A = W * D, tgt = targetLux(); const set = (id, v) => { const el = root.querySelector('#' + id); if (el) el.innerHTML = v; };
    const eff = sp.flux / sp.watts, totW = sp.watts * S.count * sp.dim * (s.mount === 'cove' ? Math.min(1, (2 * (W + D)) / (5 * S.count)) : 1);
    const totFlux = sol.totalFlux; const pct = tgt ? Math.round(sol.Eavg / tgt * 100) : 0;
    set('m-eavg', fmt(sol.Eavg)); set('m-target', `Target <b>${tgt} lx</b> · ${esc(room().acts[S.act][0])}`);
    const status = !S.lightsOn ? ['off', 'Lights off'] : pct < 70 ? ['low', 'Under-lit'] : pct <= 135 ? ['ok', 'On target'] : ['hi', 'Over-lit'];
    const bar = root.querySelector('#m-bar'); if (bar) { bar.style.setProperty('--p', Math.min(160, pct) / 160 * 100 + '%'); bar.style.setProperty('--t', 100 / 160 * 100 + '%'); bar.dataset.s = status[0]; } set('m-status', status[1]);
    set('m-u0', sol.U0.toFixed(2)); set('m-u0n', sol.U0 >= .4 ? 'meets ≥ 0.40 task guidance' : sol.U0 >= .1 ? 'ambient-level uniformity' : 'very uneven');
    set('m-min', fmt(sol.Emin) + ' / ' + fmt(sol.Emax)); set('m-w', fmt(totW, 0) + ' W'); set('m-wm2', fmt(totW / A, 1) + ' W/m²');
    set('m-flux', fmt(totFlux) + ' lm output'); set('m-eff', fmt(eff, 0) + ' lm/W'); set('m-k', P.roomIndex(W, D, H, S.planeH).toFixed(2));
    set('m-uf', sol.UF.toFixed(2)); set('m-cct', sp.isColour ? 'RGB colour' : fmt(sp.cct) + ' K'); set('m-dir', fmt(sol.Edirect) + ' / ' + fmt(sol.Eir) + ' lx');
    const kwh = totW * S.hours * 365 / 1000; set('m-kwh', fmt(kwh, 0) + ' kWh/yr'); set('m-cost', '₹' + fmt(kwh * S.tariff, 0) + '/yr');
    /* units needed for target: sweep N with the same engine */
    let need = null; const saved = S.count;
    for (let n = 1; n <= 24; n++) { const ls = layout(n, sp); const r = P.solveRoom(engineRoom(), ls, { mf: S.mf, nx: 22, nz: 18 }); if (r.Eavg >= tgt) { need = n; break; } }
    S.count = saved; set('m-need', need ? `<b>${need}</b> ${need === 1 ? 'unit' : 'units'} reach ${tgt} lx at full output` : `More than 24 units needed for ${tgt} lx`);
    const price = s.kind === 'variant' ? (prod().variants.find(v => v.w === S.vw && v.c === S.vc)?.p) : prod().price; set('m-price', price ? money(price * S.count) : 'Variant sold out in snapshot');
    const cal = S.ies ? 'IES-based' : S.fluxOverride != null ? 'User datasheet value' : (s.flux.s === 'assumed' ? 'Class-typical' : 'Listing'); set('m-cal', cal);
  }

  /* ---------- UI ---------- */
  const chip = k => ({ listing: '<em class="chip ok" title="Stated on the official Philips India listing">Listing</em>', assumed: '<em class="chip warn" title="Class-typical value: replace with datasheet / IES">Assumed</em>', user: '<em class="chip user">Your value</em>', ies: '<em class="chip ok">IES</em>', model: '<em class="chip info">Model</em>', na: '<em class="chip na">Not stated</em>' }[k]);
  function controlsHTML() {
    const p = prod(), s = st(), rm = room(), sp = spec();
    const picker = STUDIO_IDS.map(id => { const a = byId(id); return `<button class="st-fix ${id === S.pid ? 'active' : ''}" data-a="prod" data-id="${id}"><span class="th">${imgTag(a)}</span><span><b>${esc(a.name.replace(/^Wi-Fi |^Smart Wi-Fi /, ''))}</b><small>${esc(a.cls)}</small></span></button>`; }).join('');
    const rooms = Object.keys(ROOMS).map(r => `<button class="st-tab ${r === S.room ? 'active' : ''}" data-a="room" data-id="${r}">${r}</button>`).join('');
    const presets = s.presets ? `<div class="st-row"><label>Scenes</label><div class="st-pills">${s.presets.map(x => `<button class="${S.preset === x ? 'active' : ''}" data-a="preset" data-id="${x}">${x}</button>`).join('')}</div></div>` : '';
    const dimRow = s.kind === 'fixed' || s.kind === 'variant' ? `<p class="st-lock">This fitting has no dimming or colour control on the listing. It is modelled at fixed output.</p>` : `<div class="st-row"><label>Output <output id="o-dim">${S.dim}%</output></label><input type="range" id="i-dim" min="2" max="100" value="${S.dim}"></div>`;
    const cctRow = (s.cct && s.cct.min !== s.cct.max && s.kind !== 'variant') ? `<div class="st-row" id="row-cct" ${s.kind === 'rgb' && S.mode === 'color' ? 'hidden' : ''}><label>White temperature <output id="o-cct">${S.cct} K</output> ${chip(s.cct.s)}</label><div class="kbar"></div><input type="range" id="i-cct" min="${s.cct.min}" max="${s.cct.max}" step="50" value="${S.cct}"><div class="ext"><span>Warm</span><span>Cool</span></div></div>` : '';
    const modeRow = s.kind === 'rgb' ? `<div class="st-row"><label>Mode</label><div class="st-pills"><button class="${S.mode === 'white' ? 'active' : ''}" data-a="mode" data-id="white">Tunable white</button><button class="${S.mode === 'color' ? 'active' : ''}" data-a="mode" data-id="color">Colour</button></div></div>` : (s.kind === 'tw' ? `<p class="st-lock">Tunable white only. RGB colour is not supported by this listing.</p>` : '');
    const colRow = s.kind === 'rgb' ? `<div class="st-row" id="row-col" ${S.mode === 'color' ? '' : 'hidden'}><label>Colour</label><div class="st-sw">${SWATCH.map(c => `<button data-a="color" data-id="${c}" class="${S.color === c ? 'active' : ''}" style="--c:${c}" aria-label="${c}"></button>`).join('')}<input type="color" id="i-col" value="${S.color}" aria-label="Custom colour"></div></div>` : '';
    const varRow = s.kind === 'variant' ? `<div class="st-row"><label>Wattage (purchase option)</label><div class="st-pills">${[7, 12, 15, 22].map(w => `<button class="${S.vw === w ? 'active' : ''}" data-a="vw" data-id="${w}">${w} W</button>`).join('')}</div></div><div class="st-row"><label>Colour (purchase option) ${chip('assumed')}</label><div class="st-pills">${['Warm white', 'Natural white', 'Cool daylight'].map(c => { const ok = p.variants.some(v => v.w === S.vw && v.c === c && v.ok); const ex = p.variants.some(v => v.w === S.vw && v.c === c); return `<button class="${S.vc === c ? 'active' : ''} ${ex ? '' : 'na'} ${ok ? '' : 'sold'}" data-a="vc" data-id="${c}" ${ex ? '' : 'disabled'} title="${ex ? (ok ? 'In stock on snapshot' : 'Sold out on snapshot') : 'Not offered at this wattage'}">${c}${ex && !ok ? ' · sold out' : ''}</button>`; }).join('')}</div><p class="st-lock">CCT per colour name (3000 / 4000 / 6500 K) is an Indian-market convention, not stated on the listing.</p></div>` : '';
    return `
    <div class="st-block"><div class="st-h"><span class="eyebrow">01 · Space</span></div><div class="st-tabs">${rooms}</div>
      <div class="st-row"><label>Activity target</label><select id="i-act">${rm.acts.map((a, i) => `<option value="${i}" ${i === S.act ? 'selected' : ''}>${a[0]} · ${a[1]} lx</option>`).join('')}</select></div>
      <div class="st-row"><label>Surface finish ${chip('assumed')}</label><div class="st-pills">${Object.keys(FINISHES).map(f => `<button class="${S.finish === f ? 'active' : ''}" data-a="finish" data-id="${f}" title="ρ ceiling ${FINISHES[f].ceil} · wall ${FINISHES[f].wall} · floor ${FINISHES[f].floor}">${f}</button>`).join('')}</div></div></div>
    <div class="st-block"><div class="st-h"><span class="eyebrow">02 · Fixture</span><button class="st-link" data-a="adv">Calibration ${S.adv ? '−' : '+'}</button></div>
      <div class="st-row"><label>Quantity <output>${S.count}</output></label><div class="st-step"><button data-a="n-" aria-label="Fewer">−</button><b>${S.count}</b><button data-a="n+" aria-label="More">+</button></div></div>
      ${varRow}${dimRow}${modeRow}${cctRow}${colRow}${presets}
      <div class="st-need" id="m-need"></div></div>
    <div class="st-block st-adv" ${S.adv ? '' : 'hidden'}><div class="st-h"><span class="eyebrow">Calibration inputs</span></div>
      <div class="st-row"><label>Datasheet luminous flux per unit (lm) ${S.fluxOverride != null ? chip('user') : chip(s.flux.s)}</label><div class="st-inline"><input type="number" id="i-flux" min="10" max="20000" step="10" placeholder="${Math.round(sp.flux)}" value="${S.fluxOverride ?? ''}"><button data-a="fluxreset">Reset</button></div></div>
      <div class="st-row"><label>IES photometry file (LM-63, type C) ${S.ies ? chip('ies') : ''}</label><div class="st-inline"><input type="file" id="i-ies" accept=".ies,.IES,text/plain"><button data-a="iesclear" ${S.ies ? '' : 'disabled'}>Clear</button></div><small class="st-msg" id="ies-msg">${S.ies ? `Loaded: ${Math.round(S.ies.integratedFlux)} lm integrated${S.ies.ratedFlux ? ', rated ' + S.ies.ratedFlux + ' lm' : ''}.` : 'Drop in a manufacturer .ies file to replace the modelled distribution in all metrics.'}</small></div>
      <div class="st-row"><label>Maintenance factor <output id="o-mf">${S.mf.toFixed(2)}</output></label><input type="range" id="i-mf" min=".5" max="1" step=".01" value="${S.mf}"></div>
      <div class="st-row"><label>Work plane</label><div class="st-pills">${[[0, 'Floor'], [.75, 'Table 0.75 m'], [.9, 'Counter 0.90 m']].map(([v, t]) => `<button class="${S.planeH === v ? 'active' : ''}" data-a="plane" data-id="${v}">${t}</button>`).join('')}</div></div>
      <div class="st-row"><label>Camera exposure <output id="o-ev">${S.ev > 0 ? '+' : ''}${S.ev.toFixed(1)} EV</output></label><input type="range" id="i-ev" min="-2" max="2" step=".1" value="${S.ev}"></div>
      <div class="st-row two"><label>Hours / day<input type="number" id="i-hours" min="0" max="24" value="${S.hours}"></label><label>₹ per kWh (assumed)<input type="number" id="i-tariff" min="0" max="50" step=".5" value="${S.tariff}"></label></div></div>
    <div class="st-cta"><div><small>Configuration</small><b id="m-price">—</b></div><button class="btn dark" data-a="add">Add to concept bag</button><a href="${esc(p.url)}" target="_blank" rel="noopener">Verify on official listing ↗</a></div>`;
  }

  function shell() {
    return `<section class="st-wrap">
    <div class="st-layout">
      <div class="st-left">
        <div class="st-fixrow" id="st-fixrow"></div>
        <div class="st-stage" id="st-stage">
          <div class="st-hud tl"><span class="live"><i></i> Photometric preview</span><div class="st-big"><b id="m-eavg">0</b><span>lux avg<br><small>maintained, task area</small></span></div>
            <div class="st-gauge" id="m-bar"><span class="fill"></span><span class="tick"></span></div><div class="st-status"><span id="m-status"></span><span id="m-target"></span></div></div>
          <div class="st-hud tr"><button class="st-ico ${S.lightsOn ? '' : 'active'}" data-a="off">${S.lightsOn ? 'Lights on' : 'Lights off'}</button><button class="st-ico ${S.overlay ? 'active' : ''}" data-a="overlay">Lux map</button><button class="st-ico ${S.view === 'plan' ? 'active' : ''}" data-a="view">${S.view === 'plan' ? 'Perspective' : 'Plan view'}</button><button class="st-ico" data-a="shot">Snapshot</button></div>
          <div class="st-meter" id="st-meter"></div>
          <div class="st-hud bl"><span id="m-cal-wrap">Calibration: <b id="m-cal"></b></span><span>Direct: analytic, unshadowed · Indirect: integrating-sphere model</span></div>
          <div class="st-nogl"><b>WebGL unavailable</b><p>The photometric numbers below still work. Open in a recent Chrome, Edge, Safari or Firefox for the 3D room.</p></div>
        </div>
        <div class="st-strip">
          <div class="mt"><span>Uniformity U₀</span><b id="m-u0"></b><small id="m-u0n"></small></div>
          <div class="mt"><span>Min / max</span><b id="m-min"></b><small>lux in task area</small></div>
          <div class="mt"><span>Colour</span><b id="m-cct"></b><small>Planckian locus</small></div>
          <div class="mt"><span>Installed</span><b id="m-w"></b><small id="m-wm2"></small></div>
          <div class="mt"><span>Efficacy</span><b id="m-eff"></b><small id="m-flux"></small></div>
          <div class="mt"><span>Running</span><b id="m-kwh"></b><small id="m-cost"></small></div>
        </div>
      </div>
      <aside class="st-panel" id="st-panel"></aside>
    </div></section>
    <section class="st-sci">
      <div class="st-card"><span class="eyebrow">Plan · lux at work plane</span><canvas id="st-plan" aria-label="Plan view with lux values"></canvas><div class="st-legend" id="st-legend"></div><p class="st-cap">Values are maintained lux on a 44 × 36 grid. Dashed line: 0.5 m edge zone excluded from U₀ and the average (EN 12464-1 convention).</p></div>
      <div class="st-card"><span class="eyebrow">Luminous intensity distribution</span><canvas id="st-polar" aria-label="Polar distribution"></canvas><p class="st-cap" id="st-lidnote"></p></div>
      <div class="st-card st-prov"><span class="eyebrow">What is real, what is modelled</span><table id="st-prov"></table></div>
      <div class="st-card st-method"><span class="eyebrow">Method</span>
        <ol><li><b>Colour.</b> CCT → CIE xy on the Planckian locus (Kang et al. 2002) → linear sRGB with luminance fixed at 1, so changing colour never changes lumens.</li>
        <li><b>Direct light.</b> Each luminaire is a candela-per-lumen distribution; illuminance at any point is E = I(θ)·cosφ / d², summed over luminaires (linear strips are 25 cm segments).</li>
        <li><b>Inter-reflection.</b> First-bounce flux on ceiling, walls and floor is found by sampling the distribution; E<sub>ir</sub> = Σρᵢ Φᵢ / (A(1−ρ̄)). The 3D view uses the same numbers.</li>
        <li><b>Rendering.</b> Lights are in physical units (lumens → candela, nits). Exposure is fixed so a white diffuser at 200 lx = display white; the EV control is a camera setting, not a brightness cheat.</li>
        <li><b>Not modelled.</b> Furniture occlusion in the metrics, daylight, glare (UGR), colour rendering. The engine is unit-tested for inverse-square, cosine, energy conservation and the integrating-sphere limit.</li></ol></div>
    </section>`;
  }

  function renderPanel() {
    root.querySelector('#st-panel').innerHTML = controlsHTML();
    root.querySelector('#st-fixrow').innerHTML = STUDIO_IDS.map(id => { const a = byId(id); return `<button class="st-fix ${id === S.pid ? 'active' : ''}" data-a="prod" data-id="${id}"><span class="th">${imgTag(a)}</span><span><b>${esc(a.name.replace(/^Wi-Fi |^Smart Wi-Fi /, ''))}</b><small>${esc(a.cls)}</small></span></button>`; }).join('');
    bindRanges(); provTable();
  }
  function provTable() {
    const s = st(), sp = spec(); const rows = [
      ['Luminous flux', `${fmt(sp.flux)} lm / unit`, S.ies && S.ies.ratedFlux ? 'ies' : S.fluxOverride != null ? 'user' : s.flux.s],
      ['Power', `${fmt(sp.watts)} W / unit`, s.watts.s], ['CCT', s.kind === 'variant' ? `${sp.cct} K (by colour name)` : s.cct ? (s.cct.min === s.cct.max ? s.cct.def + ' K' : s.cct.min + '–' + s.cct.max + ' K') : 'RGB only', s.kind === 'variant' ? 'assumed' : s.cct ? s.cct.s : 'na'],
      ['CRI / colour rendering', 'Not on listing', 'na'], ['Distribution', S.ies ? 'IES file' : (lidFor().name), S.ies ? 'ies' : 'model'], ['Reflectances', `ceiling ${FINISHES[S.finish].ceil} · wall ${FINISHES[S.finish].wall} · floor ${FINISHES[S.finish].floor}`, 'assumed'],
      ['Maintenance factor', S.mf.toFixed(2), 'assumed'], ['Room geometry', `${room().W} × ${room().D} × ${room().H} m`, 'model']];
    root.querySelector('#st-prov').innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${esc(r[1])}</td><td>${chip(r[2])}</td></tr>`).join('') + `<tr class="foot"><td colspan="3">“Assumed” = class-typical placeholder because the public listing does not state it. Signify's datasheet or IES file replaces it in one field above, and every metric re-calculates.</td></tr>`;
  }
  function bindRanges() { /* inputs handled by delegated listeners on root */ }

  function setPreset(name) { const p = PRESETS[name]; if (!p) return; S.preset = name; S.mode = p.mode; S.dim = p.dim; if (p.cct) S.cct = Math.min(st().cct?.max || 6500, Math.max(st().cct?.min || 2700, p.cct)); if (p.color) S.color = p.color; }
  function fullRefresh() { renderPanel(); buildLights(); const b = root.querySelector('[data-a="off"]'); if (b) { b.textContent = S.lightsOn ? 'Lights on' : 'Lights off'; b.classList.toggle('active', !S.lightsOn); } }
  function lightRefresh() { applyState(true); }

  root.addEventListener('click', e => {
    const el = e.target.closest('[data-a]'); if (!el) return; const a = el.dataset.a, id = el.dataset.id;
    if (a === 'prod') { S.pid = id; const s = st(); S.count = 1; S.fluxOverride = null; S.ies = null; if (s.cct) S.cct = Math.min(s.cct.max, Math.max(s.cct.min, S.cct || s.cct.def)); if (s.cct) S.cct = s.cct.def; S.mode = 'white'; S.preset = (s.presets || [])[0] || ''; if (s.presets) setPreset(s.presets[0]); if (s.kind === 'variant') { S.vw = 12; S.vc = 'Natural white'; } fullRefresh(); }
    else if (a === 'room') { S.room = id; S.act = 1; S.planeH = id === 'Kitchen' ? .9 : .75; buildRoom(); fullRefresh(); }
    else if (a === 'preset') { setPreset(id); renderPanel(); lightRefresh(); }
    else if (a === 'mode') { S.mode = id; S.preset = ''; renderPanel(); lightRefresh(); }
    else if (a === 'color') { S.color = id; S.preset = ''; S.mode = 'color'; renderPanel(); lightRefresh(); }
    else if (a === 'finish') { S.finish = id; buildRoom(); renderPanel(); buildLights(); }
    else if (a === 'n+') { S.count = Math.min(st().mount === 'ceiling' ? 24 : 8, S.count + 1); renderPanel(); buildLights(); }
    else if (a === 'n-') { S.count = Math.max(1, S.count - 1); renderPanel(); buildLights(); }
    else if (a === 'vw') { S.vw = +id; if (!prod().variants.some(v => v.w === S.vw && v.c === S.vc)) S.vc = prod().variants.find(v => v.w === S.vw).c; renderPanel(); buildLights(); }
    else if (a === 'vc') { S.vc = id; renderPanel(); lightRefresh(); }
    else if (a === 'adv') { S.adv = !S.adv; renderPanel(); lightRefresh(); }
    else if (a === 'plane') { S.planeH = +id; meterPlane.constant = -S.planeH; renderPanel(); lightRefresh(); }
    else if (a === 'fluxreset') { S.fluxOverride = null; renderPanel(); buildLights(); }
    else if (a === 'iesclear') { S.ies = null; renderPanel(); buildLights(); }
    else if (a === 'off') { S.lightsOn = !S.lightsOn; el.textContent = S.lightsOn ? 'Lights on' : 'Lights off'; el.classList.toggle('active', !S.lightsOn); lightRefresh(); }
    else if (a === 'overlay') { S.overlay = !S.overlay; el.classList.toggle('active', S.overlay); updateOverlay(); }
    else if (a === 'view') { setView(S.view === 'plan' ? 'persp' : 'plan'); el.textContent = S.view === 'plan' ? 'Perspective' : 'Plan view'; el.classList.toggle('active', S.view === 'plan'); }
    else if (a === 'shot') { renderer.domElement.toBlob(b => { const u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = `light-studio-${S.room}-${S.pid}.png`.replace(/\s/g, '-'); l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); }); }
    else if (a === 'add') { ctx.onAdd?.(S.pid, S.count); }
  });
  root.addEventListener('input', e => {
    const t = e.target, v = t.value;
    if (t.id === 'i-dim') { S.dim = +v; S.preset = ''; root.querySelector('#o-dim').textContent = v + '%'; lightRefresh(); }
    else if (t.id === 'i-cct') { S.cct = +v; S.preset = ''; root.querySelector('#o-cct').textContent = v + ' K'; lightRefresh(); }
    else if (t.id === 'i-col') { S.color = v; S.mode = 'color'; S.preset = ''; lightRefresh(); }
    else if (t.id === 'i-mf') { S.mf = +v; root.querySelector('#o-mf').textContent = (+v).toFixed(2); lightRefresh(); provTable(); }
    else if (t.id === 'i-ev') { S.ev = +v; root.querySelector('#o-ev').textContent = (S.ev > 0 ? '+' : '') + S.ev.toFixed(1) + ' EV'; applyState(false); }
    else if (t.id === 'i-flux') { S.fluxOverride = v === '' ? null : Math.max(10, +v); buildLights(); provTable(); }
    else if (t.id === 'i-hours') { S.hours = +v; updateMetrics(); } else if (t.id === 'i-tariff') { S.tariff = +v; updateMetrics(); }
  });
  root.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'i-act') { S.act = +t.value; updateOverlay(); updateMetrics(); drawPlan(); }
    else if (t.id === 'i-ies' && t.files[0]) { t.files[0].text().then(tx => { try { S.ies = P.parseIES(tx); if (S.ies.ratedFlux) S.fluxOverride = S.ies.ratedFlux; renderPanel(); buildLights(); } catch (err) { const m = root.querySelector('#ies-msg'); if (m) m.textContent = 'Could not read file: ' + err.message; } }); }
  });

  /* ---------- boot ---------- */
  root.innerHTML = shell();
  meterEl = root.querySelector('#st-meter');
  if (st().presets) setPreset(st().presets[0]);
  initGL();
  renderPanel();
  if (canvasOK) { buildRoom(); buildLights(); } else { sol = null; /* numbers only */ S.view = 'persp'; lumsCache = layout(S.count, spec()); solve(); }
  setTimeout(() => { if (canvasOK && cam) setView(S.view, true); }, 60);
  window.__studio = { S, get sol() { return sol; }, solve, spec, metersAt };
  return { dispose() { alive = false; cancelAnimationFrame(raf); try { controls?.dispose(); composer?.dispose?.(); renderer?.dispose(); renderer?.forceContextLoss?.(); renderer?.domElement.remove(); } catch (e) { /* ignore */ } delete window.__studio; } };
}
