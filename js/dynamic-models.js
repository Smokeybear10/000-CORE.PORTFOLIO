// Dynamic 3D Model System
document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('model-canvas');
  const container = document.getElementById('model-container');
  
  if (!canvas || !container) return;
  
  // Model file mapping
  const modelFiles = {
    'projects': 'Models/Projects.glb',
    'experience': 'Models/Experience.glb',
    'about': 'Models/About.glb',
    'contact': 'Models/Contact.glb'
  };
  
  let currentScene = null;
  let currentRenderer = null;
  let currentCamera = null;
  let currentModel = null;
  let animationId = null;
  
  // Function to load and display a model
  window.loadAndShowModel = async function(modelType) {
    console.log(`Loading model: ${modelType}`);

    // Clear existing scene and animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Properly dispose of current model
    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      currentModel = null;
    }

    // Clear the scene completely
    if (currentScene) {
      while(currentScene.children.length > 0) {
        const child = currentScene.children[0];
        currentScene.remove(child);
      }
    }
    
    try {
      // Import Three.js modules
      const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, MeshPhongMaterial, Box3, Vector3, ShaderMaterial, Color, BoxGeometry, Mesh } = await import('three');
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      
      // Create new scene if needed
      if (!currentScene) {
        currentScene = new Scene();
        currentCamera = new PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        currentRenderer = new WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        
        currentRenderer.setSize(container.offsetWidth, container.offsetHeight);
        currentRenderer.setPixelRatio(window.devicePixelRatio);
        currentRenderer.setClearColor(0x000000, 0);
        
        // Camera position - angled view
        currentCamera.position.x = 12;
        currentCamera.position.y = 8;
        currentCamera.position.z = 15;
      }
      
      // Add lighting for glow effect
      const ambientLight = new AmbientLight(0x1a0d2e, 0.6);
      currentScene.add(ambientLight);
       
      const directionalLight = new DirectionalLight(0xcc66cc, 0.5);
      directionalLight.position.set(8, 8, 8);
      currentScene.add(directionalLight);
       
      const directionalLight2 = new DirectionalLight(0x66cccc, 0.3);
      directionalLight2.position.set(-8, -8, 8);
      currentScene.add(directionalLight2);
       
      const directionalLight3 = new DirectionalLight(0xcc6699, 0.25);
      directionalLight3.position.set(0, 12, -8);
      currentScene.add(directionalLight3);
       
      const fillLight = new DirectionalLight(0xcccccc, 0.3);
      fillLight.position.set(0, -12, 0);
      currentScene.add(fillLight);
      
      // Load model
      const loader = new GLTFLoader();
      const modelFile = modelFiles[modelType] || modelFiles['projects'];
      
      console.log(`Attempting to load: ${modelFile}`);
      console.log(`Full URL: ${new URL(modelFile, window.location.href).href}`);
      
      loader.load(
        modelFile,
        function (gltf) {
          console.log(`${modelType} model loaded successfully`);
          currentModel = gltf.scene;
          
          // Center and scale model
          const box = new Box3().setFromObject(currentModel);
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3());
          
          // Position model with projects-specific adjustment
          currentModel.position.sub(center);
          
          // Set position based on model type
          if (modelType === 'projects') {
            currentModel.position.y = -15; // Set projects model to specific low position
          } else {
            currentModel.position.y -= 3; // General downward movement for other models
          }
          
          const maxDim = Math.max(size.x, size.y, size.z);
          let scale = 20 / maxDim;
          
          // Adjust scale based on model type
          if (modelType === 'experience') {
            scale = 25 / maxDim; // Make experience bigger
          } else if (modelType === 'about') {
            scale = 15 / maxDim; // Make about smaller
          }
          
          currentModel.scale.setScalar(scale);
          
          // Set camera lookAt based on model type
          if (modelType === 'projects') {
            currentCamera.lookAt(0, 3, 0); // Look down more for projects
          } else {
            currentCamera.lookAt(0, 3, 0); // Normal lookAt for other models
          }
          
          // Apply face-based glow material for letter distinction
          const faceGlowMaterial = new ShaderMaterial({
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
                
                // Create gradient alternation
                float gradientShift = sin(time * 2.0) * 0.5 + 0.5;
                faceColor = mix(faceColor, altColor, gradientShift);
                
                // Edge glow effect matching cube
                float edge = 1.0 - max(max(abs(vNormal.x), abs(vNormal.y)), abs(vNormal.z));
                edge = pow(edge, 2.0);
                
                // Final color matching cube
                vec3 finalColor = faceColor + edge * vec3(1.0) * 0.8;
                
                gl_FragColor = vec4(finalColor, 1.0);
              }
            `,
            transparent: false
          });
          
          currentModel.traverse((child) => {
            if (child.isMesh) {
              child.material = faceGlowMaterial.clone();
            }
          });
          
          currentScene.add(currentModel);
          
          // Start animation
          let time = 0;
          function animate() {
            animationId = requestAnimationFrame(animate);
            time += 0.01;
            
            if (currentModel) {
              currentModel.rotation.y = time;
              currentModel.position.y = Math.sin(time * 0.4) * 0.2;
              
              currentModel.traverse((child) => {
                if (child.isMesh && child.material.uniforms) {
                  child.material.uniforms.time.value = time;
                }
              });
            }
            
            currentRenderer.render(currentScene, currentCamera);
          }
          animate();
        },
        function (progress) {
          console.log(`Loading ${modelType}:`, (progress.loaded / progress.total * 100) + '%');
        },
        function (error) {
          console.error(`Error loading ${modelType} model:`, error);
          console.error(`Failed URL: ${new URL(modelFile, window.location.href).href}`);
          console.error(`Model file: ${modelFile}`);
          console.error(`Model type: ${modelType}`);
          
          // Try to provide more specific error information
          if (error.target) {
            console.error(`HTTP Status: ${error.target.status}`);
            console.error(`HTTP Status Text: ${error.target.statusText}`);
          }
        }
      );
    } catch (error) {
      console.error('Error in loadAndShowModel:', error);
    }
  };
  
});