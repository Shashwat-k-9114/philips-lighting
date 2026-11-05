import * as THREE from 'three';

const NOISE = `
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+vec2(3.1,1.7); a*=.5; } return v; }`;

const bgMat = () => new THREE.ShaderMaterial({
  depthTest: false, depthWrite: false,
  uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(.7, .5) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
  fragmentShader: `precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uRes,uMouse; ${NOISE}
  void main(){
    vec2 uv=vUv*vec2(uRes.x/uRes.y,1.);
    vec2 q=vec2(fbm(uv*1.5+uTime*.045),fbm(uv*1.5+vec2(5.2,1.3)-uTime*.037));
    float f=fbm(uv*1.3+q*2.4+uTime*.025);
    vec3 c=mix(vec3(.018,.026,.05),vec3(.085,.06,.19),f);
    c+=vec3(.95,.5,.2)*pow(smoothstep(.52,1.,f),2.2)*.30;
    c+=vec3(.2,.55,.9)*pow(smoothstep(.55,.95,fbm(uv*1.1-q*1.7-uTime*.02)),3.)*.16;
    float m=exp(-length((vUv-uMouse)*vec2(uRes.x/uRes.y,1.))*3.0); c+=vec3(1.,.72,.45)*m*.10;
    float v=smoothstep(1.15,.2,length(vUv-.5)); c*=.55+.45*v;
    gl_FragColor=vec4(c,1.); }`
});

const ribbonMat = (seed, y, amp) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 }, uSeed: { value: seed }, uY: { value: y }, uAmp: { value: amp }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 } },
  vertexShader: `uniform float uTime,uSeed,uY,uAmp,uScroll; uniform vec2 uMouse; varying vec2 vUv; varying float vW;
  void main(){ vUv=uv; vec3 p=position; float t=uTime*.42+uSeed*6.2831; float x=p.x;
    float w=sin(x*.42+t)*1.15+sin(x*.9-t*1.3)*.42+sin(x*.17+t*.5)*1.7;
    w*=uAmp;
    p.y+=w+uY+uScroll*(1.2+uSeed*2.);
    p.z+=cos(x*.35+t*.8)*1.8+(uv.y-.5)*sin(x*.6+t)*1.5+uMouse.x*.8*sin(x*.2);
    p.y+=(uv.y-.5)*(1.1+.7*sin(x*.5+t));
    vW=w; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
  fragmentShader: `precision highp float; varying vec2 vUv; varying float vW; uniform float uTime,uSeed;
  vec3 pal(float t){ return .5+.5*cos(6.2831*(vec3(1.,1.,1.)*t+vec3(.0,.18,.45))); }
  void main(){ float e=1.-abs(vUv.y-.5)*2.; e=pow(max(e,0.),1.7);
    float ends=smoothstep(0.,.14,vUv.x)*smoothstep(1.,.86,vUv.x);
    vec3 c=pal(vUv.x*.9+uTime*.03+uSeed*.7); c=mix(c,vec3(1.,.72,.38),.38);
    float sheen=.55+.45*sin(vUv.x*22.-uTime*1.3+vW*2.);
    float a=e*ends*(.28+.5*sheen);
    gl_FragColor=vec4(c*a*1.35,a*.75); }`
});

function haloTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,240,205,1)'); gr.addColorStop(.18, 'rgba(255,196,120,.55)'); gr.addColorStop(.5, 'rgba(255,150,70,.12)'); gr.addColorStop(1, 'rgba(255,140,60,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function shadeMaterial(hue) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide, uniforms: { uCol: { value: new THREE.Color().setHSL(hue, .55, .55) }, uTime: { value: 0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); vP=position; gl_Position=projectionMatrix*mv; }',
    fragmentShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; uniform vec3 uCol; uniform float uTime;
    void main(){ vec3 n=normalize(vN); if(!gl_FrontFacing) n=-n;
      float d=max(dot(n,normalize(vec3(-.4,.6,.7))),0.); float rim=pow(1.-max(dot(n,vV),0.),2.6);
      float under=smoothstep(.1,-.5,n.y); /* warm light from the bulb inside shows on the underside */
      vec3 c=uCol*(.18+.7*d)+vec3(1.,.72,.4)*rim*.55+vec3(1.,.8,.5)*under*.7;
      c+=vec3(.9,.6,.3)*.04*sin(vP.y*40.+uTime);
      gl_FragColor=vec4(c,1.); }`
  });
}

function pendant(len, r, hue, tex) {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, len, 6), new THREE.MeshBasicMaterial({ color: 0x8892a0 })); cord.position.y = len / 2; g.add(cord);
  const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push(new THREE.Vector2(.03 + Math.sin(t * Math.PI * .5) * r, -t * r * .95 + (t > .9 ? 0 : 0))); }
  const shade = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), shadeMaterial(hue)); shade.position.y = 0; g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * .28, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.2, 2.2) })); bulb.position.y = -r * .72; g.add(bulb);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .95 }));
  halo.scale.setScalar(r * 6.2); halo.position.y = -r * .78; g.add(halo);
  g.userData = { halo, bulb };
  return g;
}

