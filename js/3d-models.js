// 3D Model Setup - Global variables for SPA routing
let modelScene, modelCamera, modelRenderer, model;
let modelAnimationId;
let isModelsInitialized = false;

async function initializeModels() {
  const canvas = document.getElementById('model-canvas');
  const container = document.getElementById('model-container');
  
  if (!canvas || !container) {
    console.log('Model elements not found');
    return;
  }
  
  try {
    // Import Three.js modules
    const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, MeshPhongMaterial, Box3, Vector3, ShaderMaterial, Color, BoxGeometry, Mesh } = await import('three');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    
    // Scene setup
    modelScene = new Scene();
    modelCamera = new PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    modelRenderer = new WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    modelRenderer.setSize(container.offsetWidth, container.offsetHeight);
    modelRenderer.setPixelRatio(window.devicePixelRatio);
    modelRenderer.setClearColor(0x000000, 0);
    
    // Muted Vaporwave lighting setup
    const ambientLight = new AmbientLight(0x1a0d2e, 0.6);
    modelScene.add(ambientLight);
    
    // Main muted magenta light
    const directionalLight = new DirectionalLight(0xcc66cc, 0.5);
    directionalLight.position.set(8, 8, 8);
    modelScene.add(directionalLight);
    
    // Secondary muted cyan light
    const directionalLight2 = new DirectionalLight(0x66cccc, 0.3);
    directionalLight2.position.set(-8, -8, 8);
    modelScene.add(directionalLight2);
    
    // Accent muted pink light
    const directionalLight3 = new DirectionalLight(0xcc6699, 0.25);
    directionalLight3.position.set(0, 12, -8);
    modelScene.add(directionalLight3);
    
    // Fill light from below (muted white)
    const fillLight = new DirectionalLight(0xcccccc, 0.3);
    fillLight.position.set(0, -12, 0);
    modelScene.add(fillLight);
   
   // Load GLB model
   const loader = new GLTFLoader();
   
   console.log('Starting to load Projects.glb model...');
   console.log('Current location:', window.location.href);
   console.log('Attempting to load from:', new URL('Models/Projects.glb', window.location.href).href);
   loader.load(
      'Models/Projects.glb',
      function (gltf) {
        console.log('Model loaded successfully:', gltf);
        model = gltf.scene;
        window.projectsModel = model; // Make it globally accessible for debugging
        
        // Get bounding box to center and scale properly
        const box = new Box3().setFromObject(model);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());
        
        console.log('Model bounds:', { center, size });
        
        // Center the model and move it down
        model.position.sub(center);
        model.position.y -= 33; // Move projects model down significantly
        
        // Scale to be bigger
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 25 / maxDim;
        model.scale.setScalar(scale);
        
        console.log('Model scaled to:', scale);
        
        // Apply unlit vaporwave material - no lighting dependencies
        const vaporwaveMaterial = new ShaderMaterial({
          uniforms: {
            time: { value: 0.0 }
          },
          vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
              vPosition = position;
              vNormal = normal;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float time;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
              // Classic Vaporwave color palette
              vec3 magenta = vec3(1.0, 0.0, 1.0);      // #ff00ff
              vec3 cyan = vec3(0.0, 1.0, 1.0);         // #00ffff
              vec3 pink = vec3(1.0, 0.0, 0.5);         // #ff0080
              vec3 purple = vec3(0.5, 0.0, 1.0);       // #8000ff
              vec3 neonBlue = vec3(0.0, 0.5, 1.0);     // #0080ff
              vec3 neonGreen = vec3(0.0, 1.0, 0.5);    // #00ff80
              
              // Slower, more subtle patterns
              float pattern1 = sin(vPosition.x * 0.1 + time * 0.2) * 
                              sin(vPosition.y * 0.08 + time * 0.15) * 
                              sin(vPosition.z * 0.12 + time * 0.3);
              
              float pattern2 = cos(vPosition.x * 0.06 + time * 0.3) * 
                              cos(vPosition.y * 0.09 + time * 0.2) * 
                              cos(vPosition.z * 0.05 + time * 0.5);
              
              float pattern3 = sin(vPosition.x * 0.04 + time * 0.4) * 
                              cos(vPosition.y * 0.11 + time * 0.35) * 
                              sin(vPosition.z * 0.08 + time * 0.25);
              
              // Combine patterns for complex color mixing
              float combinedPattern = (pattern1 + pattern2 + pattern3) / 3.0;
              
              // Create multiple color layers that are always visible
              vec3 color1 = mix(magenta, cyan, (pattern1 + 1.0) * 0.5);
              vec3 color2 = mix(pink, purple, (pattern2 + 1.0) * 0.5);
              vec3 color3 = mix(neonBlue, neonGreen, (pattern3 + 1.0) * 0.5);
              
              // Always mix all colors - never just one
              vec3 baseColor = mix(color1, color2, sin(time * 0.8) * 0.5 + 0.5);
              baseColor = mix(baseColor, color3, cos(time * 1.2) * 0.5 + 0.5);
              
              // Add position-based color variation
              vec3 positionColor = mix(purple, pink, (vPosition.x + vPosition.y + vPosition.z) * 0.1);
              baseColor = mix(baseColor, positionColor, 0.4);
              
              // Add edge glow based on normal - like the cube image
              float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
              edge = pow(edge, 1.5);
              
              // Add subtle edge glow where faces meet
              float edgeGlow = 1.0 - abs(dot(vNormal, vec3(1.0, 0.0, 0.0)));
              edgeGlow = max(edgeGlow, 1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0))));
              edgeGlow = pow(edgeGlow, 2.0) * 0.6;
              
              // Add back-facing glow effect
              float backGlow = max(dot(vNormal, vec3(0.0, 0.0, -1.0)), 0.0);
              backGlow = pow(backGlow, 3.0) * 0.8; // Faint glow intensity
              
              // Add color cycling overlay
              float colorCycle1 = sin(time * 0.5) * 0.5 + 0.5;
              float colorCycle2 = cos(time * 0.7) * 0.5 + 0.5;
              vec3 cycleColor1 = mix(magenta, cyan, colorCycle1);
              vec3 cycleColor2 = mix(pink, purple, colorCycle2);
              
              // Final color with reduced intensity
              vec3 finalColor = baseColor * (1.0 + edge * 0.3) + 
                              cycleColor1 * 0.15 + 
                              cycleColor2 * 0.1;
              
              // Add subtle edge glow like the cube image
              vec3 edgeGlowColor = mix(cyan, magenta, sin(time * 0.4) * 0.5 + 0.5);
              finalColor += edgeGlowColor * edgeGlow * 0.2;
              
              // Add back glow effect
              vec3 backGlowColor = mix(magenta, cyan, sin(time * 0.3) * 0.5 + 0.5);
              finalColor += backGlowColor * backGlow * 0.5;
              
              // Ensure minimum brightness
              finalColor = max(finalColor, vec3(0.3));
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
          transparent: true,
          opacity: 1.0
        });
       
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = vaporwaveMaterial.clone();
          }
        });
       
       modelScene.add(model);
       console.log('Model added to scene successfully. Position:', model.position, 'Scale:', model.scale);
     },
     function (progress) {
       console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
     },
     function (error) {
       console.error('Error loading model:', error);
       console.error('Model path attempted:', 'Models/Projects.glb');
       console.error('Current location:', window.location.href);
     }
   );
   
   // Camera position - angled view
   modelCamera.position.x = 12;
   modelCamera.position.y = 8;
   modelCamera.position.z = 15;
   modelCamera.lookAt(0, 0, 0);
   console.log('Camera positioned at:', modelCamera.position);
   
   // Classic vaporwave animation loop
   let time = 0;
   let isShowingProjectsModel = false;
   
   function animate() {
     modelAnimationId = requestAnimationFrame(animate);
     time += 0.01;
     
     // Smooth rotation
     if (model) {
       model.rotation.y = time;
       
       // Gentle bobbing motion
       model.position.y = Math.sin(time * 0.4) * 0.2;
       
       // Update vaporwave animation
       model.traverse((child) => {
         if (child.isMesh && child.material.uniforms) {
           child.material.uniforms.time.value = time;
         }
       });
     }
     
     // Keep lights static
     directionalLight.intensity = 0.5;
     directionalLight2.intensity = 0.3;
     directionalLight3.intensity = 0.25;
     fillLight.intensity = 0.3;
     
     if (modelRenderer && modelScene && modelCamera) {
       modelRenderer.render(modelScene, modelCamera);
     }
   }
   
   // Make animation control accessible globally
   window.setProjectsModelVisible = function(visible) {
     isShowingProjectsModel = visible;
   };
  
  animate();
  
  // Handle window resize
  const handleResize = () => {
    if (modelCamera && modelRenderer && container) {
      modelCamera.aspect = container.offsetWidth / container.offsetHeight;
      modelCamera.updateProjectionMatrix();
      modelRenderer.setSize(container.offsetWidth, container.offsetHeight);
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  isModelsInitialized = true;
  console.log('3D Models initialized successfully');
  
} catch (error) {
  console.error('Error initializing 3D scene:', error);
}
}

// Global functions for SPA routing
window.init3DModels = async function() {
  if (!isModelsInitialized) {
    await initializeModels();
  }
};

window.cleanup3DModels = function() {
  if (modelAnimationId) {
    cancelAnimationFrame(modelAnimationId);
    modelAnimationId = null;
  }
  
  if (modelRenderer) {
    modelRenderer.dispose();
  }
  
  if (model && model.traverse) {
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.dispose();
      }
      if (child.geometry) {
        child.geometry.dispose();
      }
    });
  }
  
  modelScene = null;
  modelCamera = null;
  modelRenderer = null;
  model = null;
  isModelsInitialized = false;
  
  console.log('3D Models cleaned up');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await initializeModels();
});