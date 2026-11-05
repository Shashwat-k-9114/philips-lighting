/*
 * Photometry engine for the Light Studio. Pure functions, SI units, no DOM, no three.js.
 *
 *  - Planckian locus (Kang et al. 2002, 1667-25000 K) -> CIE xy -> linear sRGB with Y normalised to 1,
 *    so that colour never changes luminous flux (photometric, not RGB, brightness).
 *  - Luminous intensity distributions (LIDs) stored as candela per lumen, normalised so that the
 *    integral over the sphere is exactly 1 lm/lm.  Lambertian, cos^n, omni and parsed IES (LM-63) supported.
 *  - Direct illuminance by the inverse-square cosine law summed over luminaires (exact for point sources,
 *    segment-sampled for linear sources).
 *  - Inter-reflected component by the integrating-sphere / total-flux method (IES zonal-cavity family):
 *       E_ir = sum(rho_i * Phi_i) / (A_total * (1 - rho_avg))
 *    where Phi_i is the first-bounce flux landing on surface class i, found by sampling the LID.
 */
export const PI = Math.PI;
const D2R = PI / 180;

/* ------------------------------ colour ------------------------------ */
export function cctToXY(T) {
  T = Math.min(25000, Math.max(1667, T));
  const t = 1e3 / T, t2 = t * t, t3 = t2 * t;
  const x = T <= 4000
    ? -0.2661239 * t3 - 0.2343589 * t2 + 0.8776956 * t + 0.179910
    : -3.0258469 * t3 + 2.1070379 * t2 + 0.2226347 * t + 0.240390;
  const x2 = x * x, x3 = x2 * x;
  const y = T <= 2222 ? -1.1063814 * x3 - 1.34811020 * x2 + 2.18555832 * x - 0.20219683
    : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867
    : 3.0817580 * x3 - 5.87338670 * x2 + 3.75112997 * x - 0.37001483;
  return [x, y];
}
/** xyY (Y=1) -> linear sRGB, negatives clipped, then renormalised so relative luminance is exactly 1 */
export function xyToLinearRGB(x, y) {
  const Y = 1, X = Y * x / y, Z = Y * (1 - x - y) / y;
  let r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  let g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
  let b = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [r / lum, g / lum, b / lum];
}
export const cctToLinearRGB = T => xyToLinearRGB(...cctToXY(T));
const srgbToLin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const linToSrgb = c => { c = Math.max(0, Math.min(1, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; };
export function hexToLinearRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = srgbToLin(((n >> 16) & 255) / 255), g = srgbToLin(((n >> 8) & 255) / 255), b = srgbToLin((n & 255) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b || 1;
  return [r / lum, g / lum, b / lum];
}
/** display sRGB hex for a CCT swatch, at constant brightness (for UI) */
export function cctToHex(T) {
  const [r, g, b] = cctToLinearRGB(T), m = Math.max(r, g, b);
  const h = v => Math.round(linToSrgb(v / m) * 255).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}

/* ------------------------------ LIDs (cd per lumen) ------------------------------ */
export const lidLambert = (cutoffDeg = 90) => {
  const c = Math.cos(cutoffDeg * D2R), k = 1 / (PI * (1 - c * c));
  return { name: 'Lambertian (cosine)', I: th => (th <= cutoffDeg * D2R ? k * Math.cos(th) : 0) };
};
export const lidCosN = n => ({ name: 'cos^' + n, I: th => (th < PI / 2 ? ((n + 1) / (2 * PI)) * Math.pow(Math.cos(th), n) : 0) });
export const lidOmni = () => ({ name: 'Omnidirectional', I: () => 1 / (4 * PI) });

/** Parse IES LM-63 (photometric type C). Returns LID in cd/lm (horizontal planes averaged) plus metadata. */
export function parseIES(text) {
  const lines = text.split(/\r?\n/);
  let i = lines.findIndex(l => /^TILT=/i.test(l.trim()));
  if (i < 0) throw new Error('Not an IES file: TILT line missing');
  if (/INCLUDE/i.test(lines[i])) throw new Error('TILT=INCLUDE not supported');
  const nums = lines.slice(i + 1).join(' ').split(/[\s,]+/).filter(Boolean).map(Number);
  let p = 0;
  const lamps = nums[p++], lmPerLamp = nums[p++], mult = nums[p++], nV = nums[p++], nH = nums[p++], ptype = nums[p++];
  p += 4; /* units, width, length, height */ p += 2; /* ballast factor, future use */ const watts = nums[p]; p += 1; /* input watts */
  if (ptype !== 1) throw new Error('Only photometric type C is supported');
  const vAng = nums.slice(p, p + nV); p += nV;
  const hAng = nums.slice(p, p + nH); p += nH;
  const cd = [];
  for (let h = 0; h < nH; h++) { cd.push(nums.slice(p, p + nV).map(v => v * mult)); p += nV; }
  const avg = vAng.map((_, v) => cd.reduce((s, row) => s + row[v], 0) / nH);
  const I_abs = th => {
    const d = th / D2R;
    if (d <= vAng[0]) return d < vAng[0] - 1e-9 ? 0 : avg[0];
    if (d >= vAng[nV - 1]) return avg[nV - 1];
    let k = 1; while (vAng[k] < d) k++;
    const t = (d - vAng[k - 1]) / (vAng[k] - vAng[k - 1]);
    return avg[k - 1] * (1 - t) + avg[k] * t;
  };
  let flux = 0; const N = 720;
  for (let k = 0; k < N; k++) { const th = (k + 0.5) / N * PI; flux += I_abs(th) * Math.sin(th) * (PI / N) * 2 * PI; }
  return { name: 'IES file', I: th => (flux > 0 ? I_abs(th) / flux : 0), integratedFlux: flux, ratedFlux: lmPerLamp > 0 ? lamps * lmPerLamp : null, watts, nH, nV, peak_cd: Math.max(...avg) };
}
/** full beam angle (FWHM) of a LID in degrees */
export function beamAngle(lid) {
  const peak = Math.max(...Array.from({ length: 181 }, (_, d) => lid.I(d * D2R)));
  let d = 0; while (d < 180 && lid.I(d * D2R) >= peak / 2) d++;
  return Math.min(180, 2 * d);
}

/* ------------------------------ geometry helpers ------------------------------ */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Luminaire: {pos:[x,y,z] (y up), axis:[..] unit optical axis, flux (lm), lid} */
export function directE(L, p) {
  const vx = p[0] - L.pos[0], vy = p[1] - L.pos[1], vz = p[2] - L.pos[2];
  const d2 = vx * vx + vy * vy + vz * vz; if (d2 < 1e-6) return 0;
  const d = Math.sqrt(d2);
  const cosTh = (L.axis[0] * vx + L.axis[1] * vy + L.axis[2] * vz) / d;
  const th = Math.acos(Math.max(-1, Math.min(1, cosTh)));
  const cosPhi = -vy / d; /* horizontal receiving plane, normal up */
  if (cosPhi <= 0) return 0;
  return L.flux * L.lid.I(th) * cosPhi / d2;
}

/** first-bounce flux landing on ceiling / floor / walls, by sampling the LID over the sphere */
export function surfaceFlux(L, room, N = 1200) {
  const { W, D, H } = room; const out = { ceil: 0, floor: 0, wall: 0 };
  const a = L.axis; const ref = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(a, ref)), v = cross(a, u); const dOm = 4 * PI / N;
  const ga = PI * (3 - Math.sqrt(5));
  for (let k = 0; k < N; k++) {
    const cz = 1 - 2 * (k + 0.5) / N, sz = Math.sqrt(1 - cz * cz), ph = k * ga;
    const th = Math.acos(cz); const w = L.flux * L.lid.I(th) * dOm; if (w <= 0) continue;
    const dir = [0, 1, 2].map(i => a[i] * cz + sz * (u[i] * Math.cos(ph) + v[i] * Math.sin(ph)));
    let t = Infinity, face = '';
    const tx = dir[0] > 1e-9 ? (W - L.pos[0]) / dir[0] : dir[0] < -1e-9 ? -L.pos[0] / dir[0] : Infinity;
    const ty = dir[1] > 1e-9 ? (H - L.pos[1]) / dir[1] : dir[1] < -1e-9 ? -L.pos[1] / dir[1] : Infinity;
    const tz = dir[2] > 1e-9 ? (D - L.pos[2]) / dir[2] : dir[2] < -1e-9 ? -L.pos[2] / dir[2] : Infinity;
    if (ty <= tx && ty <= tz) { t = ty; face = dir[1] > 0 ? 'ceil' : 'floor'; } else { t = Math.min(tx, tz); face = 'wall'; }
    if (isFinite(t)) out[face] += w;
  }
  return out;
}

/**
 * Whole-room photometric solution.
 * room: {W,D,H, planeH, rho:{ceil,wall,floor}}, luminaires: [...], mf: maintenance factor, grid:[nx,nz]
 */
export function solveRoom(room, luminaires, { mf = 0.8, nx = 40, nz = 32, border = 0.5 } = {}) {
  const { W, D, H, planeH, rho } = room;
  const At = 2 * (W * D) + 2 * H * (W + D);
  const rhoAvg = (rho.ceil * W * D + rho.floor * W * D + rho.wall * 2 * H * (W + D)) / At;
  let total = 0, rIn = 0;
  for (const L of luminaires) {
    total += L.flux; const s = surfaceFlux(L, room);
    rIn += s.ceil * rho.ceil + s.floor * rho.floor + s.wall * rho.wall;
  }
  const Eir = rIn / (At * (1 - rhoAvg));
  const grid = new Float32Array(nx * nz); let sum = 0, min = Infinity, max = 0, cnt = 0, dsum = 0;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const p = [(i + 0.5) / nx * W, planeH, (j + 0.5) / nz * D]; let e = 0;
    for (const L of luminaires) e += directE(L, p);
    const tot = (e + Eir) * mf; grid[j * nx + i] = tot;
    const inTask = p[0] > border && p[0] < W - border && p[2] > border && p[2] < D - border;
    if (inTask) { sum += tot; dsum += e * mf; cnt++; if (tot < min) min = tot; if (tot > max) max = tot; }
  }
  if (!cnt) { min = 0; }
  const Eavg = cnt ? sum / cnt : 0;
  return { Eavg, Emin: min, Emax: max, U0: Eavg > 0 ? min / Eavg : 0, Edirect: cnt ? dsum / cnt : 0, Eir: Eir * mf, grid, nx, nz, totalFlux: total, rhoAvg, At,
    UF: total > 0 ? (Eavg / mf) * (W * D) / total : 0 };
}
export const eAt = (room, luminaires, Eir, p, mf = 0.8) => { let e = Eir / mf; for (const L of luminaires) e += directE(L, p); return e * mf; };

/** Room index K = L*W / (Hm (L+W)), Hm = mounting height above work plane (CIBSE/IES) */
export const roomIndex = (W, D, H, planeH) => (W * D) / ((H - planeH) * (W + D));

/** lumen-method estimate N = E*A / (Phi*UF*MF) -> how many luminaires to hit a target */
export const fixturesNeeded = (target, A, flux, UF, mf = 0.8) => Math.ceil((target * A) / (flux * UF * mf));
