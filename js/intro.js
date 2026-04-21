/* =============================================================
   THOMAS OU · TABLE 01 · world.js (aka intro.js)
   Persistent 3D world with modes: intro · seated · walking · table (2D)
   ============================================================= */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ---------- Config ---------- */
const FLAG = 'poker:introPlayed';
const MODES = { INTRO: 'intro', SEATED: 'seated', WALKING: 'walking', TABLE: 'table', STATION: 'station' };
const ROUTE_BY_OBJECT = {
  whiteboard: 'about',
  turntable:  'projects',
  gloves:     'experience',
  journal:    'contact',
};

/* ---------- DOM ---------- */
const overlay    = document.getElementById('intro-overlay');
const canvas     = document.getElementById('intro-canvas');
const skipBtn    = document.getElementById('intro-skip');
const rewindBtn  = document.getElementById('intro-rewind');
const titleEl    = document.querySelector('.intro-title');
const taglineEl  = document.querySelector('.intro-tagline');

/* ---------- URL overrides ---------- */
const _urlParams = new URLSearchParams(location.search);
const _force = _urlParams.get('intro');
// Intro plays on every reload. Only skip if ?intro=skip is present or reduced-motion is on.
const hasPlayed = _force === 'skip';
const hasWebGL = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
})();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- State ---------- */
let mode = MODES.INTRO;
let scene, camera, renderer, composer, rafId, startTime;
let pendantLight, pendantBulb, pendantGlow, lampBeam;
let lightsOn = false;
let chainObj, chairObj, cards = [], portals = {};
let pointerControls;
const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();
let hoveredObj = null;
let tooltip;
const keys = {};
// Seated free-look: mouse position drives small yaw/pitch offsets, smoothed each frame
let seatedTargetYaw = 0, seatedTargetPitch = 0;
let seatedYaw = 0, seatedPitch = 0;
const SEATED_YAW_RANGE   = 0.55;  // ±31° horizontal sweep
const SEATED_PITCH_RANGE = 0.28;  // ±16° vertical sweep
const SEATED_LERP        = 0.035; // look smoothing (lower = slower / more cinematic)

// Station diorama: each route has a lit island in the void, reached by a camera tween.
// For now only PROJECTS is built; mirror the pattern for about/experience/contact later.
const STATIONS = {
  projects: {
    center:     [12, 1.5, -6],
    cameraPos:  [12, 1.8, -3.1],
    cameraLook: [12, 1.45, -6.2],
  },
  about: {
    center:     [-12, 0, -6],
    // Station pose: overview of the whole desk + computer, from standing-in-front-of-desk distance
    cameraPos:  [-12, 1.55, -4.3],
    cameraLook: [-12, 1.10, -5.80],
    // Close-up pose: right up against the screen, text readable, monitor fills the frame
    closeupPos:  [-12, 1.135, -4.99],
    closeupLook: [-12, 1.135, -5.789],
    initialPage: 'about',
  },
  // Experience card → same diorama, opens experience.log as the initial file
  experience: {
    center:     [-12, 0, -6],
    cameraPos:  [-12, 1.55, -4.3],
    cameraLook: [-12, 1.10, -5.80],
    closeupPos:  [-12, 1.135, -4.99],
    closeupLook: [-12, 1.135, -5.789],
    initialPage: 'experience',
  },
};
let currentStation = null;
let stationTweening = false;
let stationCloseup = false; // true when camera is pushed up against the monitor
let stationYaw = 0, stationPitch = 0;
let stationLights = {};
let aboutScreen = null; // reference to the CRT screen mesh, set in buildAboutStation

/* Cinematic: drop in from above, settle into a Heffernan-style iso/3-quarter park.
   Park position is up-and-off-to-the-right, looking down at the table. */
const IDLE_CENTER = [0, 0.85, 0];     // camera looks here during idle
const IDLE_BASE   = { x: 4.2, y: 5.0, z: 5.5 };
const INTRO_PATH = [
  { t: 0.0,  pos: [6.2, 7.8, 7.0],  look: [0, 0.85, 0] },  // bird's-eye from above-right
  { t: 1.5,  pos: [5.2, 6.3, 6.2],  look: [0, 0.85, 0], lightsOnAt: true },
  { t: 3.2,  pos: [IDLE_BASE.x, IDLE_BASE.y, IDLE_BASE.z], look: [...IDLE_CENTER] }, // parked iso
];
const SEAT_POS = { pos: [0, 1.4, 2.15], look: [0, 0.9, 0] };
const STANDING_POS = [0, 1.65, 4.5]; // when the user gets up to explore

let introPhase = 'approach'; // approach | readyToWalk | walking | descending
let phaseStart = 0;
let phasePath = INTRO_PATH;
let lightsSnapTriggered = false;
let idleStartMs = 0;
// Precomputed idle orbit params, derived from IDLE_BASE so motion starts at the park pose
const IDLE_ANGLE = Math.atan2(IDLE_BASE.z, IDLE_BASE.x);  // ~0.918 rad
const IDLE_RXZ   = Math.hypot(IDLE_BASE.x, IDLE_BASE.z);  // ~6.92

/* ---------- Audio (synthesized) ---------- */
let actx;
function tone(freq, dur=0.08, type='sine', vol=0.12) {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(); o.stop(actx.currentTime + dur);
}
const SFX = {
  snap:  () => { tone(220, 0.05, 'square', 0.08); setTimeout(() => tone(160, 0.04, 'square', 0.05), 20); },
  click: () => tone(1200, 0.04, 'square', 0.06),
  chain: () => { tone(140, 0.18, 'triangle', 0.13); setTimeout(() => tone(90, 0.15, 'triangle', 0.1), 90); },
  chair: () => { tone(320, 0.1, 'sine', 0.1); setTimeout(() => tone(260, 0.14, 'sine', 0.08), 80); },
  deal:  () => { tone(540, 0.07, 'triangle', 0.1); setTimeout(() => tone(720, 0.1, 'sine', 0.09), 60); },
  step:  () => tone(80 + Math.random()*30, 0.04, 'triangle', 0.05),
  glow:  () => { [440, 554, 659].forEach((f,i) => setTimeout(() => tone(f, 0.2, 'sine', 0.05), i*110)); },
};

/* ---------- Lifecycle ---------- */
function finishIntroOverlay() {
  // Only called when transitioning to the 2D poker TABLE mode.
  if (!overlay) return;
  overlay.classList.add('done');
  setTimeout(() => { overlay.style.display = 'none'; }, 1100);
  localStorage.setItem(FLAG, '1');
  if (rewindBtn) rewindBtn.style.display = '';
  document.body.classList.remove('intro-playing');
  window.dispatchEvent(new CustomEvent('poker:intro-complete'));
}

// Hide only the cinematic chrome (title + skip button). Keeps the 3D canvas showing.
function hideIntroTitle() {
  if (titleEl) titleEl.style.display = 'none';
  if (skipBtn) skipBtn.style.display = 'none';
}
function showIntroOverlayFor3D() {
  if (!overlay) return;
  overlay.style.display = '';
  overlay.classList.remove('done');
}

function dispose() {
  cancelAnimationFrame(rafId);
  if (renderer) { renderer.dispose(); renderer = null; }
  if (scene) {
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
    });
    scene = null;
  }
}

/* ---------- Entry ---------- */
if (!overlay || !canvas || !hasWebGL) {
  finishIntroOverlay();
} else if (hasPlayed && !reduceMotion) {
  // Skip cinematic. We still build the room silently so the rewind/back-to-room button works.
  finishIntroOverlay();
  // Build the room invisibly for later use
  setTimeout(() => { buildWorld(true); }, 50);
} else if (reduceMotion) {
  finishIntroOverlay();
} else {
  document.body.classList.add('intro-playing');
  buildWorld(false);
}

skipBtn?.addEventListener('click', () => {
  mode = MODES.SEATED;
  finishIntroOverlay();
});
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape') {
    if (mode === MODES.WALKING) { exitWalking(); }
  }
});
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

rewindBtn?.addEventListener('click', () => {
  if (!overlay) return;
  overlay.style.display = '';
  overlay.classList.remove('done');
  document.body.classList.add('intro-playing');
  if (titleEl) { titleEl.style.animation = 'none'; void titleEl.offsetWidth; titleEl.style.animation = ''; }
  if (taglineEl) { taglineEl.style.animation = 'none'; void taglineEl.offsetWidth; taglineEl.style.animation = ''; }
  lightsOn = false;
  setLights(false);
  introPhase = 'approach';
  phaseStart = performance.now()/1000;
  phasePath = INTRO_PATH;
  mode = MODES.INTRO;
  startTime = performance.now();
});

/* ---------- Listen for external "back to room" events from poker.js ---------- */
window.addEventListener('poker:back-to-room', () => enterSeated());

/* ============================================================= */
/*                         SCENE BUILD                            */
/* ============================================================= */
function buildWorld(silent=false) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 10, 22); // loose enough that the iso park stays crisp

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 80);
  camera.position.set(...INTRO_PATH[0].pos);
  camera.lookAt(...INTRO_PATH[0].look);

  // No post-processing — bloom was bleeding warm pixels across the void.
  composer = null;

  pointerControls = new PointerLockControls(camera, canvas);
  pointerControls.addEventListener('lock', () => showWalkingHud());
  pointerControls.addEventListener('unlock', () => { if (mode === MODES.WALKING) exitWalking(); });

  buildLights();
  buildRoom();
  buildTable();
  buildChair();
  buildChipStack();
  buildDeckAndCards();
  buildPendantChain();
  try { buildProjectsStation(); } catch (e) { console.error('[station:projects] build failed:', e); }
  try { buildAboutStation();    } catch (e) { console.error('[station:about] build failed:', e);    }
  // portals removed until user approves the void look
  // buildPortals();

  // Inventory what's actually in the scene
  const inv = {};
  scene.traverse(o => { if (o.isMesh || o.isPoints) { const k = o.geometry?.type || 'other'; inv[k] = (inv[k]||0)+1; } });
  showWalkStatus('SCENE: ' + Object.entries(inv).map(([k,v]) => `${k}×${v}`).join(' · '));

  // Interactions
  canvas.addEventListener('click', onPointerClick);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('resize', onResize);

  tooltip = document.getElementById('world-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'world-tooltip';
    tooltip.className = 'world-tooltip';
    document.body.appendChild(tooltip);
  }

  if (silent) {
    // skip cinematic, go straight to seated
    enterSeated(false);
  } else {
    startTime = performance.now();
    phaseStart = performance.now()/1000;
    introPhase = 'approach';
    phasePath = INTRO_PATH;
  }

  setLights(true);  // lights on from the moment the scene exists — no click-the-chain gating
  lightsSnapTriggered = true; // prevent the cinematic from re-triggering snapLightsOn
  renderLoop();
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

/* ============================================================= */
/*                         LIGHTING                               */
/* ============================================================= */
function buildLights() {
  // Pendant spotlight — tight cone, short range. Lights only the table + chair area.
  pendantLight = new THREE.SpotLight(0xffc67a, 0, 6, Math.PI/3.5, 0.5, 1.2);
  pendantLight.position.set(0, 2.45, 0);
  pendantLight.target.position.set(0, 0, 0);
  pendantLight.castShadow = true;
  pendantLight.shadow.mapSize.set(2048, 2048);
  pendantLight.shadow.bias = -0.001;
  pendantLight.shadow.radius = 5;
  scene.add(pendantLight);
  scene.add(pendantLight.target);

  // Very faint ambient — just enough that nothing's pitch black, but no fill-lit surfaces
  scene.add(new THREE.AmbientLight(0xffffff, 0.02));
}

