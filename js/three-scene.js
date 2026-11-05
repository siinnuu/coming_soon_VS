/**
 * VISUALWOXX — 3D Scene Controller
 * Interactive WebGL background with floating glossy geometric objects,
 * dynamic studio lighting, and smooth mouse-driven parallax physics.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Check if Three.js is available
  if (typeof THREE === 'undefined') {
    // Fallback: Use subtle canvas 2D ambient particle drift
    initCanvas2DFallback(canvas);
    return;
  }

  // --- 1. Scene, Camera, Renderer Setup ---
  let scene, camera, renderer;
  let objects = [];
  let particles;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  let isTabActive = true;

  try {
    scene = new THREE.Scene();
    
    // Perspective Camera
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    // WebGL Renderer with transparency & antialias
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // --- 2. Dynamic Studio Lighting ---
    // Ambient Base
    const ambientLight = new THREE.AmbientLight(0x0e0014, 2.5);
    scene.add(ambientLight);

    // Primary Electric Magenta Key Light
    const magentaLight = new THREE.PointLight(0xEA00FF, 4.5, 60);
    magentaLight.position.set(-15, 12, 10);
    scene.add(magentaLight);

    // Specular Rim Light (Cool White / Cyan-tinted)
    const rimLight = new THREE.PointLight(0xffffff, 2.2, 50);
    rimLight.position.set(15, -10, 8);
    scene.add(rimLight);

    // Deep Purple Fill Light
    const fillLight = new THREE.PointLight(0x7b008c, 3.0, 50);
    fillLight.position.set(0, -15, 5);
    scene.add(fillLight);

    // --- 3. Premium 3D Floating Meshes ---
    // Materials
    const magentaGlossyMat = new THREE.MeshPhysicalMaterial({
      color: 0xEA00FF,
      emissive: 0x3d0047,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    const obsidianChromeMat = new THREE.MeshStandardMaterial({
      color: 0x121218,
      metalness: 0.95,
      roughness: 0.2,
      wireframe: false
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xEA00FF,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });

    // Mesh 1: Glossy Torus Knot (Top Left Ambient)
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.45, 100, 16);
    const knotMesh = new THREE.Mesh(knotGeo, magentaGlossyMat);
    knotMesh.position.set(-11, 6.5, -2);
    knotMesh.scale.set(0.9, 0.9, 0.9);
    knotMesh.rotationSpeed = { x: 0.004, y: 0.006, z: 0.002 };
    knotMesh.floatOffset = 0;
    knotMesh.baseY = 6.5;
    scene.add(knotMesh);
    objects.push(knotMesh);

    // Mesh 2: Obsidian Chrome Icosahedron (Top Right)
    const icoGeo = new THREE.IcosahedronGeometry(1.8, 0);
    const icoMesh = new THREE.Mesh(icoGeo, obsidianChromeMat);
    icoMesh.position.set(11.5, 7, -3);
    icoMesh.rotationSpeed = { x: -0.003, y: 0.005, z: 0.003 };
    icoMesh.floatOffset = 1.5;
    icoMesh.baseY = 7;
    scene.add(icoMesh);
    objects.push(icoMesh);

    // Wireframe Cage around Icosahedron
    const cageGeo = new THREE.IcosahedronGeometry(2.1, 0);
    const cageMesh = new THREE.Mesh(cageGeo, wireframeMat);
    icoMesh.add(cageMesh);

    // Mesh 3: Sleek Thin Ring / Torus (Bottom Left)
    const ringGeo = new THREE.TorusGeometry(2.0, 0.22, 16, 80);
    const ringMesh = new THREE.Mesh(ringGeo, magentaGlossyMat);
    ringMesh.position.set(-12, -7, -1);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.rotationSpeed = { x: 0.005, y: -0.004, z: 0.003 };
    ringMesh.floatOffset = 3.2;
    ringMesh.baseY = -7;
    scene.add(ringMesh);
    objects.push(ringMesh);

    // Mesh 4: Floating Octahedron (Bottom Right)
    const octGeo = new THREE.OctahedronGeometry(1.5, 0);
    const octMesh = new THREE.Mesh(octGeo, obsidianChromeMat);
    octMesh.position.set(12, -6.5, -2);
    octMesh.rotationSpeed = { x: -0.004, y: -0.006, z: 0.002 };
    octMesh.floatOffset = 4.8;
    octMesh.baseY = -6.5;
    scene.add(octMesh);
    objects.push(octMesh);

    // Octahedron inner core
    const coreGeo = new THREE.OctahedronGeometry(0.8, 0);
    const coreMesh = new THREE.Mesh(coreGeo, magentaGlossyMat);
    octMesh.add(coreMesh);

    // --- 4. Micro-Particle Starfield Dust ---
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0xEA00FF);
    const c2 = new THREE.Color(0xFFFFFF);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 35;
      positions[i + 2] = (Math.random() - 0.5) * 25 - 5;

      const chosenColor = Math.random() > 0.4 ? c1 : c2;
      colors[i] = chosenColor.r;
      colors[i + 1] = chosenColor.g;
      colors[i + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 5. Interactive Event Listeners ---
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      isTabActive = !document.hidden;
    });

    // Touch support for mobile gyro/touch parallax
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = (e.touches[0].clientX - windowHalfX) * 0.001;
        mouse.targetY = (e.touches[0].clientY - windowHalfY) * 0.001;
      }
    }, { passive: true });

    function onMouseMove(e) {
      mouse.targetX = (e.clientX - windowHalfX) * 0.0012;
      mouse.targetY = (e.clientY - windowHalfY) * 0.0012;
    }

    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Push meshes farther out or scale down on mobile so they stay ambient
      const isMobile = window.innerWidth < 768;
      const scaleFactor = isMobile ? 0.55 : 1.0;
      objects.forEach(obj => {
        obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
        obj.visible = !isMobile || window.innerWidth > 480; // keep particle field on small phones
      });
    }

    // Call once initially to establish screen-specific scaling
    onWindowResize();

    // --- 6. Render Animation Loop with Smooth Lerping ---
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isTabActive) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Parallax camera rotation
      camera.position.x = mouse.x * 6;
      camera.position.y = -mouse.y * 5;
      camera.lookAt(0, 0, 0);

      // Rotate and float meshes
      objects.forEach((obj, index) => {
        obj.rotation.x += obj.rotationSpeed.x;
        obj.rotation.y += obj.rotationSpeed.y;
        obj.rotation.z += obj.rotationSpeed.z;

        // Organic sin-wave floating
        obj.position.y = obj.baseY + Math.sin(time * 0.8 + obj.floatOffset) * 0.6;
      });

      // Slowly rotate particle field
      if (particles) {
        particles.rotation.y = time * 0.02;
        particles.rotation.x = time * 0.01;
      }

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.warn('[VisualWoxx 3D] WebGL setup failed, using 2D fallback:', err);
    initCanvas2DFallback(canvas);
  }

  // --- Fallback: Lightweight 2D Canvas Ambient Particle Engine ---
  function initCanvas2DFallback(cvs) {
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    let width = (cvs.width = window.innerWidth);
    let height = (cvs.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = cvs.width = window.innerWidth;
      height = cvs.height = window.innerHeight;
    });

    const dots = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.6,
      color: Math.random() > 0.4 ? 'rgba(234, 0, 255, 0.6)' : 'rgba(255, 255, 255, 0.45)'
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0) dot.x = width;
        if (dot.x > width) dot.x = 0;
        if (dot.y < 0) dot.y = height;
        if (dot.y > height) dot.y = 0;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

})();

