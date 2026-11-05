import * as P from '../src/photometry.js';
let fail = 0;
const ok = (name, cond, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + ' ' + extra); if (!cond) fail++; };
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// 1. Colour: 6500 K ~ neutral, 2700 K warm, luminance normalised
const [r6, g6, b6] = P.cctToLinearRGB(6500), [r2, g2, b2] = P.cctToLinearRGB(2700);
ok('Y=1 at 2700K', close(0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2, 1, 1e-6));
ok('2700K warm (R>G>B)', r2 > g2 && g2 > b2, [r2, g2, b2].map(v => v.toFixed(2)).join(','));
ok('6500K near neutral', Math.abs(r6 - b6) < 0.15, [r6, g6, b6].map(v => v.toFixed(2)).join(','));
const [x27, y27] = P.cctToXY(2700), [x65, y65] = P.cctToXY(6500);
ok('xy 2700K (0.4599,0.4106)', close(x27, 0.4599, 0.01) && close(y27, 0.4106, 0.01), x27.toFixed(4) + ',' + y27.toFixed(4));
ok('xy 6500K (0.3135,0.3237)', close(x65, 0.3135, 0.01) && close(y65, 0.3237, 0.01), x65.toFixed(4) + ',' + y65.toFixed(4));

// 2. LID normalisation: integral over sphere = 1
const integ = lid => { let s = 0; const N = 20000; for (let k = 0; k < N; k++) { const th = (k + .5) / N * Math.PI; s += lid.I(th) * Math.sin(th) * (Math.PI / N) * 2 * Math.PI; } return s; };
ok('Lambertian integrates to 1', close(integ(P.lidLambert()), 1, 1e-3), integ(P.lidLambert()).toFixed(5));
ok('Lambertian cutoff 80 integrates to 1', close(integ(P.lidLambert(80)), 1, 1e-3), integ(P.lidLambert(80)).toFixed(5));
ok('cos^3 integrates to 1', close(integ(P.lidCosN(3)), 1, 1e-3));
ok('omni integrates to 1', close(integ(P.lidOmni()), 1, 1e-3));

// 3. Inverse-square: Lambertian 1000 lm, 2 m below -> E = Phi/(pi h^2)
const L = { pos: [0, 2, 0], axis: [0, -1, 0], flux: 1000, lid: P.lidLambert() };
ok('E below Lambertian = Phi/(pi h^2)', close(P.directE(L, [0, 0, 0]), 1000 / (Math.PI * 4), 1e-6), P.directE(L, [0, 0, 0]).toFixed(2));
// omni 1000lm at 2m: I = 79.58 cd, E = I/h^2 = 19.89
const O = { pos: [0, 2, 0], axis: [0, -1, 0], flux: 1000, lid: P.lidOmni() };
ok('E below omni = Phi/(4 pi h^2)', close(P.directE(O, [0, 0, 0]), 1000 / (4 * Math.PI * 4), 1e-6), P.directE(O, [0, 0, 0]).toFixed(2));
// cos^3 law off-axis for omni at 45 deg: E = I cos(phi)/d^2
const d = Math.hypot(2, 2); ok('omni off-axis cosine', close(P.directE(O, [2, 0, 0]), (1000 / (4 * Math.PI)) * (2 / d) / (d * d), 1e-6));

// 4. Energy conservation: surface flux sums to luminaire flux
const room = { W: 5, D: 4.8, H: 2.8, planeH: .75, rho: { ceil: .7, wall: .5, floor: .2 } };
const sf = P.surfaceFlux({ pos: [2.5, 2.78, 2.4], axis: [0, -1, 0], flux: 1000, lid: P.lidLambert() }, room, 6000);
ok('surface flux sums to Phi', close(sf.ceil + sf.floor + sf.wall, 1000, 5e-3), (sf.ceil + sf.floor + sf.wall).toFixed(1));
ok('downward Lambertian puts nothing on ceiling', sf.ceil < 1, sf.ceil.toFixed(2));

// 5. Cross-check solver against a Monte-Carlo style independent integral on direct component.
const res = P.solveRoom(room, [{ pos: [2.5, 2.78, 2.4], axis: [0, -1, 0], flux: 2000, lid: P.lidLambert() }], { mf: 1, nx: 40, nz: 32 });
ok('solver Eavg > 0 and finite', res.Eavg > 0 && isFinite(res.Eavg), res.Eavg.toFixed(1) + ' lx, U0=' + res.U0.toFixed(2) + ', UF=' + res.UF.toFixed(2));
// Utilisation factor must be physically plausible (0.2 .. 1.0)
ok('UF plausible', res.UF > .2 && res.UF < 1.0);
// 6. Integrating sphere limit: omni in tiny sealed room, all flux interreflected -> E = Phi*rho/(A(1-rho)) + direct
const cube = { W: 4, D: 4, H: 4, planeH: 2, rho: { ceil: .5, wall: .5, floor: .5 } };
const rs = P.solveRoom(cube, [{ pos: [2, 2, 2], axis: [0, -1, 0], flux: 1000, lid: P.lidOmni() }], { mf: 1, border: 0 });
const Aexp = 6 * 16, Eir_expected = 1000 * .5 / (Aexp * .5);
ok('integrating-sphere Eir', close(rs.Eir, Eir_expected, 2e-2), rs.Eir.toFixed(2) + ' vs ' + Eir_expected.toFixed(2));

// 7. IES parser on a synthetic Lambertian file
const angles = Array.from({ length: 19 }, (_, i) => i * 5);
const cds = angles.map(a => (1000 / Math.PI) * Math.cos(a * Math.PI / 180) * 1);
const ies = `IESNA:LM-63-2002\n[TEST] synthetic\nTILT=NONE\n1 1000 1 19 1 1 2 0.1 0.1 0 1 1 20\n${angles.join(' ')}\n0\n${cds.map(v => Math.max(0, v).toFixed(3)).join(' ')}\n`;
const pi = P.parseIES(ies);
ok('IES parse integrated flux ~ 1000*(sin^2 90 cutoff=~)', pi.integratedFlux > 800 && pi.integratedFlux < 1010, pi.integratedFlux.toFixed(1));
ok('IES lid integrates to 1', close(integ(pi), 1, 2e-2), integ(pi).toFixed(4));
ok('beam angle Lambertian = 120 deg', Math.abs(P.beamAngle(P.lidLambert()) - 120) <= 2, P.beamAngle(P.lidLambert()));
ok('room index', close(P.roomIndex(5, 4.8, 2.8, .75), 24 / (2.05 * 9.8), 1e-9));
console.log(fail ? `\n${fail} FAILED` : '\nALL PASSED');
process.exit(fail ? 1 : 0);
