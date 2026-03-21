// Contact page JavaScript for SPA
import * as THREE from 'three';

// Button state
let contactInitTimeout = null;
let contactButtonCleanupFns = [];
let contactButtonRevealTimeouts = [];

// Falling shapes state — single renderer architecture
let renderer = null;
let scene = null;
let camera = null;
let canvasEl = null;
let glowCanvas = null;
let glowCtx = null;
let animationId = null;
let running = false;
let shapes = [];
let spawnTimers = [];
let resizeHandler = null;
let lastTime = 0;
// Shape palette (harmonized with site: dark bg, cyan/purple accents)
const SHAPE_COLORS = [
  { color: 0xffffff, weight: 40 },
  { color: 0x00e5ff, weight: 30 },
  { color: 0x8b5cf6, weight: 20 },
  { color: 0xccddff, weight: 10 },
];

function pickWeightedColor() {
  const totalWeight = SHAPE_COLORS.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of SHAPE_COLORS) {
    r -= entry.weight;
    if (r <= 0) return entry.color;
  }
  return 0xffffff;
}

function clearContactButtonHandlers() {
  contactButtonCleanupFns.forEach((cleanupFn) => cleanupFn());
  contactButtonCleanupFns = [];
}

function clearContactButtonRevealTimeouts() {
  contactButtonRevealTimeouts.forEach((id) => clearTimeout(id));
  contactButtonRevealTimeouts = [];
}

function initContact() {
  cleanupContact();

  const contactContent = document.getElementById('contact-content');
  if (contactContent) {
    contactContent.style.display = 'block';
    contactContent.style.opacity = '1';
    contactContent.style.visibility = 'visible';
    contactContent.style.pointerEvents = 'auto';
    contactContent.style.zIndex = '1000';
  }

  contactInitTimeout = setTimeout(() => {
    contactInitTimeout = null;
    setupContactButtons();
    startFallingShapes();
  }, 100);
}

function setupContactButtons() {
  const contactButtons = document.querySelectorAll('.contact-btn');
  if (!contactButtons.length) return;

  clearContactButtonHandlers();
  clearContactButtonRevealTimeouts();

  contactButtons.forEach((button) => {
    button.classList.remove('contact-btn-revealed');
  });

  const staggerDelayMs = 115;
  contactButtons.forEach((button, index) => {
    const timeoutId = setTimeout(() => {
      button.classList.add('contact-btn-revealed');
    }, index * staggerDelayMs);
    contactButtonRevealTimeouts.push(timeoutId);
  });

  contactButtons.forEach((button) => {
    const contactType = button.dataset.contact;

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      switch (contactType) {
        case 'email':
          window.open('mailto:thomasou@sas.upenn.edu', '_blank');
          break;
        case 'linkedin':
          window.open('https://www.linkedin.com/in/thomasou2006', '_blank');
          break;
        case 'github':
          window.open('https://github.com/Smokeybear10', '_blank');
          break;
      }
    };

    button.addEventListener('click', handleClick);
    contactButtonCleanupFns.push(() => button.removeEventListener('click', handleClick));
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
  });
}

// --- Falling shapes system (single-canvas architecture) ---

function createGeometry() {
  const type = Math.floor(Math.random() * 7);
  switch (type) {
    case 0: return new THREE.BoxGeometry(1, 1, 1);
    case 1: return new THREE.OctahedronGeometry(0.7);
    case 2: return new THREE.TetrahedronGeometry(0.8);
    case 3: return new THREE.IcosahedronGeometry(0.6);
    case 4: return new THREE.DodecahedronGeometry(0.6);
    case 5: return new THREE.TorusGeometry(0.5, 0.2, 8, 16);
    case 6: return new THREE.ConeGeometry(0.5, 1.0, 6);
    default: return new THREE.OctahedronGeometry(0.7);
  }
}

function createMaterial(color) {
  const roll = Math.random();
  if (roll < 0.60) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.85,
      metalness: 0.2,
      roughness: 0.3,
    });
  } else if (roll < 0.85) {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
  } else {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.8,
      metalness: 0.1,
      roughness: 0.4,
    });
  }
}

function spawnShape() {
  if (!scene || !running) return;

  const color = pickWeightedColor();
  const geometry = createGeometry();
  const material = createMaterial(color);
  const mesh = new THREE.Mesh(geometry, material);

  const baseSize = Math.max(30, Math.min(120, window.innerWidth * 0.06));
  const sizeMultiplier = 0.5 + Math.random() * 2.0;
  const size = baseSize * sizeMultiplier;
  mesh.scale.setScalar(size);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = (Math.random() - 0.5) * w;
  const y = h / 2 + size + 50;
  mesh.position.set(x, y, Math.random() * 10);

  scene.add(mesh);

  const baseOpacity = material.opacity;

  const record = {
    mesh,
    geometry,
    material,
    baseOpacity,
    size,
    startX: x,
    elapsed: 0,
    velocity: {
      y: -(60 + Math.random() * 90),
      rotX: (Math.random() - 0.5) * 0.04,
      rotY: (Math.random() - 0.5) * 0.04,
      rotZ: (Math.random() - 0.5) * 0.04,
    },
    driftAmplitude: 20 + Math.random() * 60,
    driftFrequency: 0.3 + Math.random() * 0.5,
    fadeStart: 0.5 + Math.random() * 0.3,
  };

  shapes.push(record);

  if (shapes.length > 8) {
    removeShape(shapes[0]);
  }
}

