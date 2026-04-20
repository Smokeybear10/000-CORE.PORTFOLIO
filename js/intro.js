/* =============================================================
   INTRO CINEMATIC · "Table 01, Back Room"
   3D approach → camera sits down → deals cards → hands off to UI
   ============================================================= */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const FLAG = 'poker:introPlayed';
const DURATION = 11.5; // seconds

const overlay  = document.getElementById('intro-overlay');
const canvas   = document.getElementById('intro-canvas');
const skipBtn  = document.getElementById('intro-skip');
const rewindBtn = document.getElementById('intro-rewind');

let running = false, renderer, scene, camera, rafId, startTime, cards = [], chair, dealerArm, lampGlow;

const _urlParams = new URLSearchParams(location.search);
const _force = _urlParams.get('intro');
const hasPlayed = _force === 'skip' ? true : _force === 'force' ? false : localStorage.getItem(FLAG) === '1';
const isMobile  = window.innerWidth < 900 || window.matchMedia('(pointer:coarse)').matches;
const hasWebGL  = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
})();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Public handoff ---------- */
function finishIntro(immediate = false) {
  running = false;
  cancelAnimationFrame(rafId);
  document.body.classList.remove('intro-playing');
  localStorage.setItem(FLAG, '1');
  if (rewindBtn) rewindBtn.style.display = '';
  if (!overlay) { return dispatchComplete(); }
  if (immediate) {
    overlay.style.display = 'none';
    dispatchComplete();
  } else {
    overlay.classList.add('done');
    setTimeout(() => { overlay.style.display = 'none'; dispatchComplete(); cleanupScene(); }, 1200);
  }
}
function dispatchComplete() {
  window.dispatchEvent(new CustomEvent('poker:intro-complete'));
}

function cleanupScene() {
  if (renderer) { renderer.dispose(); renderer = null; }
  if (scene) {
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
      }
    });
    scene = null;
  }
}

/* ---------- Entry ---------- */
console.log('[intro] loaded', { hasPlayed, isMobile, hasWebGL, reduceMotion, url: location.href });
// Visible debug so we can see state without opening devtools
const dbg = document.createElement('div');
dbg.id = 'intro-debug';
dbg.style.cssText = 'position:fixed;top:8px;left:8px;background:#daa520;color:#000;font:11px ui-monospace,monospace;padding:8px 12px;z-index:9999;border-radius:4px;max-width:90vw;white-space:pre-wrap;';
function dbgLog(msg) { dbg.textContent += '\n' + msg; console.log('[intro]', msg); }
dbg.textContent = `[intro] overlay=${!!overlay} canvas=${!!canvas} hasPlayed=${hasPlayed} webgl=${hasWebGL} mobile=${isMobile} reduce=${reduceMotion} force=${_force||'none'}`;
document.body.appendChild(dbg);
window.addEventListener('error', e => dbgLog('WINDOW ERROR: ' + e.message));
window.addEventListener('unhandledrejection', e => dbgLog('UNHANDLED: ' + (e.reason?.message || e.reason)));
// Absolute failsafe: overlay never stays > 15s
setTimeout(() => { if (overlay && overlay.style.display !== 'none' && !overlay.classList.contains('done')) { console.warn('[intro] failsafe skip'); finishIntro(true); } }, 15000);
if (!overlay || !canvas) {
  console.warn('[intro] missing DOM, skipping');
  finishIntro(true);
} else if (hasPlayed || !hasWebGL) {
  console.log('[intro] skipping', { hasPlayed, hasWebGL });
  finishIntro(true);
} else {
  document.body.classList.add('intro-playing');
  dbgLog('calling startIntro()...');
  try {
    startIntro();
    dbgLog('startIntro returned OK, renderer=' + !!renderer + ' scene=' + !!scene);
  } catch (err) {
    dbgLog('STARTINTRO THREW: ' + err.message + ' @ ' + (err.stack||'').split('\n')[1]);
    console.error('[intro] init failed', err);
    // Leave overlay visible so we can see the error
  }
}

skipBtn?.addEventListener('click', () => finishIntro());
document.addEventListener('keydown', e => { if (e.key === 'Escape' && running) finishIntro(); });
// Click anywhere on the overlay also skips (safety net)
overlay?.addEventListener('click', e => {
  if (e.target.closest('#intro-skip, .intro-rewind')) return;
  if (running) finishIntro();
});