function setLights(on) {
  lightsOn = on;
  pendantLight.intensity = on ? 4 : 0;
  if (pendantBulb) pendantBulb.material.color.setHex(on ? 0xfff0b8 : 0x1a0f04);
  if (pendantGlow) pendantGlow.material.opacity = on ? 0.85 : 0.0;
  if (lampBeam)    lampBeam.material.opacity    = on ? 0.08 : 0.0;
  // Absolute void
  scene.background = new THREE.Color(0x000000);
  if (scene.fog) scene.fog.color.setHex(0x000000);
}

/* ============================================================= */
/*                         TEXTURES                               */
/* ============================================================= */
function makeNoiseTex(w, h, base, variance) {
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

function makeLabelTex(text, bg='#faf6ef', fg='#1a1a1a', w=512, h=256, extra=null) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = 'italic 54px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w/2, h/2);
  if (extra) extra(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Persian-style radial rug pattern */
function makeRugTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  // Base
  g.fillStyle = '#7a1e22'; g.fillRect(0, 0, 512, 512);
  const cx = 256, cy = 256;
  // Concentric rings
  const rings = [
    { r: 240, color: '#4a0e12' },
    { r: 220, color: '#c4a055' },
    { r: 218, color: '#7a1e22' },
    { r: 190, color: '#2a0808' },
    { r: 175, color: '#c4a055' },
    { r: 170, color: '#3a0a0c' },
    { r: 120, color: '#c4a055' },
    { r: 115, color: '#2a0808' },
    { r: 90,  color: '#7a1e22' },
    { r: 40,  color: '#c4a055' },
    { r: 35,  color: '#2a0808' },
  ];
  rings.forEach(({r, color}) => { g.fillStyle = color; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI*2); g.fill(); });
  // 8-point star in center
  g.fillStyle = '#c4a055';
  g.beginPath();
  const pts = 16, inner = 14, outer = 32;
  for (let i = 0; i < pts; i++) {
    const a = (i/pts)*Math.PI*2 - Math.PI/2;
    const rr = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath(); g.fill();
  // Diamond medallions around the second ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const dx = cx + Math.cos(a) * 140;
    const dy = cy + Math.sin(a) * 140;
    g.save(); g.translate(dx, dy); g.rotate(a + Math.PI/4);
    g.fillStyle = '#c4a055'; g.fillRect(-12, -12, 24, 24);
    g.fillStyle = '#2a0808'; g.fillRect(-7, -7, 14, 14);
    g.restore();
  }
  // Outer border pattern
  g.strokeStyle = '#c4a055'; g.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    const a1 = (i/16)*Math.PI*2, a2 = ((i+1)/16)*Math.PI*2;
    g.beginPath();
    g.arc(cx, cy, 235, a1, a2);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Herringbone parquet floor */
function makeParquetTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#3a2210'; g.fillRect(0, 0, 256, 256);
  // Herringbone planks
  const plankW = 20, plankH = 80;
  for (let y = -plankH; y < 256 + plankH; y += plankW) {
    for (let x = -plankH; x < 256 + plankH; x += plankW) {
      g.save();
      // Alternate direction
      const even = (Math.floor((x + y) / plankW) % 2) === 0;
      g.translate(x, y);
      g.rotate(even ? Math.PI/4 : -Math.PI/4);
      const shade = 50 + Math.random() * 30;
      g.fillStyle = `rgb(${shade+10}, ${shade-5}, ${shade-25})`;
      g.fillRect(0, 0, plankW-1, plankH);
      // Grain lines
      g.strokeStyle = `rgba(0,0,0,0.15)`; g.lineWidth = 0.3;
      for (let k = 2; k < plankW; k += 3) {
        g.beginPath(); g.moveTo(k, 2); g.lineTo(k, plankH-2); g.stroke();
      }
      g.restore();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* Coffered ceiling pattern */
function makeCofferTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#0a0402'; g.fillRect(0, 0, 256, 256);
  // Grid lines (recessed coffers)
  g.strokeStyle = '#2a1a10'; g.lineWidth = 4;
  for (let x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  for (let y = 0; y <= 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  // Inner panels slightly lighter (highlights catch light)
  g.fillStyle = '#1a0e06';
  for (let x = 4; x < 256; x += 64) for (let y = 4; y < 256; y += 64) g.fillRect(x, y, 56, 56);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* ============================================================= */
/*                       VOID GEOMETRY                            */
/* ============================================================= */
function buildRoom() {
  /* ----- Floor: PURE BLACK unlit. Void. Just serves as something to cast shadows on. ----- */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.7 }) // only darkens where shadows fall, invisible elsewhere
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ----- Rug: small island of warm red under the table ----- */
  const rugTex = makeRugTex();
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.4, 64), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.008;
  rug.receiveShadow = true;
  scene.add(rug);
  const rugBorder = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.7, 64), new THREE.MeshStandardMaterial({ color: 0x2a0808, roughness: 1 }));
  rugBorder.rotation.x = -Math.PI / 2;
  rugBorder.position.y = 0.01;
  scene.add(rugBorder);

  /* ----- Background stars: a few distant points of light to suggest endless space ----- */
  const starGeo = new THREE.BufferGeometry();
  const starCount = 300;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    // Sphere of stars far from origin
    const r = 40 + Math.random() * 20;
    const a = Math.random() * Math.PI * 2;
    const b = (Math.random() - 0.5) * Math.PI * 0.6;
    starPos[i*3]     = Math.cos(a) * Math.cos(b) * r;
    starPos[i*3 + 1] = Math.sin(b) * r + 5;
    starPos[i*3 + 2] = Math.sin(a) * Math.cos(b) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.06, color: 0xf5f5f5, transparent: true, opacity: 0.5, sizeAttenuation: true
  }));
  scene.add(stars);
  scene.userData.stars = stars;

  // Dust particles
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    dustPos[i*3]   = (Math.random()-0.5) * 14;
    dustPos[i*3+1] = Math.random() * 5;
    dustPos[i*3+2] = (Math.random()-0.5) * 14;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.03, color: 0xffd9a8, transparent: true, opacity: 0.35 }));
  scene.add(dust);
  scene.userData.dust = dust;
}

/* ============================================================= */
/*                         TABLE                                  */
/* ============================================================= */
function buildTable() {
  const feltTex = makeNoiseTex(256, 256, [18, 65, 48], 10);
  feltTex.repeat.set(3, 3);
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 1.85, 0.08, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f3d2e, map: feltTex, roughness: 0.95 })
  );
  top.position.set(0, 0.84, 0); top.receiveShadow = true; scene.add(top);

  const rimPad = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.11, 14, 64),
    new THREE.MeshStandardMaterial({ color: 0x4a1414, roughness: 0.55 })
  );
  rimPad.rotation.x = Math.PI/2; rimPad.position.set(0, 0.89, 0); rimPad.castShadow = true; scene.add(rimPad);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.74, 0.028, 10, 64),
    new THREE.MeshStandardMaterial({ color: 0xd4a840, metalness: 0.85, roughness: 0.22 })
  );
  ring.rotation.x = Math.PI/2; ring.position.set(0, 0.90, 0); scene.add(ring);

  const pts = [
    new THREE.Vector2(0.28, 0.80), new THREE.Vector2(0.24, 0.72),
    new THREE.Vector2(0.22, 0.55), new THREE.Vector2(0.18, 0.42),
    new THREE.Vector2(0.22, 0.30), new THREE.Vector2(0.28, 0.18),
    new THREE.Vector2(0.55, 0.08), new THREE.Vector2(0.82, 0.06),
    new THREE.Vector2(0.85, 0.00),
  ];
  const pedestal = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 32),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.55, metalness: 0.15 })
  );
  pedestal.castShadow = true; scene.add(pedestal);

  // Pendant lamp
  const shadePts = [
    new THREE.Vector2(0.02, 0.00), new THREE.Vector2(0.20, 0.05),
    new THREE.Vector2(0.42, 0.30), new THREE.Vector2(0.48, 0.45),
    new THREE.Vector2(0.40, 0.55),
  ];
  const shade = new THREE.Mesh(
    new THREE.LatheGeometry(shadePts, 48),
    new THREE.MeshStandardMaterial({ color: 0x8a6a1a, metalness: 0.75, roughness: 0.3, side: THREE.DoubleSide, emissive: 0x2a1500, emissiveIntensity: 0.25 })
  );
  shade.position.set(0, 2.2, 0); shade.castShadow = true; scene.add(shade);

  // Subtle shade interior so the shade reads as "lit from within"
  const shadeInside = new THREE.Mesh(
    new THREE.LatheGeometry(shadePts, 48),
    new THREE.MeshBasicMaterial({ color: 0x5a3a18, side: THREE.BackSide })
  );
  shadeInside.position.set(0, 2.2, 0); shadeInside.scale.set(0.97, 0.97, 0.97); scene.add(shadeInside);

  // Tiny bulb — just a point source, no disc, no beam
  pendantBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff0b8 })
  );
  pendantBulb.position.set(0, 2.38, 0); scene.add(pendantBulb);

  // REMOVED: glow disc, volumetric beam cone, chain, halo ring.
  pendantGlow = null;
  lampBeam = null;

  // Cord + rosette
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x080808 })
  );
  cord.position.set(0, 3.45, 0); scene.add(cord);
}

/* ============================================================= */
/*                         CHAIN (interactive)                    */
/* ============================================================= */
function buildPendantChain() {
  const chainMat = new THREE.MeshStandardMaterial({ color: 0xd4a840, metalness: 0.85, roughness: 0.3, emissive: 0x000000 });
  const g = new THREE.Group();
  // 10 chain links (bigger + more visible)
  for (let i = 0; i < 10; i++) {
    const link = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), chainMat);
    link.position.set(0, -i * 0.065, 0);
    g.add(link);
  }
  // Chunky brass pull
  const pull = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf0c808, metalness: 0.95, roughness: 0.15, emissive: 0x000000 })
  );
  pull.position.set(0, -0.75, 0);
  g.add(pull);
  g.position.set(0.42, 2.20, 0);
  g.userData.isInteractive = true;
  g.userData.name = 'chain';
  g.userData.hoverLabel = 'PULL · TURN ON LIGHT';
  chainObj = g;
  scene.add(g);
}

/* ============================================================= */
/*                         CHAIR (interactive)                    */
/* ============================================================= */
function buildChair() {
  const chair = new THREE.Group();
  const leather = new THREE.MeshStandardMaterial({ color: 0x3a1214, roughness: 0.55 });
  const leatherDark = new THREE.MeshStandardMaterial({ color: 0x2a0808, roughness: 0.6 });

  const back = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.25, 0.18, 4, 0.08), leather);
  back.position.set(0, 1.15, 0.04); back.castShadow = true; chair.add(back);

  const backPad = new THREE.Mesh(new RoundedBoxGeometry(0.72, 1.0, 0.12, 4, 0.1), new THREE.MeshStandardMaterial({ color: 0x4a1a1e, roughness: 0.5 }));
  backPad.position.set(0, 1.15, 0.1); chair.add(backPad);

  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.22, 0.82, 4, 0.08), leather);
  seat.position.set(0, 0.58, -0.38); seat.castShadow = true; chair.add(seat);

  [-1, 1].forEach(side => {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.45, 0.75, 3, 0.05), leather);
    arm.position.set(side * 0.42, 0.90, -0.35); arm.castShadow = true; chair.add(arm);
  });

  const legPts = [new THREE.Vector2(0.04, 0.50), new THREE.Vector2(0.035, 0.40), new THREE.Vector2(0.045, 0.32), new THREE.Vector2(0.028, 0.10), new THREE.Vector2(0.05, 0.0)];
  for (const [x, z] of [[-0.38, 0.02], [0.38, 0.02], [-0.38, -0.78], [0.38, -0.78]]) {
    const l = new THREE.Mesh(new THREE.LatheGeometry(legPts, 12), leatherDark);
    l.position.set(x, 0, z); l.castShadow = true; chair.add(l);
  }

  chair.position.set(0, 0, 2.8);
  chair.userData.isInteractive = true;
  chair.userData.name = 'chair';
  chair.userData.hoverLabel = 'CLICK TO SIT';
  chairObj = chair;
  scene.add(chair);
}