function removeShape(record) {
  if (!record) return;
  scene.remove(record.mesh);
  record.geometry.dispose();
  record.material.dispose();
  shapes = shapes.filter((s) => s !== record);
}

function updateShapes(dt) {
  const h = window.innerHeight;
  const bottom = -h / 2;

  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];

    s.elapsed += dt;
    s.mesh.position.y += s.velocity.y * dt;
    s.mesh.position.x = s.startX + Math.sin(s.elapsed * s.driftFrequency) * s.driftAmplitude;

    s.mesh.rotation.x += s.velocity.rotX;
    s.mesh.rotation.y += s.velocity.rotY;
    s.mesh.rotation.z += s.velocity.rotZ;

    const fadeZone = h * (1 - s.fadeStart);
    const distFromBottom = s.mesh.position.y - bottom;
    if (distFromBottom < fadeZone && fadeZone > 0) {
      const fadeProgress = 1 - distFromBottom / fadeZone;
      s.material.opacity = Math.max(0, s.baseOpacity * (1 - fadeProgress));
    }

    if (s.mesh.position.y < bottom - s.size - 50) {
      removeShape(s);
    }
  }
}

function animate(now) {
  if (!running) return;
  animationId = requestAnimationFrame(animate);

  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0.016;
  lastTime = now;

  updateShapes(dt);
  renderer.render(scene, camera);

  // Copy frame to glow canvas (CSS blur makes it a colored contour glow)
  if (glowCtx && canvasEl) {
    glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
    glowCtx.drawImage(canvasEl, 0, 0, glowCanvas.width, glowCanvas.height);
  }
}

function startFallingShapes() {
  if (running) return;
  running = true;

  const contactContent = document.getElementById('contact-content');
  if (!contactContent) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  // Glow canvas (behind, blurred copy of the scene)
  glowCanvas = document.createElement('canvas');
  glowCanvas.width = w;
  glowCanvas.height = h;
  glowCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-2;filter:blur(35px);opacity:0.6;';
  contactContent.appendChild(glowCanvas);
  glowCtx = glowCanvas.getContext('2d');

  // Main canvas (sharp shapes)
  canvasEl = document.createElement('canvas');
  canvasEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
  contactContent.appendChild(canvasEl);

  // Renderer (preserveDrawingBuffer needed for glow canvas copy)
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Orthographic camera (pixel-mapped, wide near/far to avoid clipping large shapes)
  camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -2000, 2000);
  camera.position.z = 0;

  // Scene + lighting
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x404060, 0.4));

  const cyanLight = new THREE.DirectionalLight(0x00e5ff, 0.7);
  cyanLight.position.set(1, 1, 1);
  scene.add(cyanLight);

  const purpleLight = new THREE.DirectionalLight(0x8b5cf6, 0.5);
  purpleLight.position.set(-1, -0.5, 0.5);
  scene.add(purpleLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(0, 0, 1);
  scene.add(fillLight);

  // Resize handler
  resizeHandler = () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    renderer.setSize(nw, nh);
    if (glowCanvas) {
      glowCanvas.width = nw;
      glowCanvas.height = nh;
    }
    camera.left = -nw / 2;
    camera.right = nw / 2;
    camera.top = nh / 2;
    camera.bottom = -nh / 2;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resizeHandler);

  // Start animation loop
  lastTime = 0;
  animationId = requestAnimationFrame(animate);

  // Spawn schedule
  const scheduleTimer = (fn, delay) => {
    const id = setTimeout(fn, delay);
    spawnTimers.push(id);
    return id;
  };

  scheduleTimer(() => {
    spawnShape();
    scheduleTimer(() => spawnShape(), 800);

    function scheduleNext() {
      if (!running) return;
      const delay = 2000 + Math.random() * 2000;
      scheduleTimer(() => {
        spawnShape();
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    function scheduleSecondary() {
      if (!running) return;
      scheduleTimer(() => {
        if (Math.random() < 0.6) spawnShape();
        scheduleSecondary();
      }, 3500);
    }
    scheduleSecondary();
  }, 1000);
}

function stopFallingShapes() {
  if (contactInitTimeout) { clearTimeout(contactInitTimeout); contactInitTimeout = null; }

  running = false;

  // Clear spawn timers
  spawnTimers.forEach((id) => clearTimeout(id));
  spawnTimers = [];

  // Cancel animation loop
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Dispose all shapes
  shapes.forEach((record) => {
    if (scene) scene.remove(record.mesh);
    record.geometry.dispose();
    record.material.dispose();
  });
  shapes = [];

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  // Remove canvases
  if (canvasEl && canvasEl.parentNode) {
    canvasEl.parentNode.removeChild(canvasEl);
    canvasEl = null;
  }
  if (glowCanvas && glowCanvas.parentNode) {
    glowCanvas.parentNode.removeChild(glowCanvas);
    glowCanvas = null;
    glowCtx = null;
  }

  // Remove resize listener
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }

  scene = null;
  camera = null;
  lastTime = 0;
}

function cleanupContact() {
  clearContactButtonRevealTimeouts();
  document.querySelectorAll('.contact-btn').forEach((btn) => {
    btn.classList.remove('contact-btn-revealed');
  });
  clearContactButtonHandlers();
  stopFallingShapes();
}

window.contactRoute = {
  init: initContact,
  cleanup: cleanupContact
};