if (rewindBtn) {
  rewindBtn.style.display = hasPlayed ? '' : 'none';
  rewindBtn.addEventListener('click', () => {
    if (running || !overlay) return;
    overlay.style.display = '';
    overlay.classList.remove('done');
    document.body.classList.add('intro-playing');
    // Re-show title/tagline animations
    overlay.querySelectorAll('.intro-title, .intro-tagline').forEach(el => {
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    });
    startIntro();
  });
}

/* ---------- Scene ---------- */
function startIntro() {
  running = true;
  cards = [];

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a1808);
  scene.fog = new THREE.Fog(0x2a1808, 6, 22);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x2a1808);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 80);
  // Start INSIDE the room so we immediately see the lit table
  camera.position.set(0, 1.7, 7);
  camera.lookAt(0, 1.0, 0);

  buildLights();
  buildRoom();
  buildTable();
  buildChair();
  buildChipStack();
  buildDeckAndCards();
  buildSilhouette();

  startTime = performance.now();
  tick();
  window.addEventListener('resize', onResize);
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- Lights ---------- */
function buildLights() {
  // Pendant SpotLight on the table — casts real shadows
  const pendant = new THREE.SpotLight(0xffc67a, 6, 14, Math.PI/3.5, 0.5, 1.1);
  pendant.position.set(0, 2.5, 0);
  pendant.target.position.set(0, 0, 0);
  pendant.castShadow = true;
  pendant.shadow.mapSize.set(1024, 1024);
  pendant.shadow.bias = -0.001;
  pendant.shadow.radius = 4;
  scene.add(pendant);
  scene.add(pendant.target);

  // Bulb point light for falloff on nearby geometry
  const bulb = new THREE.PointLight(0xffa85c, 2.4, 5, 1.8);
  bulb.position.set(0, 2.25, 0);
  scene.add(bulb);

  // Window rim (cool contrast)
  const rimBlue = new THREE.DirectionalLight(0x6a9ad4, 0.5);
  rimBlue.position.set(-6, 4, -2);
  scene.add(rimBlue);

  // Hemisphere fill so nothing is pitch black
  const fill = new THREE.HemisphereLight(0xffd9a8, 0x2a1508, 0.5);
  scene.add(fill);

  // Gentle ambient safety
  const amb = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(amb);
}

// Canvas noise helper for felt + wood textures
function makeNoiseTexture(w=256, h=256, base=[15,60,45], variance=8) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * variance;
    img.data[i]   = Math.max(0, Math.min(255, base[0] + n));
    img.data[i+1] = Math.max(0, Math.min(255, base[1] + n));
    img.data[i+2] = Math.max(0, Math.min(255, base[2] + n));
    img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* ---------- Room ---------- */