/* ============================================================= */
/*                         CHIPS + CARDS                          */
/* ============================================================= */
function buildChipStack() {
  const colors = [0xc0392b, 0x27ae60, 0x1a1a1a, 0x8e44ad, 0x1565c0, 0xf5f0e1];
  const profile = [
    new THREE.Vector2(0.10, 0.000), new THREE.Vector2(0.105, 0.004),
    new THREE.Vector2(0.105, 0.020), new THREE.Vector2(0.10, 0.024),
    new THREE.Vector2(0.0,  0.024),
  ];
  const makeChip = (color) => {
    const chip = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05 }));
    chip.castShadow = true; return chip;
  };
  // Felt is at y=0.88 — chip geometry bottoms at local y=0, so base y=0.88 seats them flush.
  for (let i = 0; i < 12; i++) {
    const chip = makeChip(colors[i % colors.length]);
    chip.position.set(0.85, 0.88 + i * 0.025, -0.3);
    chip.rotation.y = Math.random() * Math.PI;
    scene.add(chip);
  }
  for (let i = 0; i < 7; i++) {
    const chip = makeChip(colors[(i + 3) % colors.length]);
    chip.position.set(-1.0, 0.88 + i * 0.025, 0.42);
    chip.rotation.y = Math.random() * Math.PI;
    scene.add(chip);
  }
  for (let i = 0; i < 5; i++) {
    const chip = makeChip(colors[(i*2) % colors.length]);
    chip.position.set(-0.3 + Math.random()*1.2, 0.88, -0.8 + Math.random()*0.4);
    chip.rotation.y = Math.random() * Math.PI;
    chip.rotation.x = (Math.random()-0.5)*0.1;
    scene.add(chip);
  }
}

function makeCardTex(faceDown, value, suit, color='#1a1a1a', label=null, sub=null) {
  const c = document.createElement('canvas'); c.width = 180; c.height = 250;
  const g = c.getContext('2d');
  if (faceDown) {
    g.fillStyle = '#7a1a2e'; g.fillRect(0, 0, 180, 250);
    g.strokeStyle = 'rgba(218,165,32,0.4)'; g.lineWidth = 1;
    for (let x = -250; x < 250; x += 10) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x+250, 250); g.stroke();
      g.beginPath(); g.moveTo(x, 250); g.lineTo(x+250, 0); g.stroke();
    }
    g.strokeStyle = 'rgba(218,165,32,0.65)'; g.lineWidth = 3; g.strokeRect(10, 10, 160, 230);
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.beginPath(); g.arc(90, 125, 36, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#daa520'; g.lineWidth = 2;
    g.beginPath(); g.arc(90, 125, 36, 0, Math.PI*2); g.stroke();
    g.fillStyle = '#daa520';
    g.font = 'italic 700 32px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TO', 90, 130);
  } else {
    // Cream background + hairline border
    g.fillStyle = '#fff8e7'; g.fillRect(0, 0, 180, 250);
    g.strokeStyle = 'rgba(26,26,26,0.18)'; g.lineWidth = 2; g.strokeRect(8, 8, 164, 234);
    // Watermark suit (very faint, behind text)
    g.save();
    g.globalAlpha = 0.07;
    g.fillStyle = color;
    g.font = '150px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(suit, 90, 125);
    g.restore();
    // Corner index (top-left)
    g.fillStyle = color;
    g.font = '700 22px Georgia, serif';
    g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText(value, 14, 14);
    g.font = '18px Georgia, serif'; g.fillText(suit, 14, 44);
    // Corner index (bottom-right, rotated)
    g.save(); g.translate(166, 236); g.rotate(Math.PI);
    g.font = '700 22px Georgia, serif'; g.fillText(value, 0, 0);
    g.font = '18px Georgia, serif'; g.fillText(suit, 0, 28);
    g.restore();
    // Page label (big, italic, center)
    if (label) {
      g.fillStyle = '#7a1a2e';
      g.font = 'italic 700 22px "Georgia", serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(label, 90, 112);
    }
    // Sub-text
    if (sub) {
      g.fillStyle = 'rgba(26,26,26,0.55)';
      g.font = '9px ui-monospace, "JetBrains Mono", monospace';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(sub, 90, 142);
    }
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildDeckAndCards() {
  // Deck box is 0.08 tall, centered — position.y = 0.92 puts its bottom flush on the felt at 0.88.
  const deck = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.08, 0.26, 2, 0.015), new THREE.MeshStandardMaterial({ color: 0x7a1a2e, roughness: 0.6 }));
  deck.position.set(-0.7, 0.92, -0.25); deck.castShadow = true; scene.add(deck);

  const cardValues = [
    { v: '10', s: '♠', label: 'HOME',       route: 'home',       sub: 'THE · DEALER' },
    { v: 'J',  s: '♠', label: 'ABOUT',      route: 'about',      sub: 'PENN · BOXING · POKER' },
    { v: 'Q',  s: '♠', label: 'PROJECTS',   route: 'projects',   sub: 'D4NCE · V3RSUS · HARBOROS' },
    { v: 'K',  s: '♠', label: 'EXPERIENCE', route: 'experience', sub: 'CASINO → ANTHROPIC' },
    { v: 'A',  s: '♠', label: 'CONTACT',    route: 'contact',    sub: 'HI@THOMASOU.COM' },
  ];
  const backTex = makeCardTex(true);
  for (let i = 0; i < 5; i++) {
    const { v, s, label, route, sub } = cardValues[i];
    const faceTex = makeCardTex(false, v, s, '#1a1a1a', label, sub);
    // Pre-mirror the face along U so the rotation.z=π flip renders the label non-mirrored.
    faceTex.wrapS   = THREE.RepeatWrapping;
    faceTex.repeat.x = -1;
    faceTex.offset.x = 1;
    const mats = [
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }),
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }),
      new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }),
      new THREE.MeshStandardMaterial({ color: 0x2a0a0a }),
    ];
    const card = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.012, 0.24, 2, 0.01), mats);
    card.position.set(-0.7, 0.966 + i * 0.005, -0.25);
    card.castShadow = true;
    card.userData.name = 'card-' + route;
    card.userData.route = route;
    card.userData.cardIndex = i;
    cards.push(card);
    scene.add(card);

    // Invisible static hitbox: stays flat at the dealt position so flipping the card
    // doesn't move the raycast target and cause flicker/flap animation.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.04, 0.30),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitbox.userData.isInteractive = false; // flipped on after deal settles
    hitbox.userData.name = 'card-hit-' + route;
    hitbox.userData.hoverLabel = '→ ' + label;
    hitbox.userData.route = route;
    hitbox.userData.cardRef = card;
    card.userData.hitbox = hitbox;
    scene.add(hitbox);
  }
}

/* ============================================================= */
/*                      PROJECTS DIORAMA                          */
/* ============================================================= */
function makeProjectSlabTex(title, sub, desc, accent) {
  const c = document.createElement('canvas'); c.width = 480; c.height = 640;
  const g = c.getContext('2d');
  // Deep felt background with faint radial vignette
  const grad = g.createRadialGradient(240, 320, 40, 240, 320, 400);
  grad.addColorStop(0, '#155440');
  grad.addColorStop(1, '#07241b');
  g.fillStyle = grad; g.fillRect(0, 0, 480, 640);
  // Gold hairline border
  g.strokeStyle = 'rgba(218,165,32,0.75)'; g.lineWidth = 2; g.strokeRect(18, 18, 444, 604);
  g.strokeStyle = 'rgba(218,165,32,0.25)'; g.lineWidth = 1; g.strokeRect(26, 26, 428, 588);
  // Accent pip top
  g.fillStyle = accent;
  g.beginPath(); g.arc(240, 90, 5, 0, Math.PI*2); g.fill();
  // Title
  g.fillStyle = accent;
  g.font = 'italic 700 68px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(title, 240, 170);
  // Subtitle
  g.fillStyle = 'rgba(245,240,225,0.65)';
  g.font = '700 13px "JetBrains Mono", ui-monospace, monospace';
  g.fillText(sub, 240, 230);
  // Hairline divider
  g.strokeStyle = 'rgba(218,165,32,0.4)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(140, 265); g.lineTo(340, 265); g.stroke();
  // Description lines
  g.fillStyle = '#f5f0e1';
  g.font = '18px Georgia, serif';
  desc.split('\n').forEach((line, i) => g.fillText(line, 240, 310 + i * 32));
  // Footer: "PRESS TO EXPLORE"
  g.fillStyle = 'rgba(245,240,225,0.4)';
  g.font = '10px "JetBrains Mono", ui-monospace, monospace';
  g.fillText('▸ CLICK TO EXPLORE', 240, 580);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildProjectsStation() {
  const [cx, cy, cz] = STATIONS.projects.center;

  // Private spotlight — starts OFF, ramps on when camera arrives.
  const spot = new THREE.SpotLight(0xffc67a, 0, 9, Math.PI / 3.2, 0.55, 1.3);
  spot.position.set(cx, cy + 3.2, cz + 1.2); // front-top so slab fronts catch the light
  spot.target.position.set(cx, cy - 0.2, cz);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.001;
  scene.add(spot); scene.add(spot.target);
  stationLights.projects = spot;

  // A local shadow-catcher floor under the diorama
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.6 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(cx, 0, cz);
  ground.receiveShadow = true;
  scene.add(ground);

  // Three floating slabs in a gentle fan
  const projects = [
    { title: 'D4NCE',     sub: 'DJ · LIVE MIXING',      desc: 'Waveform-first UI.\nSmart cue points.\nBeatmatch visualizer.',    accent: '#ff6bb3', dx: -1.55, dz: 0.25, rot:  0.28 },
    { title: 'V3RSUS',    sub: 'COMPETITIVE · REALTIME', desc: 'Bracket automation.\nLive scoring.\nNo-friction entry.',         accent: '#f0c808', dx:  0.00, dz: 0.00, rot:  0.00 },
    { title: 'HARBOROS',  sub: 'MARITIME · DEFENSE',    desc: 'Sensor fusion.\nAutonomous alerting.\nBlue-water command.',       accent: '#64d2ff', dx:  1.55, dz: 0.25, rot: -0.28 },
  ];

  projects.forEach((p) => {
    const tex = makeProjectSlabTex(p.title, p.sub, p.desc, p.accent);
    const slab = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.73),
      new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.55, metalness: 0.1,
        emissive: 0x000000, emissiveMap: tex, emissiveIntensity: 0.12,
      })
    );
    slab.position.set(cx + p.dx, cy, cz + p.dz);
    slab.rotation.y = p.rot;
    slab.castShadow = true;
    // Not clickable yet — just readable. Will wire click-to-zoom in a follow-up.
    scene.add(slab);
  });

  // Station heading: floating italic "PROJECTS" above the slabs
  const headTex = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 512, 128);
    g.fillStyle = '#daa520';
    g.font = 'italic 700 72px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('projects', 256, 72);
    g.fillStyle = 'rgba(245,240,225,0.55)';
    g.font = '700 11px "JetBrains Mono", ui-monospace, monospace';
    g.fillText('TABLE 01 · HAND TWO', 256, 112);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const heading = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.65),
    new THREE.MeshBasicMaterial({ map: headTex, transparent: true, opacity: 0.9 })
  );
  heading.position.set(cx, cy + 1.3, cz - 0.1);
  scene.add(heading);
}

