/* Procedural artwork: category icons, fixture illustrations, wave dividers, article covers. No external assets. */
const S = (b, w = 64) => `<svg class="cat-ic" viewBox="0 0 64 64" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
const ICONS = {
  chandelier: '<path d="M32 4v10M32 14c-14 0-20 8-22 14M32 14c14 0 20 8 22 14M32 14v14"/><path d="M8 28h48"/><path d="M12 28v6M22 28v6M32 28v6M42 28v6M52 28v6" /><circle cx="12" cy="38" r="2.5"/><circle cx="22" cy="38" r="2.5"/><circle cx="32" cy="38" r="2.5"/><circle cx="42" cy="38" r="2.5"/><circle cx="52" cy="38" r="2.5"/><path d="M26 46h12l-6 12z"/>',
  pendant: '<path d="M32 4v22"/><path d="M14 48c0-12 8-22 18-22s18 10 18 22z"/><path d="M26 54c3 3 9 3 12 0"/>',
  orb: '<circle cx="32" cy="32" r="14"/><path d="M32 4v14M32 46v14M4 32h14M46 32h14M12 12l10 10M42 42l10 10M52 12L42 22M22 42L12 52"/>',
  panel: '<rect x="6" y="18" width="52" height="10" rx="5"/><path d="M14 36l-6 12M32 36v14M50 36l6 12" stroke-dasharray="1 5"/>',
  bulb: '<path d="M22 40c-6-4-8-9-8-14a18 18 0 0 1 36 0c0 5-2 10-8 14v6H22z"/><path d="M24 52h16M27 58h10M28 24l4 8 4-8"/>',
  tube: '<rect x="4" y="26" width="56" height="12" rx="6"/><path d="M12 32h40" stroke-dasharray="2 4"/><path d="M10 14v8M54 14v8"/>',
  track: '<path d="M6 12h52"/><path d="M16 12v10l-6 14h12l-6-14M32 12v10l-6 14h12l-6-14M48 12v10l-6 14h12l-6-14"/><path d="M8 50c8-4 16-4 24 0s16 4 24 0" stroke-dasharray="1 4"/>',
  smart: '<path d="M22 40c-6-4-8-9-8-14a18 18 0 0 1 36 0c0 5-2 10-8 14v6H22z"/><path d="M26 56c4-3 8-3 12 0M22 50c6-5 14-5 20 0" /><path d="M28 24c2-3 6-3 8 0"/>',
  strip: '<path d="M4 44c10-18 18 8 28-10s18 8 28-10"/><circle cx="12" cy="36" r="1.5"/><circle cx="22" cy="44" r="1.5"/><circle cx="32" cy="34" r="1.5"/><circle cx="44" cy="28" r="1.5"/><circle cx="54" cy="24" r="1.5"/>',
  string: '<path d="M4 14c14 14 42 14 56 0"/><circle cx="12" cy="24" r="3"/><circle cx="22" cy="30" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="42" cy="30" r="3"/><circle cx="52" cy="24" r="3"/>',
  wall: '<rect x="6" y="6" width="12" height="52" rx="2"/><path d="M18 24h14a10 10 0 0 1 10 10v6H28a10 10 0 0 1-10-10z"/><path d="M48 30l8-4M50 38h8M48 46l8 4"/>',
  picture: '<rect x="8" y="24" width="48" height="30" rx="2"/><path d="M14 46l10-10 8 8 8-12 10 14"/><path d="M12 10h40M32 10v10" /><path d="M18 14l-2 6M46 14l2 6"/>',
  mirror: '<rect x="14" y="14" width="36" height="42" rx="18"/><path d="M8 8h48"/><path d="M20 8v6M32 8v6M44 8v6"/>',
  table: '<path d="M20 12h24l8 22H12z"/><path d="M32 34v16M22 54h20"/>',
  floor: '<path d="M22 8h20l6 16H16z"/><path d="M32 24v32M20 58h24"/>',
  bedside: '<rect x="12" y="38" width="40" height="18" rx="2"/><path d="M12 46h40"/><path d="M24 12h16l5 14H19z"/><path d="M32 26v12"/>',
  outdoor: '<path d="M32 6v10M22 16h20l-4 10H26z"/><path d="M32 26v32M26 58h12"/><path d="M12 22l4 2M52 22l-4 2M10 32h6M48 32h6" stroke-dasharray="1 3"/>',
  solar: '<circle cx="20" cy="18" r="7"/><path d="M20 4v4M6 18h4M10 8l3 3M30 8l-3 3"/><path d="M26 34h30l-6 14H20z"/><path d="M35 34l-4 14M45 34l-2 14M23 41h30"/>',
  emergency: '<rect x="8" y="22" width="48" height="20" rx="4"/><path d="M32 28v8M28 32h8"/><path d="M14 14l6 6M50 14l-6 6M32 8v8" /><circle cx="16" cy="32" r="2"/><circle cx="48" cy="32" r="2"/>'
};
export const catIcon = (id, w = 64) => S(ICONS[id] || ICONS.bulb, w);

/* generic fixture illustration used where the official listing image is not bundled */
export function fixtureArt(kind = 'panel', hue = 38) {
  const glow = `<defs><radialGradient id="g${kind}${hue}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="hsl(${hue},95%,72%)" stop-opacity=".95"/><stop offset="1" stop-color="hsl(${hue},95%,60%)" stop-opacity="0"/></radialGradient></defs>`;
  const body = {
    chandelier: `<g stroke="#8a93a0" stroke-width="2" fill="none"><path d="M100 10v30M100 40c-40 0-60 30-64 50M100 40c40 0 60 30 64 50M100 40v50"/><path d="M30 90h140"/></g>${[36, 68, 100, 132, 164].map(x => `<circle cx="${x}" cy="108" r="26" fill="url(#g${kind}${hue})"/><circle cx="${x}" cy="108" r="6" fill="#fff6e0"/>`).join('')}`,
    wall: `<rect x="40" y="30" width="16" height="140" rx="3" fill="#cfd6dd"/><path d="M56 80h40a30 30 0 0 1 30 30v20H86a30 30 0 0 1-30-30z" fill="#e8ecef" stroke="#aab3bb"/><circle cx="130" cy="95" r="50" fill="url(#g${kind}${hue})"/>`,
    panel: `<rect x="30" y="70" width="140" height="26" rx="13" fill="#eef1f3" stroke="#b8c0c7"/><ellipse cx="100" cy="140" rx="70" ry="42" fill="url(#g${kind}${hue})"/>`
  }[kind] || '';
  return `<svg viewBox="0 0 200 200" class="fixture-art" role="img" aria-label="Illustrative fixture">${glow}${body}</svg>`;
}