function buildRoom() {
  const woodTex = makeNoiseTexture(256, 256, [50, 32, 18], 14);
  woodTex.repeat.set(6, 6);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodTex, roughness: 0.85 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Persian rug — round, deep red, with a border
  const rugMat = new THREE.MeshStandardMaterial({ color: 0x7a1e22, roughness: 1 });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.005;
  rug.receiveShadow = true;
  scene.add(rug);
  const rugBorder = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.7, 48), new THREE.MeshStandardMaterial({ color: 0xc4a055, roughness: 0.8, metalness: 0.2 }));
  rugBorder.rotation.x = -Math.PI / 2;
  rugBorder.position.y = 0.007;
  scene.add(rugBorder);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a2415, roughness: 1 });
  // Back wall
  const back = new THREE.Mesh(new THREE.PlaneGeometry(22, 7), wallMat);
  back.position.set(0, 3.5, -9);
  scene.add(back);
  // Left wall
  const left = new THREE.Mesh(new THREE.PlaneGeometry(22, 7), wallMat);
  left.position.set(-11, 3.5, 0);
  left.rotation.y = Math.PI / 2;
  scene.add(left);
  // Right wall
  const right = new THREE.Mesh(new THREE.PlaneGeometry(22, 7), wallMat);
  right.position.set(11, 3.5, 0);
  right.rotation.y = -Math.PI / 2;
  scene.add(right);
  // Ceiling
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0x0a0402, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 7;
  scene.add(ceil);

  // Window (glowing panel on back wall)
  const wind = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.9), new THREE.MeshBasicMaterial({ color: 0x2a456a }));
  wind.position.set(-5, 3.7, -8.98);
  scene.add(wind);
  // Window frame
  const windFrame = new THREE.Mesh(new THREE.PlaneGeometry(3.45, 2.15), new THREE.MeshStandardMaterial({ color: 0x120803, roughness: 1 }));
  windFrame.position.set(-5, 3.7, -8.99);
  scene.add(windFrame);
  // Window mullions
  const mul1 = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 1.9), new THREE.MeshStandardMaterial({ color: 0x120803 }));
  mul1.position.set(-5, 3.7, -8.97);
  scene.add(mul1);
  const mul2 = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.05), new THREE.MeshStandardMaterial({ color: 0x120803 }));
  mul2.position.set(-5, 3.7, -8.97);
  scene.add(mul2);
  // City lights
  for (let i = 0; i < 14; i++) {
    const c = Math.random() > 0.6 ? 0xffd57a : 0xfff0aa;
    const size = 0.04 + Math.random() * 0.08;
    const l = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color: c }));
    l.position.set(-5 + (Math.random() - 0.5) * 2.9, 3 + Math.random() * 1.2, -8.96);
    scene.add(l);
  }

  // Velvet curtain (left side of window)
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0x3a0a0a, roughness: 1 });
  const curL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3, 0.15), curtainMat);
  curL.position.set(-6.8, 3.7, -8.85);
  scene.add(curL);
  const curR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3, 0.15), curtainMat);
  curR.position.set(-3.2, 3.7, -8.85);
  scene.add(curR);

  // Floating dust particles
  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 160;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i*3]     = (Math.random() - 0.5) * 12;
    dustPos[i*3 + 1] = Math.random() * 5;
    dustPos[i*3 + 2] = (Math.random() - 0.5) * 12;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.03, color: 0xffd9a8, transparent: true, opacity: 0.35, sizeAttenuation: true
  }));
  scene.add(dust);
  dust.userData.drift = true;
  scene.userData.dust = dust;
}