export function mountHero(host) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { host.classList.add('no-webgl'); return { dispose() {} }; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  host.appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(42, 1, .1, 100); cam.position.set(0, 0, 10);

  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat()); bg.frustumCulled = false; bg.renderOrder = -10; scene.add(bg);

  const ribbons = []; const rg = new THREE.PlaneGeometry(30, 3.4, 260, 22);
  [[0.0, -1.6, 1.0], [0.21, -.5, .85], [0.43, .5, 1.1], [0.66, 1.5, .8], [0.85, -2.5, .9]].forEach(([s, y, a], i) => {
    const m = new THREE.Mesh(rg, ribbonMat(s, y, a)); m.rotation.z = (i - 2) * .05; m.position.z = -2 - i * .35; m.frustumCulled = false; scene.add(m); ribbons.push(m);
  });

  const tex = haloTexture();
  const lamps = new THREE.Group(); scene.add(lamps);
  const defs = [[0, .5, 1.05, .08, 1.0], [2.05, 1.5, .72, .62, 1.5], [-2.0, 1.15, .6, .74, 1.8], [3.5, 2.0, .5, .94, 2.1]];
  const pend = defs.map(([x, y, r, hue, ph]) => { const p = pendant(9, r, hue, tex); p.position.set(x, y, 0); p.userData.ph = ph; p.userData.baseX = x; lamps.add(p); return p; });
  // concentric orbit rings around the hero lamp
  const rings = [1.9, 2.5, 3.2].map((r, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, .006 + i * .002, 8, 160), new THREE.MeshBasicMaterial({ color: [0xffc78a, 0x9d8bff, 0x6fe3ff][i], transparent: true, opacity: .55 - i * .1, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(0, -.25, -.4); m.rotation.set(1.1 + i * .3, i * .8, 0); lamps.add(m); return m; });
  // drifting light motes
  const N = 520, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 24; pos[i * 3 + 1] = (Math.random() - .5) * 14; pos[i * 3 + 2] = (Math.random() - .5) * 10 - 1; seed[i] = Math.random(); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const pm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float aSeed; uniform float uTime,uPx; varying float vA; void main(){ vec3 p=position; p.y+=mod(uTime*(.08+aSeed*.22)+aSeed*14.,14.)-7.; p.x+=sin(uTime*.2+aSeed*30.)*.6; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(1.2+aSeed*3.2)*uPx*(8./-mv.z); vA=.25+.75*aSeed; }`,
    fragmentShader: 'varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d)*vA; gl_FragColor=vec4(vec3(1.,.82,.55)*a,a); }' });
  const motes = new THREE.Points(pg, pm); motes.frustumCulled = false; scene.add(motes);

  const mouse = new THREE.Vector2(0, 0), mouseT = new THREE.Vector2(0, 0);
  const onMove = e => { const r = host.getBoundingClientRect(); mouseT.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)); };
  if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });

  const resize = () => {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    cam.aspect = w / h; cam.updateProjectionMatrix(); bg.material.uniforms.uRes.value.set(w, h);
    const wide = cam.aspect > 1.25; lamps.position.set(wide ? 3.3 : 0, wide ? 0 : 1.3, 0); lamps.scale.setScalar(wide ? 1 : .72);
  };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();

  let visible = true, raf = 0, t0 = performance.now(), last = 0;
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }); io.observe(host);
  const frame = now => {
    raf = requestAnimationFrame(frame); if (!visible || document.hidden) return;
    const t = reduced ? 3 + (now - t0) * 0.00005 : (now - t0) / 1000; const dt = Math.min(.05, (now - last) / 1000); last = now;
    mouse.lerp(mouseT, 1 - Math.pow(.001, dt || .016));
    const sc = Math.min(1, scrollY / Math.max(1, innerHeight));
    bg.material.uniforms.uTime.value = t; bg.material.uniforms.uMouse.value.set(mouse.x * .5 + .5, mouse.y * .5 + .5);
    ribbons.forEach(r => { const u = r.material.uniforms; u.uTime.value = t; u.uMouse.value.copy(mouse); u.uScroll.value = sc; });
    pm.uniforms.uTime.value = t;
    pend.forEach(p => { const ph = p.userData.ph; p.rotation.z = Math.sin(t * .55 + ph) * .06 + mouse.x * .05; p.position.x = p.userData.baseX + Math.sin(t * .4 + ph) * .08; p.userData.halo.material.opacity = .82 + .15 * Math.sin(t * 1.7 + ph * 3); p.children[1].material.uniforms.uTime.value = t; });
    rings.forEach((r, i) => { r.rotation.z += dt * (.12 + i * .06); r.rotation.x += dt * .05 * (i % 2 ? 1 : -1); });
    lamps.rotation.y = mouse.x * .22; lamps.rotation.x = -mouse.y * .08 - sc * .3;
    cam.position.x = mouse.x * .35; cam.position.y = mouse.y * .2 - sc * 1.2; cam.lookAt(0, -sc * 1.2, 0);
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);
  return {
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', onMove);
      scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(x => { x.map?.dispose?.(); x.dispose(); }); });
      renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove(); }
  };
}