/* animated wave divider: two phase-shifted sine layers, CSS-translated */
export function wave(fill, { amp = 26, per = 3, h = 120, flip = false, cls = '' } = {}) {
  per = Math.max(1, Math.round(per)); const W = 1440, pts = 64;
  const path = ph => { let d = `M0 ${h}`; for (let i = 0; i <= pts * 2; i++) { const x = i / pts * W; const y = h / 2 + Math.sin(i / pts * Math.PI * 2 * per + ph) * amp + Math.sin(i / pts * Math.PI * 2 * per * 2 + ph * 1.7) * amp * .22; d += `L${x.toFixed(1)} ${y.toFixed(1)}`; } return d + `L${W * 2} ${h}Z`; };
  return `<div class="wave ${flip ? 'flip' : ''} ${cls}" aria-hidden="true"><svg viewBox="0 0 ${W} ${h}" preserveAspectRatio="none"><g class="w1"><path d="${path(0)}" fill="${fill}" opacity=".42"/></g><g class="w2"><path d="${path(2)}" fill="${fill}" opacity=".7"/></g><g class="w3"><path d="${path(4)}" fill="${fill}"/></g></svg></div>`;
}

/* flowing generative cover for articles / social tiles */
export function flowArt(hue, seed = 1) {
  const r = n => { const x = Math.sin(seed * 999 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
  let paths = '';
  for (let k = 0; k < 6; k++) {
    const y = 40 + k * 28 + r(k) * 20, a = 18 + r(k + 9) * 34, f = 1 + r(k + 3) * 2;
    let d = `M-10 ${y}`; for (let i = 0; i <= 24; i++) { const x = i / 24 * 420 - 10; d += `L${x.toFixed(1)} ${(y + Math.sin(i / 24 * Math.PI * f + k) * a).toFixed(1)}`; }
    paths += `<path d="${d}" stroke="hsl(${(hue + k * 14) % 360},90%,${64 + k * 3}%)" stroke-width="${3 + r(k) * 9}" fill="none" stroke-linecap="round" opacity="${.35 + r(k + 5) * .5}"/>`;
  }
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" class="flow-art" aria-hidden="true"><defs><linearGradient id="fa${seed}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,14%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},60%,8%)"/></linearGradient><filter id="fb${seed}"><feGaussianBlur stdDeviation="2.2"/></filter></defs><rect width="400" height="260" fill="url(#fa${seed})"/><g filter="url(#fb${seed})">${paths}</g></svg>`;
}

export const socialIcon = n => ({
  Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  Facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  X: '<path d="M4 4l16 16M20 4L4 20"/>',
  YouTube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l5-2.5z"/>',
  WhatsApp: '<path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7z"/><path d="M9 9c0 3 3 6 6 6l1.2-1.6-2-1-1 .6c-1-.4-2-1.4-2.4-2.4l.6-1-1-2z"/>'
}[n] || '');