/* ---------- Table (lathe pedestal + felt + padded rim) ---------- */
function buildTable() {
  const feltTex = makeNoiseTexture(256, 256, [18, 65, 48], 10);
  feltTex.repeat.set(3, 3);

  // Felt top with slight curvature (subtle dome)
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 1.85, 0.08, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f3d2e, map: feltTex, roughness: 0.95 })
  );
  top.position.set(0, 0.84, 0);
  top.receiveShadow = true;
  scene.add(top);

  // Padded leather rim (torus in warm brown)
  const rimPad = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.11, 14, 64),
    new THREE.MeshStandardMaterial({ color: 0x4a1414, roughness: 0.55 })
  );
  rimPad.rotation.x = Math.PI / 2;
  rimPad.position.set(0, 0.89, 0);
  rimPad.castShadow = true;
  scene.add(rimPad);

  // Brass trim — thin inner ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.74, 0.028, 10, 64),
    new THREE.MeshStandardMaterial({ color: 0xd4a840, metalness: 0.85, roughness: 0.22 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.90, 0);
  scene.add(ring);

  // Lathe pedestal — smooth turned profile
  const pts = [];
  // outer profile from top to bottom
  pts.push(new THREE.Vector2(0.28, 0.80));
  pts.push(new THREE.Vector2(0.24, 0.72));
  pts.push(new THREE.Vector2(0.22, 0.55));
  pts.push(new THREE.Vector2(0.18, 0.42));
  pts.push(new THREE.Vector2(0.22, 0.30));
  pts.push(new THREE.Vector2(0.28, 0.18));
  pts.push(new THREE.Vector2(0.55, 0.08));
  pts.push(new THREE.Vector2(0.82, 0.06));
  pts.push(new THREE.Vector2(0.85, 0.00));
  const pedestal = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 32),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.55, metalness: 0.15 })
  );
  pedestal.castShadow = true;
  scene.add(pedestal);

  // Pendant lamp — lathe shade (proper bell shape)
  const shadePts = [];
  shadePts.push(new THREE.Vector2(0.02, 0.00));
  shadePts.push(new THREE.Vector2(0.20, 0.05));
  shadePts.push(new THREE.Vector2(0.42, 0.30));
  shadePts.push(new THREE.Vector2(0.48, 0.45));
  shadePts.push(new THREE.Vector2(0.40, 0.55));
  const shade = new THREE.Mesh(
    new THREE.LatheGeometry(shadePts, 48),
    new THREE.MeshStandardMaterial({
      color: 0x8a6a1a, metalness: 0.75, roughness: 0.3,
      side: THREE.DoubleSide, emissive: 0x2a1500, emissiveIntensity: 0.4
    })
  );
  shade.position.set(0, 2.25, 0);
  shade.castShadow = true;
  scene.add(shade);

  // Interior of shade — bright emissive for glow
  const shadeInside = new THREE.Mesh(
    new THREE.LatheGeometry(shadePts, 48),
    new THREE.MeshBasicMaterial({ color: 0xffdca8, side: THREE.BackSide })
  );
  shadeInside.position.set(0, 2.25, 0);
  shadeInside.scale.set(0.97, 0.97, 0.97);
  scene.add(shadeInside);

  // Filament bulb
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff0b8 })
  );
  bulb.position.set(0, 2.40, 0);
  scene.add(bulb);

  // Visible glow disc under the shade
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 32),
    new THREE.MeshBasicMaterial({ color: 0xffbf5c, transparent: true, opacity: 0.85 })
  );
  glow.position.set(0, 2.20, 0);
  glow.rotation.x = -Math.PI / 2;
  scene.add(glow);
  lampGlow = glow;

  // Volumetric-feel cone of light down onto table (faint)
  const beamGeo = new THREE.ConeGeometry(0.9, 1.6, 24, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffc67a, transparent: true, opacity: 0.06,
    side: THREE.DoubleSide, depthWrite: false
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(0, 1.45, 0);
  beam.rotation.x = Math.PI;
  scene.add(beam);

  // Cord to ceiling
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 2.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x080808 })
  );
  cord.position.set(0, 3.45, 0);
  scene.add(cord);
  // Ceiling rosette (lathe for nice profile)
  const rosPts = [new THREE.Vector2(0.02, 0.08), new THREE.Vector2(0.15, 0.08), new THREE.Vector2(0.15, 0.04), new THREE.Vector2(0.12, 0), new THREE.Vector2(0, 0)];
  const rosette = new THREE.Mesh(
    new THREE.LatheGeometry(rosPts, 24),
    new THREE.MeshStandardMaterial({ color: 0x14100a, roughness: 0.7 })
  );
  rosette.position.set(0, 4.55, 0);
  scene.add(rosette);
}

/* ---------- Chair — rounded wingback leather ---------- */
function buildChair() {
  chair = new THREE.Group();
  const leather = new THREE.MeshStandardMaterial({ color: 0x3a1214, roughness: 0.55 });
  const leatherDark = new THREE.MeshStandardMaterial({ color: 0x2a0808, roughness: 0.6 });

  // Back — tall wingback (rounded box)
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.25, 0.18, 4, 0.08), leather);
  back.position.set(0, 1.15, 0.04);
  back.castShadow = true;
  chair.add(back);
  // Cushion back-rest pad
  const backPad = new THREE.Mesh(new RoundedBoxGeometry(0.72, 1.0, 0.12, 4, 0.1), new THREE.MeshStandardMaterial({ color: 0x4a1a1e, roughness: 0.5 }));
  backPad.position.set(0, 1.15, 0.1);
  chair.add(backPad);

  // Seat cushion — rounded
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.22, 0.82, 4, 0.08), leather);
  seat.position.set(0, 0.58, -0.38);
  seat.castShadow = true;
  chair.add(seat);

  // Armrests (wingback style)
  [-1, 1].forEach(side => {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.45, 0.75, 3, 0.05), leather);
    arm.position.set(side * 0.42, 0.90, -0.35);
    arm.castShadow = true;
    chair.add(arm);
  });

  // Four turned legs (mini lathe for each)
  const legPts = [new THREE.Vector2(0.04, 0.50), new THREE.Vector2(0.035, 0.40), new THREE.Vector2(0.045, 0.32), new THREE.Vector2(0.028, 0.10), new THREE.Vector2(0.05, 0.0)];
  for (const [x, z] of [[-0.38, 0.02], [0.38, 0.02], [-0.38, -0.78], [0.38, -0.78]]) {
    const l = new THREE.Mesh(new THREE.LatheGeometry(legPts, 12), leatherDark);
    l.position.set(x, 0, z);
    l.castShadow = true;
    chair.add(l);
  }
  chair.position.set(0, 0, 2.8);
  scene.add(chair);
}

