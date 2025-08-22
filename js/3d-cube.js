// 3D Cube Setup - Global variables for SPA routing
let cubeScene, cubeCamera, cubeRenderer, cube, cubeMaterial;
let cubeAnimationId;
let isCubeInitialized = false;

async function initializeCube() {
  const cubeCanvas = document.getElementById('cube-canvas');
  const cubeContainer = document.getElementById('cube-container');
  
  if (!cubeCanvas || !cubeContainer) {
    console.log('Cube elements not found');
    return;
  }

  try {
    // Import Three.js modules for cube
    const { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, Mesh, ShaderMaterial, Color } = await import('three');
    
    // Cube scene setup
    cubeScene = new Scene();
    cubeCamera = new PerspectiveCamera(75, cubeContainer.offsetWidth / cubeContainer.offsetHeight, 0.1, 1000);
    cubeRenderer = new WebGLRenderer({ canvas: cubeCanvas, alpha: true, antialias: true });
    
    cubeRenderer.setSize(cubeContainer.offsetWidth, cubeContainer.offsetHeight);
    cubeRenderer.setPixelRatio(window.devicePixelRatio);
    cubeRenderer.setClearColor(0x000000, 0);
    
    // Create vaporwave cube material
    cubeMaterial = new ShaderMaterial({
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
          // Distinct muted vaporwave colors
          vec3 magenta = vec3(0.7, 0.0, 0.7);
          vec3 cyan = vec3(0.0, 0.7, 0.8);
          vec3 pink = vec3(0.8, 0.0, 0.4);
          vec3 purple = vec3(0.4, 0.0, 0.8);
          
          // Face-based coloring with gradient alternation
          vec3 faceColor = magenta;
          vec3 altColor = cyan;
          
          if (abs(vNormal.x) > 0.9) {
            faceColor = cyan;
            altColor = pink;
          } else if (abs(vNormal.y) > 0.9) {
            faceColor = pink;
            altColor = purple;
          } else if (abs(vNormal.z) > 0.9) {
            faceColor = purple;
            altColor = magenta;
          }
          
          // Create slower gradient alternation
          float gradientShift = sin(time * 0.8) * 0.5 + 0.5;
          faceColor = mix(faceColor, altColor, gradientShift);
          
          // Edge glow effect
          float edge = 1.0 - max(max(abs(vNormal.x), abs(vNormal.y)), abs(vNormal.z));
          edge = pow(edge, 2.0);
          
          // Final color
          vec3 finalColor = faceColor + edge * vec3(1.0) * 0.8;
          
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      transparent: true
    });
    
    // Create cube geometry and mesh
    const cubeGeometry = new BoxGeometry(3, 3, 3);
    cube = new Mesh(cubeGeometry, cubeMaterial);
    cubeScene.add(cube);
    
    // Position camera - centered view
    cubeCamera.position.z = 8;
    cubeCamera.position.y = 0;
    
    // Animation loop for cube
    let cubeTime = 0;
    let isCubeVisible = true;
    
    function animateCube() {
      cubeAnimationId = requestAnimationFrame(animateCube);
      
      // Only animate when cube is visible
      if (isCubeVisible && cube && cubeMaterial) {
        cubeTime += 0.02;
        
        // Rotate cube
        cube.rotation.x = cubeTime * 0.5;
        cube.rotation.y = cubeTime * 0.8;
        cube.rotation.z = cubeTime * 0.3;
        
        // Floating motion
        cube.position.y = Math.sin(cubeTime * 0.6) * 0.5;
        cube.position.x = Math.cos(cubeTime * 0.4) * 0.3;
        
        // Update material with pulsing effect
        cubeMaterial.uniforms.time.value = cubeTime;
      }
      
      if (cubeRenderer && cubeScene && cubeCamera) {
        cubeRenderer.render(cubeScene, cubeCamera);
      }
    }
    
    // Make cube animation control accessible globally
    window.setCubeVisible = function(visible) {
      isCubeVisible = visible;
    };
    
    animateCube();
    
    // Handle resize for cube
    const handleResize = () => {
      if (cubeCamera && cubeRenderer && cubeContainer) {
        cubeCamera.aspect = cubeContainer.offsetWidth / cubeContainer.offsetHeight;
        cubeCamera.updateProjectionMatrix();
        cubeRenderer.setSize(cubeContainer.offsetWidth, cubeContainer.offsetHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    isCubeInitialized = true;
    console.log('3D Cube initialized successfully');
    
  } catch (error) {
    console.error('Error initializing cube scene:', error);
  }
}

// Global functions for SPA routing
window.init3DCube = async function() {
  if (!isCubeInitialized) {
    await initializeCube();
  }
};

window.cleanup3DCube = function() {
  if (cubeAnimationId) {
    cancelAnimationFrame(cubeAnimationId);
    cubeAnimationId = null;
  }
  
  if (cubeRenderer) {
    cubeRenderer.dispose();
  }
  
  if (cubeMaterial) {
    cubeMaterial.dispose();
  }
  
  cubeScene = null;
  cubeCamera = null;
  cubeRenderer = null;
  cube = null;
  cubeMaterial = null;
  isCubeInitialized = false;
  
  console.log('3D Cube cleaned up');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await initializeCube();
});