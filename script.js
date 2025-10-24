let scene, camera, renderer, controls, cubes = [], rotating = false;

function startGame(level) {
  const menu = document.getElementById("menu");
  menu.style.opacity = "0";
  setTimeout(() => (menu.style.display = "none"), 1000);

  document.getElementById("controls").style.display = "flex";

  const bgMusic = document.getElementById("bgMusic");
  bgMusic.volume = 0.4;
  bgMusic.play();

  init(level);
  animate();
}

function init(level) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(4, 4, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x111122);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(ambient, dirLight);

  createRubiksCube();
  setupButtons();

  window.addEventListener("resize", onWindowResize);
}

function createRubiksCube() {
  const cubeSize = 0.9;
  const spacing = 0.05;
  const faceColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff8800, 0xffffff];

  cubes = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const materials = faceColors.map(
          (color) =>
            new THREE.MeshStandardMaterial({
              color,
              roughness: 0.3,
              metalness: 0.4,
              emissive: color,
              emissiveIntensity: 0.05,
            })
        );
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
          materials
        );
        cube.position.set(
          x * (cubeSize + spacing),
          y * (cubeSize + spacing),
          z * (cubeSize + spacing)
        );
        scene.add(cube);
        cubes.push(cube);
      }
    }
  }
}

// === ROTASI RANDOM ===
function rotateRandomFace() {
  if (rotating) return;
  rotating = true;

  const rotateSound = document.getElementById("rotateSound");
  rotateSound.currentTime = 0;
  rotateSound.play();

  const randomLayer = Math.floor(Math.random() * 3) - 1;
  const group = new THREE.Group();

  cubes.forEach((cube) => {
    if (Math.abs(cube.position.y - randomLayer) < 0.6) {
      group.add(cube);
    }
  });

  scene.add(group);

  let angle = 0;
  const rotateSpeed = 0.12;
  const axis = new THREE.Vector3(0, 1, 0);

  function animateRotation() {
    angle += rotateSpeed;
    group.rotateOnAxis(axis, rotateSpeed);
    if (angle < Math.PI / 2) {
      requestAnimationFrame(animateRotation);
    } else {
      rotating = false;
    }
  }
  animateRotation();
}

// === TOMBOL TAMBAHAN ===
function setupButtons() {
  document.getElementById("shuffleBtn").onclick = () => {
    let times = 10;
    function scramble() {
      rotateRandomFace();
      if (times-- > 0) setTimeout(scramble, 400);
    }
    scramble();
  };

  document.getElementById("resetBtn").onclick = () => {
    scene.clear();
    createRubiksCube();
  };

  document.getElementById("fullscreenBtn").onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  window.addEventListener("click", rotateRandomFace);
}

// === WINDOW RESIZE ===
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// === ANIMASI ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