/* ---------- Chip stack ---------- */
function buildChipStack() {
  const colors = [0xc0392b, 0x27ae60, 0x1a1a1a, 0x8e44ad, 0x1565c0, 0xf5f0e1];
  const chipProfile = [
    new THREE.Vector2(0.10, 0.000),
    new THREE.Vector2(0.105, 0.004),
    new THREE.Vector2(0.105, 0.020),
    new THREE.Vector2(0.10, 0.024),
    new THREE.Vector2(0.0,  0.024),
  ];
  const makeChip = (color) => {
    const chip = new THREE.Mesh(
      new THREE.LatheGeometry(chipProfile, 32),
      new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05 })
    );
    chip.castShadow = true;
    return chip;
  };
  // Right stack — 12 chips, slight rotation variance
  for (let i = 0; i < 12; i++) {
    const chip = makeChip(colors[i % colors.length]);
    chip.position.set(0.85, 0.925 + i * 0.025, -0.3);
    chip.rotation.y = Math.random() * Math.PI;
    scene.add(chip);
  }
  // Left stack — 7 chips
  for (let i = 0; i < 7; i++) {
    const chip = makeChip(colors[(i + 3) % colors.length]);
    chip.position.set(-1.0, 0.925 + i * 0.025, 0.42);
    chip.rotation.y = Math.random() * Math.PI;
    scene.add(chip);
  }
  // Scattered loose chips on the felt
  for (let i = 0; i < 6; i++) {
    const chip = makeChip(colors[(i*2) % colors.length]);
    chip.position.set(-0.3 + Math.random()*1.2, 0.925, -0.8 + Math.random()*0.4);
    chip.rotation.y = Math.random() * Math.PI;
    chip.rotation.x = (Math.random() - 0.5) * 0.1;
    scene.add(chip);
  }
}

/* ---------- Deck + dealable cards ---------- */
function makeCardTexture(faceDown, value, suit, suitColor) {
  const c = document.createElement('canvas');
  c.width = 180; c.height = 250;
  const g = c.getContext('2d');
  if (faceDown) {
    // Burgundy card back with diamond lattice + TO monogram
    g.fillStyle = '#7a1a2e';
    g.fillRect(0, 0, 180, 250);
    // Diamond pattern
    g.strokeStyle = 'rgba(218,165,32,0.4)';
    g.lineWidth = 1;
    for (let x = -250; x < 250; x += 10) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 250, 250); g.stroke();
      g.beginPath(); g.moveTo(x, 250); g.lineTo(x + 250, 0); g.stroke();
    }
    // Border
    g.strokeStyle = 'rgba(218,165,32,0.65)';
    g.lineWidth = 3;
    g.strokeRect(10, 10, 160, 230);
    // TO monogram
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.beginPath(); g.arc(90, 125, 36, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#daa520'; g.lineWidth = 2;
    g.beginPath(); g.arc(90, 125, 36, 0, Math.PI*2); g.stroke();
    g.fillStyle = '#daa520';
    g.font = 'italic 700 32px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('TO', 90, 130);
  } else {
    // Cream card face with value + suit
    g.fillStyle = '#fff8e7';
    g.fillRect(0, 0, 180, 250);
    g.strokeStyle = 'rgba(26,26,26,0.15)';
    g.lineWidth = 2;
    g.strokeRect(8, 8, 164, 234);
    // Top-left corner
    g.fillStyle = suitColor;
    g.font = '700 32px Georgia, serif';
    g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText(value, 16, 16);
    g.font = '26px Georgia, serif';
    g.fillText(suit, 16, 52);
    // Bottom-right corner (rotated visually)
    g.save(); g.translate(164, 234); g.rotate(Math.PI);
    g.textAlign = 'left'; g.textBaseline = 'top';
    g.font = '700 32px Georgia, serif';
    g.fillText(value, 0, 0);
    g.font = '26px Georgia, serif';
    g.fillText(suit, 0, 36);
    g.restore();
    // Center suit
    g.font = '74px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = suitColor + '20'; // semi-transparent
    g.fillText(suit, 90, 125);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildDeckAndCards() {
  // Deck — subtle box with beveled corners
  const deck = new THREE.Mesh(
    new RoundedBoxGeometry(0.18, 0.08, 0.26, 2, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x7a1a2e, roughness: 0.6 })
  );
  deck.position.set(-0.7, 0.93, -0.25);
  deck.castShadow = true;
  scene.add(deck);

  // Five dealable cards with REAL faces — thin rounded boxes
  const cardValues = [
    { v: '10', s: '♠', c: '#1a1a1a' },
    { v: 'J',  s: '♠', c: '#1a1a1a' },
    { v: 'Q',  s: '♠', c: '#1a1a1a' },
    { v: 'K',  s: '♠', c: '#1a1a1a' },
    { v: 'A',  s: '♠', c: '#1a1a1a' },
  ];
  const backTex = makeCardTexture(true);
  for (let i = 0; i < 5; i++) {
    const { v, s, c } = cardValues[i];
    const faceTex = makeCardTexture(false, v, s, c);
    const mats = [
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }), // +x
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }), // -x
      new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.7 }), // top (shown when flat face-down)
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.65 }), // bottom (face)
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }),
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }),
    ];
    const card = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.012, 0.24, 2, 0.01), mats);
    card.position.set(-0.7, 0.955 + i * 0.005, -0.25);
    card.castShadow = true;
    cards.push(card);
    scene.add(card);
  }
}

