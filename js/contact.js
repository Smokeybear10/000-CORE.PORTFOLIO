// Contact page JavaScript for SPA

// Global variables for falling shapes
let fallingShapesInterval = null;
let fallingShapesInterval2 = null;
let fallingShapesRunning = false;
let globalRenderer = null;
let globalScene = null;
let globalCamera = null;
let activeMeshes = [];

// Initialize contact functionality
function initContact() {
  console.log('CONTACT JS: Starting contact initialization...');
  
  // Check if Three.js is available
  if (typeof THREE === 'undefined') {
    console.error('CONTACT JS: Three.js is not loaded!');
    return;
  } else {
    console.log('CONTACT JS: Three.js is available');
  }
  
  // Force show contact content
  const contactContent = document.getElementById('contact-content');
  if (contactContent) {
    console.log('CONTACT JS: Found contact content, forcing visibility...');
    contactContent.style.display = 'block';
    contactContent.style.opacity = '1';
    contactContent.style.visibility = 'visible';
    contactContent.style.pointerEvents = 'auto';
    contactContent.style.zIndex = '1000';
  } else {
    console.error('CONTACT JS: Contact content not found!');
  }
  
  // Wait a bit then setup functionality
  setTimeout(() => {
    console.log('CONTACT JS: Setting up contact buttons and falling shapes...');
    setupContactButtons();
    startFallingShapes();
    console.log('CONTACT JS: Contact functionality initialized successfully');
  }, 100);
}

// Setup contact button functionality
function setupContactButtons() {
  const contactButtons = document.querySelectorAll('.contact-btn');
  
  if (!contactButtons.length) {
    console.error('Contact buttons not found');
    return;
  }
  
  console.log('Setting up contact buttons for', contactButtons.length, 'buttons');
  
  contactButtons.forEach((button, index) => {
    const contactType = button.dataset.contact;
    console.log(`Setting up button ${index}: ${contactType}`);
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Contact button clicked:', contactType);
      
      // Handle different contact types
      switch(contactType) {
        case 'email':
          window.open('mailto:thomasou@sas.upenn.edu', '_blank');
          break;
        case 'linkedin':
          window.open('https://www.linkedin.com/in/thomasou2006', '_blank');
          break;
        case 'github':
          window.open('https://github.com/Smokeybear10', '_blank');
          break;
        default:
          console.log('Unknown contact type:', contactType);
      }
    });
    
    // Force pointer events
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
  });
}

