// 3D Cube Setup
let cubeScene, cubeCamera, cubeRenderer, cube, cubeMaterial;
let cubeAnimationId;
let isCubeInitialized = false;
let cubeResizeHandler = null;

const COLOR_SHADER = `
  vec3 cycleColor(float t) {
    vec3 colorA = vec3(0.92, 0.92, 0.92);
    vec3 colorB = vec3(0.1, 0.8, 0.9);
    vec3 colorC = vec3(0.7, 0.25, 0.85);

    float m = mod(t, 3.0);
    if (m < 1.0) return mix(colorA, colorB, m);
    else if (m < 2.0) return mix(colorB, colorC, m - 1.0);
    else return mix(colorC, colorA, m - 2.0);
  }
`;


async function initializeCube() {
  const cubeCanvas = document.getElementById('cube-canvas');
  const cubeContainer = document.getElementById('cube-container');

  if (!cubeCanvas || !cubeContainer) return;

  try {
    const { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, Mesh, ShaderMaterial } = await import('three');

    cubeScene = new Scene();
    cubeCamera = new PerspectiveCamera(75, cubeContainer.offsetWidth / cubeContainer.offsetHeight, 0.1, 1000);
    cubeRenderer = new WebGLRenderer({ canvas: cubeCanvas, alpha: true, antialias: true });

    cubeRenderer.setSize(cubeContainer.offsetWidth, cubeContainer.offsetHeight);
    cubeRenderer.setPixelRatio(window.devicePixelRatio);
    cubeRenderer.setClearColor(0x000000, 0);

    cubeMaterial = new ShaderMaterial({
      uniforms: { time: { value: 0.0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        ${COLOR_SHADER}
        void main() {
          float speed = 0.4;
          vec3 color = cycleColor(time * speed);
          if (abs(vNormal.x) > 0.9) color = cycleColor(time * speed + 1.0);
          else if (abs(vNormal.y) > 0.9) color = cycleColor(time * speed + 2.0);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false
    });

    const cubeGeometry = new BoxGeometry(3.6, 3.6, 3.6);
    cube = new Mesh(cubeGeometry, cubeMaterial);
    cubeScene.add(cube);

    cubeCamera.position.z = 8.5;
    cubeCamera.position.y = 0;

    let cubeTime = 0;
    let isCubeVisible = true;
    function animateCube() {
      cubeAnimationId = requestAnimationFrame(animateCube);

      if (isCubeVisible && cube && cubeMaterial) {
        cubeTime += 0.02;

        cube.rotation.x = cubeTime * 0.5;
        cube.rotation.y = cubeTime * 0.8;
        cube.rotation.z = cubeTime * 0.3;

        cubeMaterial.uniforms.time.value = cubeTime;

      }

      if (cubeRenderer && cubeScene && cubeCamera) {
        cubeRenderer.render(cubeScene, cubeCamera);
      }
    }

    window.setCubeVisible = function(visible) {
      isCubeVisible = visible;
    };

    animateCube();

    cubeResizeHandler = () => {
      if (cubeCamera && cubeRenderer && cubeContainer) {
        cubeCamera.aspect = cubeContainer.offsetWidth / cubeContainer.offsetHeight;
        cubeCamera.updateProjectionMatrix();
        cubeRenderer.setSize(cubeContainer.offsetWidth, cubeContainer.offsetHeight);
      }
    };

    window.addEventListener('resize', cubeResizeHandler);
    isCubeInitialized = true;

  } catch (error) {
    console.error('Error initializing cube scene:', error);
  }
}

window.init3DCube = async function() {
  if (!isCubeInitialized) await initializeCube();
};

window.cleanup3DCube = function() {
  if (cubeAnimationId) { cancelAnimationFrame(cubeAnimationId); cubeAnimationId = null; }
  if (cubeResizeHandler) {
    window.removeEventListener('resize', cubeResizeHandler);
    cubeResizeHandler = null;
  }
  if (cube && cube.geometry) cube.geometry.dispose();
  if (cubeMaterial) cubeMaterial.dispose();
  if (cubeRenderer) cubeRenderer.dispose();
  cubeScene = null; cubeCamera = null; cubeRenderer = null;
  cube = null; cubeMaterial = null;
  isCubeInitialized = false;
};