/* ============================================================= */
/*                       ABOUT DIORAMA                            */
/* ============================================================= */
function makeStationHeadingTex(title, sub) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = '#daa520';
  g.font = 'italic 700 72px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(title, 256, 72);
  g.fillStyle = 'rgba(245,240,225,0.55)';
  g.font = '700 11px "JetBrains Mono", ui-monospace, monospace';
  g.fillText(sub, 256, 112);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makePlayerCardTex() {
  // Tall collectible-card style: portrait, name, stats panel, bio
  const W = 540, H = 780;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  // Cream card stock with felt inset
  g.fillStyle = '#f5efdd'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2a1a0e'; g.lineWidth = 3; g.strokeRect(14, 14, W-28, H-28);
  g.strokeStyle = '#daa520'; g.lineWidth = 1; g.strokeRect(22, 22, W-44, H-44);

  // J♠ corner marks (top-left, bottom-right rotated)
  g.fillStyle = '#1a1a1a';
  g.font = '700 28px Georgia, serif';
  g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillText('J', 38, 38);
  g.font = '22px Georgia, serif'; g.fillText('♠', 38, 72);
  g.save(); g.translate(W-38, H-38); g.rotate(Math.PI);
  g.font = '700 28px Georgia, serif'; g.fillText('J', 0, 0);
  g.font = '22px Georgia, serif'; g.fillText('♠', 0, 34);
  g.restore();

  // ---- Portrait block ----
  const portraitX = W/2, portraitY = 210, portraitR = 110;
  // Radial gradient "portrait" (placeholder) — felt green with a soft highlight
  const pg = g.createRadialGradient(portraitX-30, portraitY-30, 10, portraitX, portraitY, portraitR);
  pg.addColorStop(0, '#4a8a6e');
  pg.addColorStop(0.5, '#1c4a38');
  pg.addColorStop(1, '#07201a');
  g.fillStyle = pg;
  g.beginPath(); g.arc(portraitX, portraitY, portraitR, 0, Math.PI*2); g.fill();
  // Gold ring around portrait
  g.strokeStyle = '#daa520'; g.lineWidth = 3;
  g.beginPath(); g.arc(portraitX, portraitY, portraitR, 0, Math.PI*2); g.stroke();
  // Monogram
  g.fillStyle = '#daa520';
  g.font = 'italic 700 120px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('T', portraitX, portraitY + 6);

  // ---- Name block ----
  g.fillStyle = '#1a1a1a';
  g.font = 'italic 700 48px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('THOMAS OU', W/2, 380);
  g.fillStyle = '#7a1a2e';
  g.font = '700 12px "JetBrains Mono", ui-monospace, monospace';
  g.fillText('THE HUMAN · PENN · NYC', W/2, 410);

  // ---- Stats panel ----
  const statY = 450;
  g.strokeStyle = 'rgba(26,26,26,0.2)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(60, statY); g.lineTo(W-60, statY); g.stroke();
  g.beginPath(); g.moveTo(60, statY + 110); g.lineTo(W-60, statY + 110); g.stroke();
  const stats = [
    ['STUDY',   'CS + MATH @ PENN'],
    ['FIGHT',   'BOXING · 5X / WEEK'],
    ['PLAY',    'NO-LIMIT HOLDEM'],
  ];
  stats.forEach((row, i) => {
    const y = statY + 28 + i * 28;
    g.fillStyle = 'rgba(26,26,26,0.5)';
    g.font = '700 11px "JetBrains Mono", ui-monospace, monospace';
    g.textAlign = 'left'; g.fillText(row[0], 70, y);
    g.fillStyle = '#1a1a1a';
    g.font = '15px Georgia, serif';
    g.textAlign = 'right'; g.fillText(row[1], W-70, y);
  });

  // ---- Bio paragraph ----
  const bioY = 595;
  g.fillStyle = '#1a1a1a';
  g.font = 'italic 18px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'top';
  const bio = [
    'Sophomore studying CS + math.',
    'Exploited a crypto casino at 18.',
    'Building D4NCE, V3RSUS, HarborOS.',
    'Believes in doing the honest work.',
  ];
  bio.forEach((line, i) => g.fillText(line, W/2, bioY + i * 28));

  // Foot tag
  g.fillStyle = 'rgba(26,26,26,0.45)';
  g.font = '700 10px "JetBrains Mono", ui-monospace, monospace';
  g.textAlign = 'center'; g.textBaseline = 'bottom';
  g.fillText('THOMASOU · TABLE 01 · HAND ONE', W/2, H - 36);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* --- Screen content pages. Add/edit freely — this is just text rendered on a canvas. --- */
const SCREEN_PAGES = {
  about: {
    title: 'about.txt',
    body: [
      'THOMAS OU',
      '',
      'sophomore @ penn — cs + math.',
      'living in new york / philly.',
      '',
      'i exploited a crypto casino at 18.',
      'not because i wanted to — because',
      'the math was obvious and nobody',
      'had looked. that taught me what',
      'to look for.',
      '',
      'now: i build software that is',
      'honest about what it does. no',
      'marketing layer, no fake UX, no',
      'pretending to be more than it is.',
      '',
      'boxing 5x/week. no-limit holdem',
      'in my free time. i pay attention',
      'to tells. i pay attention to yours.',
    ],
  },
  experience: {
    title: 'experience.log',
    body: [
      'YEAR  ROLE                     NOTES',
      '----  ----                     -----',
      '2026  anthropic                — ?',
      '2025  harboros / founder       maritime defense',
      '2025  v3rsus   / founder       competitive app',
      '2024  d4nce    / founder       dj tool',
      '2023  penn (cs + math)         — sophomore',
      '2023  casino exploit           — 18 yrs old',
      '',
      '> double-click a year to go deeper',
      '  (coming soon)',
    ],
  },
  contact: {
    title: 'contact.eml',
    body: [
      'TO:   you',
      'FROM: thomas',
      '',
      'if you are reading this, say hi.',
      'i read everything.',
      '',
      'email    · hi@thomasou.com',
      'github   · github.com/Smokeybear10',
      'linkedin · linkedin.com/in/thomasou0',
      'site     · thomasou.com',
      '',
      '— deal me in.',
    ],
  },
};
/* ===== Win98-style screen chrome, ported from SWEEPER.EXE ===== */
const WIN98 = {
  face:     '#BCBCBC',
  hl:       '#EFEFEF',
  shadow:   '#404040',
  shadowMd: '#6E6E6E',
  titleA:   '#000080',
  titleB:   '#1084D0',
  desktop:  '#008080',
  text:     '#000000',
  textHi:   '#FFFFFF',
  font:     "'Tahoma','Geneva','MS Sans Serif',sans-serif",
  mono:     "'JetBrains Mono','Consolas','Courier New',monospace",
};

const SCREEN_ICONS = [
  { id: 'about',      label: 'about.txt',      x: 30,  y: 30,  w: 90, h: 84 },
  { id: 'experience', label: 'experience.log', x: 30,  y: 130, w: 90, h: 84 },
  { id: 'contact',    label: 'contact.eml',    x: 30,  y: 230, w: 90, h: 84 },
];

// 3D bevel edge (raised = highlight on top-left, shadow on bottom-right)
function win98Bevel(ctx, x, y, w, h, raised=true) {
  const a = raised ? WIN98.hl : WIN98.shadow;
  const b = raised ? WIN98.shadow : WIN98.hl;
  ctx.fillStyle = a;
  ctx.fillRect(x, y, w, 1);        // top
  ctx.fillRect(x, y, 1, h);        // left
  ctx.fillStyle = b;
  ctx.fillRect(x, y + h - 1, w, 1); // bottom
  ctx.fillRect(x + w - 1, y, 1, h); // right
}

function drawIcon(ctx, icon) {
  const { x, y, w, label } = icon;
  // Document file glyph (white sheet with folded corner)
  const fx = x + (w - 42) / 2, fy = y + 6, fw = 42, fh = 54;
  ctx.fillStyle = WIN98.hl; ctx.fillRect(fx, fy, fw, fh);
  ctx.strokeStyle = WIN98.shadow; ctx.lineWidth = 1;
  ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
  // Folded corner
  ctx.fillStyle = WIN98.face;
  ctx.beginPath();
  ctx.moveTo(fx + fw - 12, fy);
  ctx.lineTo(fx + fw,      fy);
  ctx.lineTo(fx + fw,      fy + 12);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = WIN98.shadow;
  ctx.beginPath();
  ctx.moveTo(fx + fw - 12, fy);
  ctx.lineTo(fx + fw - 12, fy + 12);
  ctx.lineTo(fx + fw,      fy + 12);
  ctx.stroke();
  // Text-line hints on the sheet
  ctx.strokeStyle = '#8A8A8A';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(fx + 6, fy + 22 + i * 7);
    ctx.lineTo(fx + fw - 8, fy + 22 + i * 7);
    ctx.stroke();
  }
  // Win98 icon labels are white with a dark outline when on the desktop
  ctx.font = `11px ${WIN98.font}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillText(label, x + w / 2 + 1, fy + fh + 5);
  ctx.fillStyle = WIN98.textHi;
  ctx.fillText(label, x + w / 2,     fy + fh + 4);
}

function renderScreenDesktop(screen) {
  const { ctx, canvas } = screen.userData;
  const W = canvas.width, H = canvas.height;

  // Teal desktop with a subtle noise — classic Win98
  ctx.fillStyle = WIN98.desktop; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let y = 0; y < H; y += 2) for (let x = (y % 4 === 0 ? 0 : 2); x < W; x += 4) ctx.fillRect(x, y, 1, 1);

  // Desktop icons (vertical column left)
  SCREEN_ICONS.forEach(icon => drawIcon(ctx, icon));

  // "Welcome" pane in upper-right — gives the desktop a focal point
  const pX = 200, pY = 40, pW = W - pX - 40, pH = 260;
  ctx.fillStyle = WIN98.face; ctx.fillRect(pX, pY, pW, pH);
  win98Bevel(ctx, pX, pY, pW, pH, true);
  // Inner sunken content area
  ctx.fillStyle = WIN98.hl; ctx.fillRect(pX + 8, pY + 8, pW - 16, pH - 16);
  win98Bevel(ctx, pX + 8, pY + 8, pW - 16, pH - 16, false);
  // Heading strip
  const bx = pX + 12, by = pY + 12, bw = pW - 24, bh = 22;
  const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
  grad.addColorStop(0, WIN98.titleA); grad.addColorStop(1, WIN98.titleB);
  ctx.fillStyle = grad; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = WIN98.textHi;
  ctx.font = `bold 12px ${WIN98.font}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('  Welcome to ThomasOS', bx + 4, by + 11);
  // Body text
  ctx.fillStyle = WIN98.text;
  ctx.font = `11px ${WIN98.font}`;
  ctx.textBaseline = 'top';
  const lines = [
    'This computer belongs to:',
    '',
    '    THOMAS OU',
    '    penn / nyc',
    '    cs + math, boxing, poker.',
    '',
    'Double-click a file at left to read.',
    '',
    '— unregistered copy —',
  ];
  lines.forEach((ln, i) => ctx.fillText(ln, bx + 10, by + bh + 14 + i * 18));

  // Taskbar
  const tbY = H - 28;
  ctx.fillStyle = WIN98.face; ctx.fillRect(0, tbY, W, 28);
  ctx.fillStyle = WIN98.hl; ctx.fillRect(0, tbY, W, 2); // top highlight

  // Start button
  const sbX = 4, sbY = tbY + 3, sbW = 70, sbH = 22;
  ctx.fillStyle = WIN98.face; ctx.fillRect(sbX, sbY, sbW, sbH);
  win98Bevel(ctx, sbX, sbY, sbW, sbH, true);
  // Flag
  [[0xFF0000, 0, 0], [0x00FF00, 1, 0], [0x0000FF, 0, 1], [0xFFFF00, 1, 1]].forEach(([c, dx, dy]) => {
    ctx.fillStyle = '#' + c.toString(16).padStart(6, '0');
    ctx.fillRect(sbX + 6 + dx * 5, sbY + 6 + dy * 4, 4, 3);
  });
  ctx.fillStyle = WIN98.text;
  ctx.font = `bold 11px ${WIN98.font}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Start', sbX + 22, sbY + 11);

  // Divider
  ctx.fillStyle = WIN98.shadowMd; ctx.fillRect(sbX + sbW + 4, sbY + 1, 1, sbH - 2);
  ctx.fillStyle = WIN98.hl;       ctx.fillRect(sbX + sbW + 5, sbY + 1, 1, sbH - 2);

  // System tray + clock
  const trX = W - 92, trY = tbY + 3, trW = 88, trH = 22;
  ctx.fillStyle = WIN98.face; ctx.fillRect(trX, trY, trW, trH);
  win98Bevel(ctx, trX, trY, trW, trH, false);
  ctx.fillStyle = WIN98.text;
  ctx.font = `10px ${WIN98.font}`;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('3:47 AM', trX + trW - 6, trY + 11);

  screen.userData.page = 'desktop';
  screen.userData.closeBox = null;
  screen.userData.tex.needsUpdate = true;
}

function renderScreenWindow(screen, pageId) {
  const page = SCREEN_PAGES[pageId];
  if (!page) return;
  const { ctx, canvas } = screen.userData;
  const W = canvas.width, H = canvas.height;

  // Persistent desktop background + icons showing behind the window
  ctx.fillStyle = WIN98.desktop; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let y = 0; y < H; y += 2) for (let x = (y % 4 === 0 ? 0 : 2); x < W; x += 4) ctx.fillRect(x, y, 1, 1);
  SCREEN_ICONS.forEach(icon => drawIcon(ctx, icon));

  // ===== Window =====
  const winX = 150, winY = 36, winW = W - 170, winH = H - 96;
  // Gray face
  ctx.fillStyle = WIN98.face; ctx.fillRect(winX, winY, winW, winH);
  win98Bevel(ctx, winX, winY, winW, winH, true);
  // Title bar — blue gradient
  const tbX = winX + 3, tbY = winY + 3, tbW = winW - 6, tbH = 22;
  const grad = ctx.createLinearGradient(tbX, tbY, tbX + tbW, tbY);
  grad.addColorStop(0, WIN98.titleA); grad.addColorStop(1, WIN98.titleB);
  ctx.fillStyle = grad; ctx.fillRect(tbX, tbY, tbW, tbH);
  // Title text
  ctx.fillStyle = WIN98.textHi;
  ctx.font = `bold 12px ${WIN98.font}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('  ' + page.title, tbX + 4, tbY + tbH / 2);

  // Close button [×] — raised gray box with an X, top-right of title bar
  const cbS = 16, cbX = tbX + tbW - cbS - 2, cbY = tbY + 3;
  ctx.fillStyle = WIN98.face; ctx.fillRect(cbX, cbY, cbS, cbS);
  win98Bevel(ctx, cbX, cbY, cbS, cbS, true);
  ctx.strokeStyle = WIN98.text; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cbX + 4, cbY + 4); ctx.lineTo(cbX + cbS - 4, cbY + cbS - 4);
  ctx.moveTo(cbX + cbS - 4, cbY + 4); ctx.lineTo(cbX + 4, cbY + cbS - 4);
  ctx.stroke();
  screen.userData.closeBox = { x: cbX, y: cbY, w: cbS, h: cbS };

  // Optional menu bar ("File  Edit  View  Help")
  const mbX = winX + 3, mbY = tbY + tbH + 2, mbW = winW - 6, mbH = 18;
  ctx.fillStyle = WIN98.face; ctx.fillRect(mbX, mbY, mbW, mbH);
  ctx.fillStyle = WIN98.text;
  ctx.font = `11px ${WIN98.font}`;
  ctx.textBaseline = 'middle';
  ['File', 'Edit', 'View', 'Help'].forEach((item, i) => {
    // Underline the first letter for the "alt key" hint
    const x = mbX + 8 + i * 42;
    ctx.fillText(item, x, mbY + mbH / 2);
    const chW = ctx.measureText(item[0]).width;
    ctx.fillRect(x, mbY + mbH / 2 + 5, chW, 1);
  });

  // Content area — white, inset (sunken) bevel
  const caX = winX + 6, caY = mbY + mbH + 2, caW = winW - 12, caH = winH - (caY - winY) - 6;
  ctx.fillStyle = WIN98.hl; ctx.fillRect(caX, caY, caW, caH);
  win98Bevel(ctx, caX, caY, caW, caH, false);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(caX + 1, caY + 1, caW - 2, caH - 2);
  // Body text — monospace, classic DOS-ish
  ctx.fillStyle = WIN98.text;
  ctx.font = `14px ${WIN98.mono}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  page.body.forEach((line, i) => ctx.fillText(line, caX + 10, caY + 10 + i * 20));

  // Taskbar (persistent)
  const tbarY = H - 28;
  ctx.fillStyle = WIN98.face; ctx.fillRect(0, tbarY, W, 28);
  ctx.fillStyle = WIN98.hl; ctx.fillRect(0, tbarY, W, 2);
  // Start button
  const sbX = 4, sbY = tbarY + 3, sbW = 70, sbH = 22;
  ctx.fillStyle = WIN98.face; ctx.fillRect(sbX, sbY, sbW, sbH);
  win98Bevel(ctx, sbX, sbY, sbW, sbH, true);
  [[0xFF0000, 0, 0], [0x00FF00, 1, 0], [0x0000FF, 0, 1], [0xFFFF00, 1, 1]].forEach(([c, dx, dy]) => {
    ctx.fillStyle = '#' + c.toString(16).padStart(6, '0');
    ctx.fillRect(sbX + 6 + dx * 5, sbY + 6 + dy * 4, 4, 3);
  });
  ctx.fillStyle = WIN98.text;
  ctx.font = `bold 11px ${WIN98.font}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Start', sbX + 22, sbY + 11);
  // Taskbar app button for the open window
  const taX = sbX + sbW + 10, taY = tbarY + 3, taW = 140, taH = 22;
  ctx.fillStyle = '#D4D4D4'; ctx.fillRect(taX, taY, taW, taH);
  win98Bevel(ctx, taX, taY, taW, taH, false); // pressed look — active app
  ctx.fillStyle = WIN98.text;
  ctx.font = `bold 11px ${WIN98.font}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(page.title, taX + 6, taY + 11);
  // Clock
  const ckX = W - 92, ckY = tbarY + 3, ckW = 88, ckH = 22;
  ctx.fillStyle = WIN98.face; ctx.fillRect(ckX, ckY, ckW, ckH);
  win98Bevel(ctx, ckX, ckY, ckW, ckH, false);
  ctx.fillStyle = WIN98.text;
  ctx.font = `10px ${WIN98.font}`;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('3:47 AM', ckX + ckW - 6, ckY + 11);

  screen.userData.page = pageId;
  screen.userData.tex.needsUpdate = true;
}

function handleScreenClick(screen, u, v) {
  const { canvas } = screen.userData;
  const px = u * canvas.width;
  const py = (1 - v) * canvas.height;
  // On the desktop: click an icon → open its window
  if (screen.userData.page === 'desktop') {
    for (const icon of SCREEN_ICONS) {
      if (px >= icon.x && px <= icon.x + icon.w && py >= icon.y - 10 && py <= icon.y + icon.h) {
        SFX.click();
        renderScreenWindow(screen, icon.id);
        return;
      }
    }
    return;
  }
  // In a window: click the close box → back to desktop
  const cb = screen.userData.closeBox;
  if (cb && px >= cb.x - 4 && px <= cb.x + cb.w + 4 && py >= cb.y - 4 && py <= cb.y + cb.h + 4) {
    SFX.click();
    renderScreenDesktop(screen);
  }
}

function buildAboutStation() {
  console.log('[about] build start');
  const [cx, cy, cz] = STATIONS.about.center;
  const deskTopH = 0.76, topT = 0.05;

  // --- Spotlight (starts off, fades in on entry) ---
  const spot = new THREE.SpotLight(0xffe2b6, 0, 14, Math.PI / 2.8, 0.55, 1.25);
  spot.position.set(cx, 4.5, cz + 1.5);
  spot.target.position.set(cx, 0.9, cz - 0.2);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  scene.add(spot); scene.add(spot.target);
  stationLights.about = spot;

  // --- Always-on low fill so the station is at least visible during the tween in ---
  const fill = new THREE.PointLight(0xffe2b6, 0.55, 10, 1.3);
  fill.position.set(cx, 2.2, cz + 0.8);
  scene.add(fill);
  console.log('[about] lights ok');

  // Shadow-catcher floor
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.55 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(cx, 0, cz);
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- Desk ---------- */
  const deskW = 2.0, deskD = 0.9;
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(deskW, topT, deskD),
    new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.7 })
  );
  desk.position.set(cx, deskTopH, cz);
  desk.castShadow = true; desk.receiveShadow = true;
  scene.add(desk);
  // 4 legs
  const legH = deskTopH - topT / 2;
  [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(([dx, dz]) => {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, legH, 0.07),
      new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.7 })
    );
    leg.position.set(cx + dx, legH / 2, cz + dz);
    leg.castShadow = true; leg.receiveShadow = true;
    scene.add(leg);
  });
  console.log('[about] desk ok');

  /* ---------- CRT Monitor ---------- */
  const monW = 0.95, monH = 0.70, monD = 0.65;
  const monY = deskTopH + topT / 2 + monH / 2;
  const monZ = cz - 0.12;
  const monitorCase = new THREE.Mesh(
    new THREE.BoxGeometry(monW, monH, monD),
    new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.55 })
  );
  monitorCase.position.set(cx, monY, monZ);
  monitorCase.castShadow = true;
  // Bigger hit target — clicking the case also triggers the close-up dolly
  monitorCase.userData.isInteractive = true;
  monitorCase.userData.isMonitor = true;
  monitorCase.userData.hoverLabel = '⌘ SIT AT COMPUTER';
  scene.add(monitorCase);
  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(monW - 0.10, monH - 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 })
  );
  bezel.position.set(cx, monY, monZ + monD / 2 + 0.001);
  scene.add(bezel);
  // Screen
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 720; screenCanvas.height = 500;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(monW - 0.18, monH - 0.22),
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0xffffff,
      emissiveMap: screenTex,
      emissiveIntensity: 0.9,
      roughness: 0.35,
    })
  );
  screenMesh.position.set(cx, monY, monZ + monD / 2 + 0.006);
  screenMesh.userData.isInteractive = true;
  screenMesh.userData.isScreen = true;
  screenMesh.userData.name = 'about-screen';
  screenMesh.userData.hoverLabel = '⌘ SIT AT COMPUTER';
  screenMesh.userData.canvas = screenCanvas;
  screenMesh.userData.ctx = screenCanvas.getContext('2d');
  screenMesh.userData.tex = screenTex;
  screenMesh.userData.page = 'desktop';
  scene.add(screenMesh);
  aboutScreen = screenMesh;
  renderScreenDesktop(screenMesh);
  console.log('[about] monitor + screen ok');

  /* ---------- Keyboard + Mouse (simple boxes) ---------- */
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.03, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.6 })
  );
  keyboard.position.set(cx - 0.05, deskTopH + topT / 2 + 0.016, cz + 0.22);
  keyboard.castShadow = true;
  scene.add(keyboard);

  const mouseBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.025, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xe0d8c8, roughness: 0.55 })
  );
  mouseBody.position.set(cx + 0.42, deskTopH + topT / 2 + 0.013, cz + 0.22);
  mouseBody.castShadow = true;
  scene.add(mouseBody);
  console.log('[about] keyboard + mouse ok');

  /* ---------- Station heading ---------- */
  const heading = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.6),
    new THREE.MeshBasicMaterial({ map: makeStationHeadingTex('about', 'THOMASOS · v1.0'), transparent: true, opacity: 0.9 })
  );
  heading.position.set(cx, monY + monH / 2 + 0.45, cz - 0.25);
  scene.add(heading);
  console.log('[about] build complete');
}

/* ============================================================= */
/*                         PORTAL OBJECTS                         */
/* ============================================================= */
function buildPortals() {
  /* Portals are pushed FAR into the void (8m radius) with zero emissive.
     They're essentially invisible until you walk up to them and they catch the pendant's scattered light. */

  // --- Small floating parchment (ABOUT) — paper, not panel
  const wb = new THREE.Group();
  const wbSurface = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.65), new THREE.MeshStandardMaterial({
    color: 0xfbf4e0,
    map: makeLabelTex('about', '#fbf4e0', '#1a1a1a', 512, 256),
    roughness: 0.9,
  }));
  wb.add(wbSurface);
  wb.position.set(-8, 1.5, 0);
  wb.rotation.y = Math.PI / 2;
  wb.userData.isInteractive = true;
  wb.userData.name = 'whiteboard';
  wb.userData.hoverLabel = '→ ABOUT';
  wb.userData.portal = 'about';
  portals.whiteboard = wb;
  scene.add(wb);

  // --- Small floating record (PROJECTS / D4NCE) — single disc, no stand
  const tt = new THREE.Group();
  const record = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.008, 48), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.85 }));
  tt.add(record);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.01, 24), new THREE.MeshStandardMaterial({ color: 0xff66b2, roughness: 0.8 }));
  label.position.y = 0.005;
  tt.add(label);
  tt.rotation.x = Math.PI / 2;
  tt.position.set(0, 1.5, -8);
  tt.userData.isInteractive = true;
  tt.userData.name = 'turntable';
  tt.userData.hoverLabel = '→ PROJECTS';
  tt.userData.portal = 'projects';
  portals.turntable = tt;
  scene.add(tt);

  // --- Boxing gloves (EXPERIENCE) — small, no glow
  const gl = new THREE.Group();
  [-1, 1].forEach(side => {
    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 20, 0, Math.PI*2, 0, Math.PI*0.6), new THREE.MeshStandardMaterial({ color: 0xc71f1f, roughness: 0.5 }));
    glove.position.set(side * 0.18, 0, 0);
    glove.rotation.z = side * 0.2;
    gl.add(glove);
  });
  gl.position.set(8, 1.5, 0);
  gl.rotation.y = -Math.PI / 2;
  gl.userData.isInteractive = true;
  gl.userData.name = 'gloves';
  gl.userData.hoverLabel = '→ EXPERIENCE';
  gl.userData.portal = 'experience';
  portals.gloves = gl;
  scene.add(gl);

  // --- Journal (CONTACT) — no side table, just a floating book
  const jt = new THREE.Group();
  const journal = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.05, 0.42, 3, 0.015), new THREE.MeshStandardMaterial({ color: 0x4a1a1a, roughness: 0.55 }));
  jt.add(journal);
  jt.position.set(0, 1.5, 8);
  jt.userData.isInteractive = true;
  jt.userData.name = 'journal';
  jt.userData.hoverLabel = '→ CONTACT';
  jt.userData.portal = 'contact';
  portals.journal = jt;
  scene.add(jt);
  // NO point-lights on portals — they stay in the void until you approach
}

/* ============================================================= */
/*                         RENDER LOOP                            */
/* ============================================================= */
function renderLoop() {
  rafId = requestAnimationFrame(renderLoop);
  const now = performance.now();
  const t = (now - startTime) / 1000;

  if (mode === MODES.INTRO) updateIntro(t);
  else if (mode === MODES.WALKING) updateWalking(t);
  else if (mode === MODES.SEATED) { updateSeatedLook(); updateCardFlips(); }
  else if (mode === MODES.STATION) updateStationView();
  // TABLE mode: 2D UI, camera frozen

  updateAmbient(t);
  updateHovered();
  if (composer) composer.render();
  else renderer.render(scene, camera);
}

/* ---------- Intro-mode camera ---------- */
function updateIntro(t) {
  // Once the sit animation takes over, stop driving the camera from the cinematic path.
  if (introPhase === 'descending') return;

  if (introPhase === 'readyToWalk') {
    // Slow iso orbit around the table — compound sines on angle / radius / height so
    // the motion never quite repeats. Starts at IDLE_BASE (sin(0) = 0) so no jump.
    const it = (performance.now() - idleStartMs) / 1000;
    const angle = IDLE_ANGLE + Math.sin(it * 0.28) * 0.22;  // ±12.6° sweep, period ~22s
    const r     = IDLE_RXZ   + Math.sin(it * 0.18) * 0.40;  // ±0.4u push/pull, ~35s
    const y     = IDLE_BASE.y + Math.sin(it * 0.22) * 0.25; // ±0.25u breath,   ~29s
    camera.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    camera.lookAt(IDLE_CENTER[0], IDLE_CENTER[1], IDLE_CENTER[2]);
    return;
  }

  const nowPhaseT = (performance.now()/1000) - phaseStart;
  interpolatePath(phasePath, nowPhaseT);

  // Auto-lights on during cinematic
  if (!lightsSnapTriggered) {
    const lightKey = phasePath.find(p => p.lightsOnAt);
    if (lightKey && nowPhaseT >= lightKey.t) {
      lightsSnapTriggered = true;
      snapLightsOn();
    }
  }

  // End of cinematic → ready to walk (hand off to idle orbit)
  const last = phasePath[phasePath.length - 1];
  if (nowPhaseT >= last.t && introPhase === 'approach') {
    introPhase = 'readyToWalk';
    idleStartMs = performance.now();
    hideIntroTitle();
    showReadyToWalkPrompt();
  }

  // Subtle handheld sway during the cinematic approach only
  camera.position.x += Math.sin(t * 1.1) * 0.01;
  camera.position.y += Math.sin(t * 0.7) * 0.007;
}

function snapLightsOn() {
  SFX.chain();
  let i = 0;
  const steps = 24;
  function fade() {
    i++;
    pendantLight.intensity = 4 * (i/steps);
    if (pendantBulb) pendantBulb.material.color.setRGB(1 * (i/steps), 0.94 * (i/steps), 0.72 * (i/steps));
    if (pendantGlow) pendantGlow.material.opacity = 0.85 * (i/steps);
    if (lampBeam) lampBeam.material.opacity = 0.05 * (i/steps);
    if (i < steps) requestAnimationFrame(fade);
    else lightsOn = true;
  }
  // Keep void PURE BLACK when lights come on. Don't paint the background brown.
  scene.background = new THREE.Color(0x000000);
  if (scene.fog) scene.fog.color.setHex(0x000000);
  fade();
}

function showReadyToWalkPrompt() {
  showWalkStatus('CINEMATIC DONE — waiting for click to sit');
  let hud = document.getElementById('ready-walk-hud');
  if (hud) return;
  hud = document.createElement('div');
  hud.id = 'ready-walk-hud';
  hud.className = 'world-hud ready-walk heff';
  hud.innerHTML = `
    <button class="heff-begin" data-action="take-seat">Click anywhere to begin <span class="heff-cursor">_</span></button>
  `;
  document.body.appendChild(hud);
  const begin = () => {
    if (introPhase !== 'readyToWalk') return;
    hud.remove();
    document.removeEventListener('keydown', keyBegin);
    takeSeat();
  };
  hud.addEventListener('click', begin);
  const keyBegin = (ev) => {
    if (ev.key === ' ' || ev.key === 'Enter') begin();
  };
  document.addEventListener('keydown', keyBegin);
}

function setTagline(main, sub) {
  const el = document.getElementById('intro-tagline');
  if (!el) return;
  if (!main) { el.classList.remove('show'); return; }
  el.innerHTML = main + (sub ? `<b>${sub}</b>` : '');
  el.classList.add('show');
}

function interpolatePath(path, t) {
  let a = path[0], b = path[path.length - 1];
  for (let i = 0; i < path.length - 1; i++) {
    if (t >= path[i].t && t <= path[i + 1].t) { a = path[i]; b = path[i + 1]; break; }
    if (t > path[i + 1].t) { a = b = path[i + 1]; }
  }
  const span = Math.max(0.0001, b.t - a.t);
  const raw = Math.min(1, Math.max(0, (t - a.t) / span));
  const k = easeInOutCubic(raw);
  camera.position.x = lerp(a.pos[0], b.pos[0], k);
  camera.position.y = lerp(a.pos[1], b.pos[1], k);
  camera.position.z = lerp(a.pos[2], b.pos[2], k);
  camera.lookAt(lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k), lerp(a.look[2], b.look[2], k));
}

/* ---------- Walking bounds (void is infinite — clamp softer) ---------- */
const WALK_MIN = -10, WALK_MAX = 10; // soft limits so you can't walk into true nothing

/* ---------- Walking mode ---------- */
const walkSpeed = 3.2;
const walkVec = new THREE.Vector3();
let lastWalkTime = 0;

function updateWalking(t) {
  const dt = Math.min(0.05, (t - lastWalkTime));
  lastWalkTime = t;

  // Status line so we can see what's happening
  const active = Object.keys(keys).filter(k => keys[k]).join(',') || '—';
  showWalkStatus(`LOCK=${pointerControls.isLocked} · KEYS=${active} · pos=(${camera.position.x.toFixed(1)},${camera.position.z.toFixed(1)})`);

  // Allow movement even without pointer lock (diagnostic)
  const dir = new THREE.Vector3();
  if (keys['w'] || keys['arrowup'])    dir.z += 1;
  if (keys['s'] || keys['arrowdown'])  dir.z -= 1;
  if (keys['a'] || keys['arrowleft'])  dir.x -= 1;
  if (keys['d'] || keys['arrowright']) dir.x += 1;
  if (dir.lengthSq() === 0) return;
  dir.normalize().multiplyScalar(walkSpeed * dt);

  pointerControls.moveForward(dir.z);
  pointerControls.moveRight(dir.x);

  // Soft clamp in the void
  camera.position.x = Math.max(WALK_MIN, Math.min(WALK_MAX, camera.position.x));
  camera.position.z = Math.max(WALK_MIN, Math.min(WALK_MAX, camera.position.z));
  camera.position.y = 1.6; // head height — never fly

  // Avoid table (cylinder at origin, r=2)
  const dx = camera.position.x, dz = camera.position.z;
  const d = Math.sqrt(dx*dx + dz*dz);
  if (d < 2.15) {
    camera.position.x = dx * 2.15 / d;
    camera.position.z = dz * 2.15 / d;
  }

  // Occasional footstep SFX
  if (Math.random() < 0.02) SFX.step();
}

/* ---------- Ambient ---------- */
function updateAmbient(t) {
  const dust = scene?.userData?.dust;
  if (dust) {
    const pos = dust.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += 0.0008 + Math.sin(t + i) * 0.0004;
      if (y > 5) y = 0;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }
  // Lamp flicker when on
  if (lightsOn && pendantGlow) {
    const flick = 0.9 + Math.sin(t * 7) * 0.04 + Math.random() * 0.02;
    pendantGlow.material.color.setRGB(1 * flick, 0.75 * flick, 0.4 * flick);
  }
}

/* ---------- Interaction: hover + click ---------- */
function onPointerMove(e) {
  if (mode === MODES.WALKING) return; // crosshair handles walking hits
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  if (mode === MODES.SEATED) {
    // Mouse right → look right, mouse up → look up
    seatedTargetYaw   = pointer.x * SEATED_YAW_RANGE;
    seatedTargetPitch = pointer.y * SEATED_PITCH_RANGE;
  }
}

/* ---------- Seated card flip: hover (via static hitbox) → rotation.z 0 → π ---------- */
const CARD_FLIP_LERP = 0.14;
const CARD_FLIP_LIFT = 0.12; // peak lift at mid-flip (rotation.z = π/2)
function updateCardFlips() {
  cards.forEach(card => {
    if (!card.userData.dealY) return;
    const hitbox  = card.userData.hitbox;
    // Hover is resolved against the STATIC hitbox, not the flipping card itself,
    // so motion can't pull the ray off the target and cause flicker.
    const target  = (hoveredObj === hitbox) ? Math.PI : 0;
    const current = card.rotation.z;
    const next    = current + (target - current) * CARD_FLIP_LERP;
    card.rotation.z = next;
    card.position.y = card.userData.dealY + Math.sin(Math.abs(next)) * CARD_FLIP_LIFT;
  });
}

/* ---------- Seated free-look: eased yaw/pitch around the seat ---------- */
function updateSeatedLook() {
  seatedYaw   += (seatedTargetYaw   - seatedYaw)   * SEATED_LERP;
  seatedPitch += (seatedTargetPitch - seatedPitch) * SEATED_LERP;

  const pos  = SEAT_POS.pos;
  const look = SEAT_POS.look;
  // Derive the default yaw/pitch from SEAT_POS (chair → table center)
  const dx = look[0] - pos[0], dy = look[1] - pos[1], dz = look[2] - pos[2];
  const len = Math.hypot(dx, dy, dz) || 1;
  const basePitch = Math.asin(dy / len);
  const baseYaw   = Math.atan2(dx, -dz);

  const yaw   = baseYaw   + seatedYaw;
  const pitch = basePitch + seatedPitch;
  const d = 2.5;

  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(
    pos[0] + Math.sin(yaw) * Math.cos(pitch) * d,
    pos[1] + Math.sin(pitch) * d,
    pos[2] - Math.cos(yaw) * Math.cos(pitch) * d
  );
}

function updateHovered() {
  if (mode === MODES.TABLE) { tooltip && tooltip.classList.remove('show'); return; }
  raycaster.setFromCamera(mode === MODES.WALKING ? new THREE.Vector2(0, 0) : pointer, camera);
  const interactives = [];
  scene.traverse(o => { if (o.userData?.isInteractive) interactives.push(o); });
  // Raycast against meshes inside each group
  const meshes = [];
  interactives.forEach(g => g.traverse(m => { if (m.isMesh) { m.userData._group = g; meshes.push(m); } }));
  const hits = raycaster.intersectObjects(meshes, false);
  const obj = hits[0]?.object?.userData?._group || null;

  if (obj !== hoveredObj) {
    if (hoveredObj) {
      setObjectEmissive(hoveredObj, 0x000000);
      if (hoveredObj.userData.cardRef) setObjectEmissive(hoveredObj.userData.cardRef, 0x000000);
    }
    hoveredObj = obj;
    if (hoveredObj) {
      setObjectEmissive(hoveredObj, 0xffbf5c);
      if (hoveredObj.userData.cardRef) setObjectEmissive(hoveredObj.userData.cardRef, 0xffbf5c);
      canvas.style.cursor = 'pointer';
      if (tooltip) { tooltip.textContent = hoveredObj.userData.hoverLabel || ''; tooltip.classList.add('show'); }
    } else {
      canvas.style.cursor = '';
      if (tooltip) tooltip.classList.remove('show');
    }
  }
  // Position tooltip near cursor
  if (tooltip && hoveredObj && mode !== MODES.WALKING) {
    tooltip.style.left = ((pointer.x + 1) / 2 * window.innerWidth + 14) + 'px';
    tooltip.style.top  = ((-pointer.y + 1) / 2 * window.innerHeight + 14) + 'px';
  } else if (tooltip && hoveredObj && mode === MODES.WALKING) {
    tooltip.style.left = (window.innerWidth / 2 + 18) + 'px';
    tooltip.style.top  = (window.innerHeight / 2 + 18) + 'px';
  }
}

function setObjectEmissive(group, color) {
  group.traverse(o => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => {
      if ('emissive' in m) {
        m.emissive.setHex(color);
        m.emissiveIntensity = color === 0x000000 ? 0 : 0.3;
      }
    });
  });
}

function onPointerClick() {
  if (mode === MODES.TABLE || mode === MODES.INTRO) return;
  if (!hoveredObj) return;

  if (hoveredObj === chainObj) {
    toggleLights();
    return;
  }
  if (hoveredObj === chairObj) {
    if (mode === MODES.WALKING) pointerControls.unlock();
    takeSeat();
    return;
  }
  // Monitor or screen: if not at close-up yet, dolly to the front of the monitor.
  // If already at close-up, the SCREEN interprets the click as an OS click (icons/close box).
  if (hoveredObj.userData.isMonitor || hoveredObj.userData.isScreen) {
    const atCloseup = (mode === MODES.STATION && stationCloseup);
    console.log('[click:monitor/screen]', 'mode=', mode, 'currentStation=', currentStation, 'tweening=', stationTweening, 'closeup=', stationCloseup);
    if (stationTweening) return;

    if (atCloseup && hoveredObj.userData.isScreen) {
      // Already at the monitor — treat as OS click on the screen
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(hoveredObj, false);
      if (hits[0]?.uv) handleScreenClick(hoveredObj, hits[0].uv.x, hits[0].uv.y);
      return;
    }
    // Anywhere else — bring the camera to the monitor
    SFX.click();
    if (currentStation === 'about' || currentStation === 'experience') {
      enterCloseup();
    } else {
      enterStation('about');
    }
    return;
  }
  // Cards carry a route. Route has a 3D station → dolly to it; otherwise fall back to 2D.
  if (hoveredObj.userData.route) {
    const r = hoveredObj.userData.route;
    if (STATIONS[r]) {
      SFX.click();
      enterStation(r);
    } else {
      triggerPortal(r);
    }
    return;
  }
  if (hoveredObj.userData.portal) {
    triggerPortal(hoveredObj.userData.portal);
    return;
  }
}

function toggleLights() {
  SFX.chain();
  const bounce = chainObj.position.clone();
  const t0 = performance.now();
  (function anim() {
    const dt = (performance.now() - t0) / 1000;
    if (dt < 0.4) { chainObj.position.y = bounce.y - Math.sin(dt * Math.PI) * 0.12; requestAnimationFrame(anim); }
    else chainObj.position.copy(bounce);
  })();
  const target = lightsOn ? 0 : 1;
  let i = lightsOn ? 1 : 0;
  const steps = 16;
  (function fade() {
    i += (target === 1 ? 1 : -1);
    const k = i / steps;
    pendantLight.intensity = 7 * k;
    if (pendantBulb) pendantBulb.material.color.setRGB(Math.max(0.1, k), Math.max(0.06, 0.94 * k), Math.max(0.02, 0.72 * k));
    if (pendantGlow) pendantGlow.material.opacity = 0.85 * k;
    if (lampBeam) lampBeam.material.opacity = 0.06 * k;
    if ((target === 1 && i < steps) || (target === 0 && i > 0)) requestAnimationFrame(fade);
    else lightsOn = target === 1;
  })();
  // Void stays PURE BLACK regardless of light state
  scene.background = new THREE.Color(0x000000);
  scene.fog.color.setHex(0x000000);
}

/* ---------- Pulse a hover prompt ---------- */
function pulseObject(group, color) {
  if (!group) return;
  let t0 = performance.now();
  function pulse() {
    const dt = (performance.now() - t0) / 1000;
    const k = 0.5 + 0.5 * Math.sin(dt * 4);
    group.traverse(o => {
      if (o.isMesh && o.material && 'emissive' in o.material) {
        o.material.emissive.setHex(color);
        o.material.emissiveIntensity = 0.2 + k * 0.4;
      }
    });
    if (mode === MODES.INTRO && (group === chainObj ? introPhase === 'waitingChain' : introPhase === 'waitingSeat')) {
      requestAnimationFrame(pulse);
    } else {
      setObjectEmissive(group, 0x000000);
    }
  }
  pulse();
}

/* ---------- (legacy) Chain pull — kept as no-op ---------- */
function pullChain() {
  if (introPhase !== 'waitingChain') return;
  setTagline(null);
  SFX.chain();
  // Animate chain down then up
  const orig = chainObj.position.clone();
  const t0 = performance.now();
  function anim() {
    const dt = (performance.now() - t0) / 1000;
    if (dt < 0.5) { chainObj.position.y = orig.y - Math.sin(dt * Math.PI) * 0.15; requestAnimationFrame(anim); }
    else chainObj.position.copy(orig);
  }
  anim();
  // Turn on lights with fade
  let i = 0;
  const steps = 20;
  function fade() {
    i++; pendantLight.intensity = 7 * (i/steps);
    if (pendantBulb) pendantBulb.material.color.setRGB(1 * (i/steps), 0.94 * (i/steps), 0.72 * (i/steps));
    if (pendantGlow) pendantGlow.material.opacity = 0.85 * (i/steps);
    if (lampBeam) lampBeam.material.opacity = 0.06 * (i/steps);
    if (i < steps) requestAnimationFrame(fade);
    else lightsOn = true;
  }
  scene.background = new THREE.Color(0x2a1808);
  if (scene.fog) scene.fog.color.setHex(0x1a0d06);
  fade();
  setObjectEmissive(chainObj, 0x000000);
  // Continue cinematic: arc to chair
  phasePath = POST_CHAIN_PATH;
  phaseStart = performance.now()/1000;
  introPhase = 'arcing';
}

/* ---------- Station: dolly camera from seat → diorama, no 2D swap ---------- */
function tweenCameraTo(toPos, toLook, duration, onDone) {
  const fromPos = [camera.position.x, camera.position.y, camera.position.z];
  // Derive current look target from the camera's forward direction
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const fromLook = [
    camera.position.x + fwd.x * 3,
    camera.position.y + fwd.y * 3,
    camera.position.z + fwd.z * 3,
  ];
  const t0 = performance.now();
  (function step() {
    const k = easeInOutCubic(Math.min(1, (performance.now() - t0) / duration));
    camera.position.set(
      lerp(fromPos[0], toPos[0], k),
      lerp(fromPos[1], toPos[1], k),
      lerp(fromPos[2], toPos[2], k),
    );
    camera.lookAt(
      lerp(fromLook[0], toLook[0], k),
      lerp(fromLook[1], toLook[1], k),
      lerp(fromLook[2], toLook[2], k),
    );
    if (k < 1) requestAnimationFrame(step);
    else onDone?.();
  })();
}

function fadeStationLight(route, to, duration=900) {
  const light = stationLights[route];
  if (!light) return;
  const from = light.intensity;
  const t0 = performance.now();
  (function step() {
    const k = Math.min(1, (performance.now() - t0) / duration);
    light.intensity = from + (to - from) * k;
    if (k < 1) requestAnimationFrame(step);
  })();
}

function enterStation(name) {
  console.log('[enterStation]', name, 'aboutScreen?', !!aboutScreen, 'tweening?', stationTweening);
  if (stationTweening) return;
  const st = STATIONS[name];
  if (!st) { console.warn('[enterStation] no station config for', name); return; }
  if (mode === MODES.WALKING && pointerControls?.isLocked) pointerControls.unlock();
  stationTweening = true;
  mode = MODES.STATION;
  currentStation = name;
  hideSeatedHud(); hideCloseupHud(); hideStationHud();
  stationYaw = 0; stationPitch = 0;
  const lightKey = stationLights[name] ? name : 'about';
  fadeStationLight(lightKey, 4.2, 1200);

  // Render the initial file on the screen if the card specifies one
  if (st.initialPage && aboutScreen) {
    if (st.initialPage === 'desktop') renderScreenDesktop(aboutScreen);
    else renderScreenWindow(aboutScreen, st.initialPage);
    aboutScreen.userData.hoverLabel = '▸ CLICK A FILE';
  }

  // Go straight to the interactive close-up pose. No intermediate station view.
  const toPos  = st.closeupPos  || st.cameraPos;
  const toLook = st.closeupLook || st.cameraLook;
  stationCloseup = !!st.closeupPos;
  tweenCameraTo(toPos, toLook, 1800, () => {
    stationTweening = false;
    showCloseupHud();
  });
}

/* ---------- Second-level zoom: dolly up to the monitor for readable interaction ---------- */
function enterCloseup() {
  console.log('[enterCloseup] tweening?', stationTweening, 'closeup?', stationCloseup, 'currentStation:', currentStation);
  if (stationTweening || stationCloseup || !currentStation) return;
  const st = STATIONS[currentStation];
  if (!st || !st.closeupPos) { console.warn('[enterCloseup] missing closeupPos for', currentStation); return; }
  if (mode === MODES.WALKING && pointerControls?.isLocked) pointerControls.unlock();
  stationTweening = true;
  stationCloseup = true;
  hideStationHud();
  if (aboutScreen) aboutScreen.userData.hoverLabel = '▸ CLICK A FILE';
  tweenCameraTo(st.closeupPos, st.closeupLook, 1300, () => {
    stationTweening = false;
    showCloseupHud();
  });
}

function exitCloseup() {
  if (stationTweening || !currentStation) return;
  const st = STATIONS[currentStation];
  if (!st) return;
  stationTweening = true;
  stationCloseup = false;
  hideCloseupHud();
  if (aboutScreen) aboutScreen.userData.hoverLabel = '⌘ SIT AT COMPUTER';
  tweenCameraTo(st.cameraPos, st.cameraLook, 1100, () => {
    stationTweening = false;
    showStationHud(currentStation);
  });
}

function showCloseupHud() {
  let hud = document.getElementById('closeup-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'closeup-hud';
    hud.className = 'world-hud seated';
    hud.innerHTML = `<button class="world-btn" data-action="back-to-table">↩ BACK TO TABLE</button>`;
    document.body.appendChild(hud);
    hud.addEventListener('click', e => {
      if (e.target.closest('[data-action="back-to-table"]')) exitStation();
    });
  }
  hud.style.display = 'flex';
}
function hideCloseupHud() { const h = document.getElementById('closeup-hud'); if (h) h.style.display = 'none'; }

function exitStation() {
  if (stationTweening) return;
  stationTweening = true;
  stationCloseup = false;
  hideStationHud(); hideCloseupHud();
  if (aboutScreen) aboutScreen.userData.hoverLabel = '⌘ SIT AT COMPUTER';
  const leaving = currentStation;
  if (leaving) fadeStationLight(leaving, 0, 900);
  tweenCameraTo(SEAT_POS.pos, SEAT_POS.look, 1600, () => {
    stationTweening = false;
    currentStation = null;
    enterSeated(false); // back to table, cards already dealt
  });
}

function updateStationView() {
  if (stationTweening || !currentStation) return;
  const st = STATIONS[currentStation];
  if (stationCloseup) {
    // Close-up: camera locked to the screen, no parallax so the cursor stays stable over icons
    camera.position.set(...st.closeupPos);
    camera.lookAt(...st.closeupLook);
    return;
  }
  stationYaw   += (pointer.x * 0.18 - stationYaw)   * 0.04;
  stationPitch += (pointer.y * 0.10 - stationPitch) * 0.04;
  camera.position.set(...st.cameraPos);
  camera.lookAt(
    st.cameraLook[0] + stationYaw * 1.4,
    st.cameraLook[1] + stationPitch * 0.8,
    st.cameraLook[2],
  );
}

function showStationHud(name) {
  let hud = document.getElementById('station-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'station-hud';
    hud.className = 'world-hud seated'; // reuse bottom-center flex layout
    hud.innerHTML = `<button class="world-btn" data-action="back-to-table">↩ BACK TO TABLE</button>`;
    document.body.appendChild(hud);
    hud.addEventListener('click', e => {
      if (e.target.closest('[data-action="back-to-table"]')) exitStation();
    });
  }
  hud.style.display = 'flex';
}
function hideStationHud() { const h = document.getElementById('station-hud'); if (h) h.style.display = 'none'; }

/* ---------- Take seat (from any mode) ---------- */
function takeSeat() {
  setTagline(null);
  SFX.chair();
  if (chairObj) setObjectEmissive(chairObj, 0x000000);
  introPhase = 'descending';
  // Smooth lerp to SEAT_POS, then deal cards, then show seated UI
  const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const to   = { x: SEAT_POS.pos[0], y: SEAT_POS.pos[1], z: SEAT_POS.pos[2] };
  const t0 = performance.now();
  const DUR = 1500;
  function step() {
    const dt = performance.now() - t0;
    const k = easeInOutCubic(Math.min(1, dt / DUR));
    camera.position.set(lerp(from.x, to.x, k), lerp(from.y, to.y, k), lerp(from.z, to.z, k));
    camera.lookAt(SEAT_POS.look[0], SEAT_POS.look[1], SEAT_POS.look[2]);
    if (dt < DUR) requestAnimationFrame(step);
    else { enterSeated(true); }
  }
  step();
}

/* ---------- Seated mode ---------- */
function enterSeated(deal=false) {
  mode = MODES.SEATED;
  seatedYaw = seatedPitch = 0;
  seatedTargetYaw = seatedTargetPitch = 0;
  camera.position.set(...SEAT_POS.pos);
  camera.lookAt(...SEAT_POS.look);
  hideIntroTitle();
  showIntroOverlayFor3D();
  showSeatedHud();
  if (deal) dealCards();
}

function dealCards() {
  // y=0.888 puts the card (0.012 thick) just above the felt at 0.88, touching it flush.
  const TARGETS = [
    [-0.55, 0.888,  0.30],
    [-0.27, 0.888,  0.48],
    [ 0.00, 0.888,  0.55],
    [ 0.27, 0.888,  0.48],
    [ 0.55, 0.888,  0.30],
  ];
  cards.forEach((card, i) => {
    const [tx, ty, tz] = TARGETS[i];
    const sx = card.position.x, sy = card.position.y, sz = card.position.z;
    card.userData.dealY = ty;
    setTimeout(() => {
      SFX.deal();
      const t0 = performance.now();
      const DUR = 450;
      function step() {
        const dt = performance.now() - t0;
        const k = easeOutExpo(Math.min(1, dt / DUR));
        card.position.x = lerp(sx, tx, k);
        card.position.y = lerp(sy, ty, k) + Math.sin(k * Math.PI) * 0.25;
        card.position.z = lerp(sz, tz, k);
        // Cards lie flat after the deal — no fan tilt
        card.rotation.set(0, 0, 0);
        if (dt < DUR) requestAnimationFrame(step);
        else {
          // Park the hitbox at the dealt position and flip it live so raycasts can find it.
          const hb = card.userData.hitbox;
          if (hb) {
            hb.position.set(tx, ty + 0.02, tz); // slightly proud of felt so ray hits it first
            hb.userData.isInteractive = true;
          }
        }
      }
      step();
    }, i * 180);
  });
}

/* ---------- Walking mode ---------- */
function enterWalking() {
  mode = MODES.WALKING;
  hideSeatedHud(); hideTableCam();
  showIntroOverlayFor3D();
  hideIntroTitle();
  if (introPhase === 'readyToWalk') {
    camera.position.set(...STANDING_POS);
    camera.lookAt(0, 1.0, 0);
  }
  showWalkStatus('entering walking...');
  try {
    pointerControls.lock();
    showWalkStatus('pointer.lock() called — if nothing happens, click once on the scene');
  } catch (e) {
    showWalkStatus('lock error: ' + e.message);
  }
}

function showWalkStatus(msg) {
  let el = document.getElementById('walk-status');
  if (!el) {
    el = document.createElement('div');
    el.id = 'walk-status';
    el.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(6,30,21,0.8);color:#daa520;font:10px ui-monospace,monospace;padding:6px 10px;z-index:99999;border-radius:4px;letter-spacing:0.05em;pointer-events:none;max-width:90vw;opacity:0.6;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
}
function exitWalking() {
  mode = MODES.SEATED;
  seatedYaw = seatedPitch = 0;
  seatedTargetYaw = seatedTargetPitch = 0;
  pointerControls.unlock();
  camera.position.set(...SEAT_POS.pos);
  camera.lookAt(...SEAT_POS.look);
  showSeatedHud();
  hideWalkingHud();
}

/* ---------- Portal transition to 2D route ---------- */
function triggerPortal(routeName) {
  SFX.click();
  // Briefly flash the object
  setObjectEmissive(hoveredObj, 0xffffff);
  setTimeout(() => setObjectEmissive(hoveredObj, 0x000000), 180);
  // Fade to black then navigate
  flashToNav(routeName);
}

function flashToNav(route) {
  // White fade veil
  let veil = document.getElementById('world-veil');
  if (!veil) {
    veil = document.createElement('div');
    veil.id = 'world-veil';
    veil.className = 'world-veil';
    document.body.appendChild(veil);
  }
  veil.style.opacity = '1';
  setTimeout(() => {
    // Swap to 2D table mode for home, else navigate via SPA
    if (route === 'home') {
      enterTableMode();
    } else {
      enterTableMode();
      setTimeout(() => { if (window.spaRouter) window.spaRouter.navigateTo(route); }, 40);
    }
    setTimeout(() => { veil.style.opacity = '0'; }, 500);
  }, 450);
}

/* ---------- Table (2D) mode ---------- */
function enterTableMode() {
  mode = MODES.TABLE;
  hideSeatedHud(); hideWalkingHud();
  finishIntroOverlay(); // hides 3D canvas, shows poker
  showTableCam();
}
function exitTableToSeated() {
  mode = MODES.SEATED;
  showIntroOverlayFor3D();
  document.body.classList.add('intro-playing');
  camera.position.set(...SEAT_POS.pos);
  camera.lookAt(...SEAT_POS.look);
  showSeatedHud();
  hideTableCam();
}

/* ============================================================= */
/*                         HUD CONTROLS                           */
/* ============================================================= */
function showSeatedHud() {
  let hud = document.getElementById('seated-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'seated-hud'; hud.className = 'world-hud seated';
    hud.innerHTML = `
      <button class="world-btn primary" data-action="play-hand">▶ PLAY HAND</button>
      <button class="world-btn" data-action="walk">⌖ EXPLORE ROOM</button>
    `;
    document.body.appendChild(hud);
    hud.addEventListener('click', e => {
      const a = e.target.closest('[data-action]')?.dataset.action;
      if (a === 'play-hand') flashToNav('home');
      if (a === 'walk') enterWalking();
    });
  }
  hud.style.display = 'flex';
}
function hideSeatedHud() { const h = document.getElementById('seated-hud'); if (h) h.style.display = 'none'; }
function showWalkingHud() {
  let hud = document.getElementById('walking-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'walking-hud'; hud.className = 'world-hud walking';
    hud.innerHTML = `
      <div class="crosshair"></div>
      <div class="walk-help">WASD · MOUSE · ESC TO SIT</div>
      <div class="click-label" id="world-click-label"></div>
    `;
    document.body.appendChild(hud);
  }
  hud.style.display = 'flex';
}
function hideWalkingHud() { const h = document.getElementById('walking-hud'); if (h) h.style.display = 'none'; }
function showTableCam() {
  let btn = document.getElementById('table-cam-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'table-cam-btn'; btn.className = 'mini table-cam-btn';
    btn.innerHTML = '↩ BACK TO ROOM';
    btn.addEventListener('click', () => exitTableToSeated());
    document.body.appendChild(btn);
  }
  btn.style.display = '';
}
function hideTableCam() { const b = document.getElementById('table-cam-btn'); if (b) b.style.display = 'none'; }

/* ============================================================= */
/*                         MATH                                   */
/* ============================================================= */
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10*t); }
