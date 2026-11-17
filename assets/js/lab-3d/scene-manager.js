/* ==========================================================================
   MECHPLANT - GESTOR DE ESCENA 3D INDUSTRIAL (scene-manager.js)
   Requiere Three.js y OrbitControls cargados en visor-3d.html
   ========================================================================== */

window.MECHPLANT_3D_SCENE = (function () {
  let scene, camera, renderer, controls, container;
  let animationFrameId = null;
  let onTickCallbacks = [];

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container || typeof THREE === "undefined") {
      console.error("MECHPLANT 3D: Contenedor o librería THREE no disponibles.");
      return null;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Escena con fondo oscuro de laboratorio técnico
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B192C);
    scene.fog = new THREE.FogExp2(0x0B192C, 0.035);

    // 2. Cámara en perspectiva
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    camera.position.set(5.5, 3.8, 6.2);

    // 3. Renderizador WebGL con antialiasing y mapeo de tonos
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Controles Orbitales (Rotar, Zoom, Pan)
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 1.8;
      controls.maxDistance = 22;
      controls.target.set(0, 1.0, 0);
      controls.update();
    }

    // 5. Iluminación Técnica de Taller / Estudio CAD
    const hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x1E293B, 0.85);
    hemiLight.position.set(0, 12, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.25);
    keyLight.position.set(6, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0095D9, 0.65);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // 6. Retícula CAD de referencia en el piso
    const gridHelper = new THREE.GridHelper(16, 32, 0x0095D9, 0x1E3A5F);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Responsividad al redimensionar ventana
    window.addEventListener("resize", handleResize);

    // Iniciar ciclo de renderizado
    animate();

    return { scene, camera, renderer, controls };
  }

  function handleResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (controls) controls.update();
    onTickCallbacks.forEach(fn => fn());
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function onTick(callback) {
    if (typeof callback === "function") {
      onTickCallbacks.push(callback);
    }
  }

  function setCameraPreset(preset) {
    if (!camera || !controls) return;
    const presets = {
      isometric: { pos: [5.5, 3.8, 6.2], target: [0, 1.0, 0] },
      front:     { pos: [0, 1.4, 7.5],   target: [0, 1.0, 0] },
      side:      { pos: [7.5, 1.4, 0],   target: [0, 1.0, 0] },
      top:       { pos: [0, 8.2, 0.01],  target: [0, 0.8, 0] }
    };
    const p = presets[preset] || presets.isometric;
    camera.position.set(...p.pos);
    controls.target.set(...p.target);
    controls.update();
  }

  function getContext() {
    return { scene, camera, renderer, controls, container };
  }

  return {
    init,
    onTick,
    setCameraPreset,
    getContext
  };
})();