/* ---------- Silhouette dealer across the table (more human) ---------- */
function buildSilhouette() {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x060306, roughness: 0.95 });

  // Torso — tapered lathe (shoulders wider than waist)
  const torsoPts = [
    new THREE.Vector2(0.30, 0.95),
    new THREE.Vector2(0.40, 0.80),
    new THREE.Vector2(0.38, 0.60),
    new THREE.Vector2(0.28, 0.30),
    new THREE.Vector2(0.22, 0.00),
  ];
  const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 16), dark);
  torso.position.set(0, 0.95, 0);
  torso.castShadow = true;
  g.add(torso);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 12), dark);
  neck.position.set(0, 1.98, 0);
  g.add(neck);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 20), dark);
  head.position.set(0, 2.18, 0);
  g.add(head);

  // Hair — a subtle cap (flat top)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.195, 24, 20, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1 }));
  hair.position.set(0, 2.22, -0.01);
  g.add(hair);

  // Shoulders — rounded boxes for the suit
  [-1, 1].forEach(side => {
    const sh = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.18, 0.22, 3, 0.06), dark);
    sh.position.set(side * 0.36, 1.82, 0);
    g.add(sh);
  });

  // Arms — upper + forearm (jointed)
  [-1, 1].forEach(side => {
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.38, 6, 10), dark);
    upper.position.set(side * 0.4, 1.5, 0.1);
    upper.rotation.z = side * Math.PI / 14;
    g.add(upper);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.35, 6, 10), dark);
    // Dealer arm forward-right (reaching)
    if (side === -1) {
      fore.position.set(-0.42, 1.18, 0.38);
      fore.rotation.z = Math.PI / 3;
      fore.rotation.x = -0.4;
      dealerArm = fore;
    } else {
      fore.position.set(0.45, 1.1, 0.18);
      fore.rotation.z = -Math.PI / 8;
    }
    fore.castShadow = true;
    g.add(fore);
  });

  // Dealing hand
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), dark);
  hand.position.set(-0.7, 1.0, 0.52);
  hand.scale.set(1, 0.8, 1.2);
  g.add(hand);

  g.position.set(0, 0, -1.7);
  scene.add(g);
}

/* ---------- Animation / cinematic ---------- */
function tick() {
  if (!running) return;
  rafId = requestAnimationFrame(tick);
  const t = (performance.now() - startTime) / 1000; // seconds

  // Camera path (keyframes, Catmull-like interpolation via lerp chain)
  updateCamera(t);
  updateDeal(t);
  updateAmbient(t);

  renderer.render(scene, camera);

  if (t > DURATION) finishIntro();
}