// Start falling shapes animation
function startFallingShapes() {
  if (fallingShapesRunning) {
    console.log('CONTACT JS: Falling shapes already running, skipping...');
    return;
  }
  
  console.log('CONTACT JS: Starting complex falling 3D shapes...');
  console.log('CONTACT JS: THREE object:', typeof THREE);
  
  if (typeof THREE === 'undefined') {
    console.error('CONTACT JS: Three.js is not available for falling shapes!');
    return;
  }
  
  fallingShapesRunning = true;
  
  // Vaporwave color palette
  const vaporwaveColors = [
    '#ff00ff', '#00ffff', '#ff0080', '#8000ff', '#ffcc00', 
    '#00ff80', '#ff0040', '#4000ff', '#00ccff', '#ff3300'
  ];

  function createComplexFallingShape() {
    console.log('CONTACT JS: Creating new falling shape...');
    const fallingModel = document.createElement('div');
    fallingModel.className = 'falling-model';
    
    // Much bigger containers for larger shapes
    const containerSize = Math.max(180, Math.min(500, window.innerWidth * 0.24));
    fallingModel.style.width = containerSize + 'px';
    fallingModel.style.height = containerSize + 'px';
    
    // Random position
    const leftPosition = Math.random() * (window.innerWidth - containerSize);
    fallingModel.style.left = leftPosition + 'px';
    fallingModel.style.top = '-' + (containerSize + 50) + 'px';
    
    // Create canvas for Three.js
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.filter = 'drop-shadow(0 0 140px rgba(255, 255, 255, 1.0))';
    fallingModel.appendChild(canvas);
    
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(containerSize, containerSize);
    
    // Colored axis lighting setup (optimized for visibility)
    const ambientLight = new THREE.AmbientLight(0x202020, 0.1);
    scene.add(ambientLight);
    
    // X-axis lights - Magenta
    const xLightPos = new THREE.DirectionalLight(0xff00ff, 0.8);
    xLightPos.position.set(1, 0, 0);
    scene.add(xLightPos);
    
    const xLightNeg = new THREE.DirectionalLight(0xff00ff, 0.8);
    xLightNeg.position.set(-1, 0, 0);
    scene.add(xLightNeg);
    
    // Y-axis lights - Cyan
    const yLightPos = new THREE.DirectionalLight(0x00ffff, 0.8);
    yLightPos.position.set(0, 1, 0);
    scene.add(yLightPos);
    
    const yLightNeg = new THREE.DirectionalLight(0x00ffff, 0.8);
    yLightNeg.position.set(0, -1, 0);
    scene.add(yLightNeg);
    
    // Z-axis lights - Gold
    const zLightPos = new THREE.DirectionalLight(0xffff00, 0.8);
    zLightPos.position.set(0, 0, 1);
    scene.add(zLightPos);
    
    const zLightNeg = new THREE.DirectionalLight(0xffff00, 0.8);
    zLightNeg.position.set(0, 0, -1);
    scene.add(zLightNeg);
    
    // Create simple 3D shapes
    const shapeType = Math.floor(Math.random() * 5);
    const baseColor = vaporwaveColors[Math.floor(Math.random() * vaporwaveColors.length)];
    
    // Angular 3D geometries (no round shapes)
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),                    // Cube
      new THREE.OctahedronGeometry(0.7),               // Octahedron
      new THREE.TetrahedronGeometry(0.8),              // Tetrahedron/Pyramid
      new THREE.IcosahedronGeometry(0.6),              // Icosahedron
      new THREE.DodecahedronGeometry(0.6)              // Dodecahedron
    ];
    
    const geometry = geometries[shapeType];
    
    // Use standard material that responds to lights
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      specular: 0x222222
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Scale based on screen width for responsive sizing (smaller overall)
    const baseScale = Math.max(1.4, Math.min((window.innerWidth / 1920) * 2.5, 2.0)); // Min 1.4, Max 2.0
    const randomScale = 0.8 + Math.random() * 1.2; // Random variation (0.8-2.0)
    const finalScale = Math.max(4.0, baseScale * randomScale); // Minimum final size of 4.0
    mesh.scale.setScalar(finalScale);
    
    scene.add(mesh);
    // Move camera further back to make shapes appear smaller in bigger containers
    camera.position.z = 5;
    
    // Animation loop with rotation
    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);
      
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      mesh.rotation.z += 0.004;
      
      renderer.render(scene, camera);
    }
    animate();
    
    console.log('CONTACT JS: Adding falling shape to contact content...');
    const contactContent = document.getElementById('contact-content');
    if (contactContent) {
      contactContent.appendChild(fallingModel);
    } else {
      console.error('CONTACT JS: Contact content not found, cannot add falling shape');
      return;
    }
    
    // Fall animation with random fade out point
    const fallDuration = 8 + Math.random() * 4;
    const fadeStartPercent = 40 + Math.random() * 35; // Random between 40% and 75%
    const uniqueId = 'fall-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create unique keyframe animation for this shape
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes ${uniqueId} {
        0% {
          transform: translateY(-150px) rotate(0deg);
          opacity: 1;
        }
        ${fadeStartPercent}% {
          transform: translateY(${fadeStartPercent}vh) rotate(${fadeStartPercent * 3.6}deg);
          opacity: 1;
        }
        100% {
          transform: translateY(calc(100vh + 150px)) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    fallingModel.style.animation = `${uniqueId} ${fallDuration}s linear forwards`;
    
    // Cleanup
    setTimeout(() => {
      if (fallingModel.parentNode) {
        cancelAnimationFrame(animationId);
        fallingModel.parentNode.removeChild(fallingModel);
      }
    }, fallDuration * 1000);
  }

  // Start complex falling shapes with delays
  console.log('CONTACT JS: Setting up falling shapes intervals...');
  setTimeout(() => {
    console.log('CONTACT JS: Creating first falling shape...');
    createComplexFallingShape();
    setTimeout(() => {
      console.log('CONTACT JS: Creating second falling shape...');
      createComplexFallingShape();
    }, 800);
    
    fallingShapesInterval = setInterval(() => {
      createComplexFallingShape();
    }, 2000 + Math.random() * 2000);
    
    fallingShapesInterval2 = setInterval(() => {
      if (Math.random() < 0.6) {
        createComplexFallingShape();
      }
    }, 3500);
  }, 1000);
}

// Stop falling shapes animation
function stopFallingShapes() {
  console.log('CONTACT JS: Stopping falling shapes');
  if (fallingShapesInterval) {
    clearInterval(fallingShapesInterval);
    fallingShapesInterval = null;
  }
  if (fallingShapesInterval2) {
    clearInterval(fallingShapesInterval2);
    fallingShapesInterval2 = null;
  }
  fallingShapesRunning = false;
  
  // Clean up any existing falling shapes from contact content specifically
  const contactContent = document.getElementById('contact-content');
  if (contactContent) {
    const existingShapes = contactContent.querySelectorAll('.falling-model');
    console.log('CONTACT JS: Cleaning up', existingShapes.length, 'falling shapes');
    existingShapes.forEach(shape => {
      if (shape.parentNode) {
        shape.parentNode.removeChild(shape);
      }
    });
  }
  
  // Also clean up any that might be in body (safety cleanup)
  const bodyShapes = document.querySelectorAll('.falling-model');
  bodyShapes.forEach(shape => {
    if (shape.parentNode) {
      shape.parentNode.removeChild(shape);
    }
  });
}

// Cleanup function
function cleanupContact() {
  console.log('Cleaning up contact functionality');
  stopFallingShapes();
}

// Export for SPA system
window.contactRoute = {
  init: initContact,
  cleanup: cleanupContact
};