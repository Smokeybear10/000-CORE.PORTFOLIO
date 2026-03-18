// Contact page JavaScript for SPA
import * as THREE from 'three';

let fallingShapesInterval = null;
let fallingShapesInterval2 = null;
let fallingShapesRunning = false;
let fallingShapesStartTimeout = null;
let fallingShapeBurstTimeouts = [];
let contactInitTimeout = null;
let contactButtonCleanupFns = [];
let activeFallingShapes = [];

// Shared renderer to avoid WebGL context exhaustion
let sharedRenderer = null;
let sharedScene = null;
let sharedCamera = null;
let sharedAnimationId = null;

function clearContactButtonHandlers() {
  contactButtonCleanupFns.forEach((cleanupFn) => cleanupFn());
  contactButtonCleanupFns = [];
}

function disposeFallingShape(shapeRecord) {
  if (!shapeRecord || shapeRecord.disposed) return;
  shapeRecord.disposed = true;

  if (shapeRecord.removalTimeoutId) {
    clearTimeout(shapeRecord.removalTimeoutId);
    shapeRecord.removalTimeoutId = null;
  }

  if (shapeRecord.styleSheet?.parentNode) {
    shapeRecord.styleSheet.parentNode.removeChild(shapeRecord.styleSheet);
  }

  if (shapeRecord.element?.parentNode) {
    shapeRecord.element.parentNode.removeChild(shapeRecord.element);
  }

  if (shapeRecord.geometry?.dispose) shapeRecord.geometry.dispose();
  if (shapeRecord.material?.dispose) shapeRecord.material.dispose();
  if (shapeRecord.mesh && sharedScene) sharedScene.remove(shapeRecord.mesh);

  activeFallingShapes = activeFallingShapes.filter((s) => s !== shapeRecord);
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

function ensureSharedRenderer() {
  if (sharedRenderer) return;
  const canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  document.body.appendChild(canvas);
  sharedRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  sharedRenderer.setPixelRatio(1);
}

function startFallingShapes() {
  if (fallingShapesRunning) return;
  fallingShapesRunning = true;
  ensureSharedRenderer();

  const vaporwaveColors = [
    '#00ffff', '#00e5ff', '#00ccff', '#00b7ff', '#ffcc00',
    '#00ff80', '#00aaff', '#00ccff', '#00ccff', '#ff3300'
  ];

  function createComplexFallingShape() {
    const fallingModel = document.createElement('div');
    fallingModel.className = 'falling-model';

    const containerSize = Math.max(180, Math.min(500, window.innerWidth * 0.24));
    fallingModel.style.width = containerSize + 'px';
    fallingModel.style.height = containerSize + 'px';

    const leftPosition = Math.random() * (window.innerWidth - containerSize);
    fallingModel.style.left = leftPosition + 'px';
    fallingModel.style.top = '-' + (containerSize + 50) + 'px';

    const canvas = document.createElement('canvas');
    canvas.width = containerSize;
    canvas.height = containerSize;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.filter = 'drop-shadow(0 0 140px rgba(255, 255, 255, 1.0))';
    fallingModel.appendChild(canvas);

    // Use a dedicated offscreen renderer per shape, but limit total active shapes
    if (activeFallingShapes.length >= 6) {
      const oldest = activeFallingShapes[0];
      disposeFallingShape(oldest);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(containerSize, containerSize);

    const ambientLight = new THREE.AmbientLight(0x202020, 0.1);
    scene.add(ambientLight);

    const lights = [
      [0x00ffff, [1, 0, 0]], [0x00ffff, [-1, 0, 0]],
      [0x00ffff, [0, 1, 0]], [0x00ffff, [0, -1, 0]],
      [0xffff00, [0, 0, 1]], [0xffff00, [0, 0, -1]]
    ];
    lights.forEach(([color, pos]) => {
      const light = new THREE.DirectionalLight(color, 0.8);
      light.position.set(...pos);
      scene.add(light);
    });

    const shapeType = Math.floor(Math.random() * 5);
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(0.7),
      new THREE.TetrahedronGeometry(0.8),
      new THREE.IcosahedronGeometry(0.6),
      new THREE.DodecahedronGeometry(0.6)
    ];
    const geometry = geometries[shapeType];

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      specular: 0x222222
    });

    const mesh = new THREE.Mesh(geometry, material);
    const baseScale = Math.max(1.4, Math.min((window.innerWidth / 1920) * 2.5, 2.0));
    const randomScale = 0.8 + Math.random() * 1.2;
    const finalScale = Math.max(4.0, baseScale * randomScale);
    mesh.scale.setScalar(finalScale);
    scene.add(mesh);
    camera.position.z = 5;

    const shapeRecord = {
      element: fallingModel,
      renderer,
      geometry,
      material,
      mesh,
      scene,
      camera,
      styleSheet: null,
      animationId: null,
      removalTimeoutId: null,
      disposed: false
    };
    activeFallingShapes.push(shapeRecord);

    function animate() {
      if (shapeRecord.disposed) return;
      shapeRecord.animationId = requestAnimationFrame(animate);
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      mesh.rotation.z += 0.004;
      renderer.render(scene, camera);
    }
    animate();

    const contactContent = document.getElementById('contact-content');
    if (contactContent) {
      contactContent.appendChild(fallingModel);
    } else {
      disposeFallingShape(shapeRecord);
      return;
    }

    const fallDuration = 8 + Math.random() * 4;
    const fadeStartPercent = 40 + Math.random() * 35;
    const uniqueId = 'fall-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes ${uniqueId} {
        0% { transform: translateY(-150px) rotate(0deg); opacity: 1; }
        ${fadeStartPercent}% { transform: translateY(${fadeStartPercent}vh) rotate(${fadeStartPercent * 3.6}deg); opacity: 1; }
        100% { transform: translateY(calc(100vh + 150px)) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
    shapeRecord.styleSheet = styleSheet;
    fallingModel.style.animation = `${uniqueId} ${fallDuration}s linear forwards`;

    shapeRecord.removalTimeoutId = setTimeout(() => {
      disposeFallingShape(shapeRecord);
    }, fallDuration * 1000);
  }

  fallingShapesStartTimeout = setTimeout(() => {
    fallingShapesStartTimeout = null;
    createComplexFallingShape();
    const burstTimeoutId = setTimeout(() => {
      fallingShapeBurstTimeouts = fallingShapeBurstTimeouts.filter((id) => id !== burstTimeoutId);
      createComplexFallingShape();
    }, 800);
    fallingShapeBurstTimeouts.push(burstTimeoutId);

    // Use setTimeout chains instead of setInterval with Math.random() so delay varies each time
    function scheduleNext() {
      if (!fallingShapesRunning) return;
      const delay = 2000 + Math.random() * 2000;
      fallingShapesInterval = setTimeout(() => {
        createComplexFallingShape();
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    function scheduleSecondary() {
      if (!fallingShapesRunning) return;
      fallingShapesInterval2 = setTimeout(() => {
        if (Math.random() < 0.6) createComplexFallingShape();
        scheduleSecondary();
      }, 3500);
    }
    scheduleSecondary();
  }, 1000);
}

function stopFallingShapes() {
  if (contactInitTimeout) { clearTimeout(contactInitTimeout); contactInitTimeout = null; }
  if (fallingShapesStartTimeout) { clearTimeout(fallingShapesStartTimeout); fallingShapesStartTimeout = null; }
  fallingShapeBurstTimeouts.forEach((id) => clearTimeout(id));
  fallingShapeBurstTimeouts = [];
  if (fallingShapesInterval) { clearTimeout(fallingShapesInterval); fallingShapesInterval = null; }
  if (fallingShapesInterval2) { clearTimeout(fallingShapesInterval2); fallingShapesInterval2 = null; }
  fallingShapesRunning = false;
  activeFallingShapes.slice().forEach(disposeFallingShape);

  const contactContent = document.getElementById('contact-content');
  if (contactContent) {
    contactContent.querySelectorAll('.falling-model').forEach(shape => {
      if (shape.parentNode) shape.parentNode.removeChild(shape);
    });
  }
  document.querySelectorAll('.falling-model').forEach(shape => {
    if (shape.parentNode) shape.parentNode.removeChild(shape);
  });
}

function cleanupContact() {
  clearContactButtonHandlers();
  stopFallingShapes();
}

window.contactRoute = {
  init: initContact,
  cleanup: cleanupContact
};