const CAM_KEYS = [
  { t: 0.0,  pos: [0,    1.7,  7.5],  look: [0, 1.0, 0] },  // entering
  { t: 1.8,  pos: [0,    1.7,  5.5],  look: [0, 0.95, 0] }, // closer
  { t: 3.6,  pos: [2.8,  2.25, 2.5],  look: [0, 0.9, 0] },  // arc right
  { t: 5.5,  pos: [2.2,  2.55,-1.6],  look: [0, 0.9, 0] },  // arc behind
  { t: 6.8,  pos: [0.6,  2.7, -2.0],  look: [0, 0.88, 0] }, // top-down glance
  { t: 8.2,  pos: [0,    2.3,  1.6],  look: [0, 0.9, 0] },  // descending to seat
  { t: 9.5,  pos: [0,    1.65, 2.2],  look: [0, 0.9, 0] },  // seated
  { t: 11.5, pos: [0,    1.55, 2.1],  look: [0, 0.88, 0] }, // final composure
];

function updateCamera(t) {
  // Find surrounding keyframes
  let a = CAM_KEYS[0], b = CAM_KEYS[CAM_KEYS.length - 1];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    if (t >= CAM_KEYS[i].t && t <= CAM_KEYS[i + 1].t) { a = CAM_KEYS[i]; b = CAM_KEYS[i + 1]; break; }
  }
  const span = Math.max(0.0001, b.t - a.t);
  const raw = Math.min(1, Math.max(0, (t - a.t) / span));
  const k = easeInOutCubic(raw);

  camera.position.x = lerp(a.pos[0], b.pos[0], k);
  camera.position.y = lerp(a.pos[1], b.pos[1], k);
  camera.position.z = lerp(a.pos[2], b.pos[2], k);
  const lx = lerp(a.look[0], b.look[0], k);
  const ly = lerp(a.look[1], b.look[1], k);
  const lz = lerp(a.look[2], b.look[2], k);
  camera.lookAt(lx, ly, lz);

  // Handheld sway (very slight, cinematic)
  camera.position.x += Math.sin(t * 1.1) * 0.02;
  camera.position.y += Math.sin(t * 0.7) * 0.015;
}

/* ---------- Card deal ---------- */
// 5 cards fly from deck position to 5 arc positions between t=9.0 and t=11.0
const DEAL_START = 8.8;
const DEAL_END   = 11.0;
// Target positions form an arc in front of the seat
const DEAL_TARGETS = [
  [-0.55, 0.95,  0.25],
  [-0.27, 0.95,  0.45],
  [ 0.00, 0.95,  0.52],
  [ 0.27, 0.95,  0.45],
  [ 0.55, 0.95,  0.25],
];

function updateDeal(t) {
  const localT = (t - DEAL_START) / (DEAL_END - DEAL_START);
  if (localT <= 0) return;
  const perCardStagger = 0.16;
  cards.forEach((card, i) => {
    const cardT = Math.min(1, Math.max(0, (localT - i * perCardStagger)));
    if (cardT <= 0) return;
    const k = easeOutExpo(cardT);
    const sx = -0.7, sy = 0.96 + i * 0.005, sz = -0.25;
    const [tx, ty, tz] = DEAL_TARGETS[i];
    card.position.x = lerp(sx, tx, k);
    card.position.y = lerp(sy, ty, k) + Math.sin(k * Math.PI) * 0.3; // arc lift
    card.position.z = lerp(sz, tz, k);
    card.rotation.z = k * (i - 2) * 0.1; // slight fan rotation
    card.material.emissiveIntensity = 0.2 + Math.sin(k * Math.PI) * 0.4;
  });

  // Dealer arm swings
  if (dealerArm) {
    const sway = Math.sin(t * 4) * 0.1;
    dealerArm.rotation.z = Math.PI / 3 + sway;
  }
}

/* ---------- Ambient animation ---------- */
function updateAmbient(t) {
  // Dust drift
  const dust = scene?.userData?.dust;
  if (dust) {
    const pos = dust.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += 0.001 + Math.sin(t + i) * 0.0005;
      if (y > 5) y = 0;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }
  // Lamp flicker (subtle)
  if (lampGlow) {
    const flick = 0.92 + Math.sin(t * 7) * 0.02 + Math.random() * 0.02;
    lampGlow.material.color.setRGB(1 * flick, 0.75 * flick, 0.4 * flick);
  }
}

/* ---------- Math helpers ---------- */
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
