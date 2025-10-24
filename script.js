// --- VARIABEL GLOBAL ---
let scene, camera, renderer, controls;
let rubiksGroup; // Grup untuk menampung semua bagian kubus

// --- INISIALISASI ---
function init() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111); // Latar belakang gelap

    // 2. Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posisikan kamera sedikit lebih jauh untuk tampilan awal
    camera.position.set(8, 8, 8); 

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 4. Controls (Memungkinkan interaksi dengan mouse)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 5. Pencahayaan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 6. Buat Grup Kubus
    rubiksGroup = new THREE.Group();
    scene.add(rubiksGroup);

    // 7. Buat Latar Belakang Bintang
    createStarfield();

    // 8. Tambahkan Event Listeners untuk Tombol Kesulitan
    document.getElementById('btn-easy').addEventListener('click', () => startGame(2));
    document.getElementById('btn-medium').addEventListener('click', () => startGame(3));
    document.getElementById('btn-hard').addEventListener('click', () => startGame(4));

    // Handle Resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Mulai animasi
    animate();
}

// --- FUNGSI LOGIKA GAME ---

function startGame(size) {
    // 1. Hapus kubus yang ada
    clearCube();

    // 2. Buat kubus baru dengan ukuran yang dipilih
    createRubiksCube(size);
    
    // 3. Sesuaikan posisi kamera berdasarkan ukuran kubus
    const cubeUnitSize = 1 + 0.1; // (UNIT dari fungsi createRubiksCube)
    const cameraPos = (cubeUnitSize * size) * 1.5;
    camera.position.set(cameraPos, cameraPos, cameraPos);
    controls.update();
}

function clearCube() {
    // Hapus semua anak (kubus kecil) dari grup
    while (rubiksGroup.children.length > 0) {
        rubiksGroup.remove(rubiksGroup.children[0]);
    }
    // Catatan: Untuk proyek besar, Anda juga harus membuang geometri & material
}

function createRubiksCube(CUBE_SIZE) {
    const SPACING = 0.1;
    const UNIT = 1 + SPACING;

    const colors = [
        new THREE.Color(0xFFFFFF), // Putih - Depan (Z+)
        new THREE.Color(0xFFFF00), // Kuning - Belakang (Z-)
        new THREE.Color(0x0000FF), // Biru - Atas (Y+)
        new THREE.Color(0x00FF00), // Hijau - Bawah (Y-)
        new THREE.Color(0xFF0000), // Merah - Kanan (X+)
        new THREE.Color(0xFF8C00), // Oranye - Kiri (X-)
    ];

    const smallCubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    for (let x = 0; x < CUBE_SIZE; x++) {
        for (let y = 0; y < CUBE_SIZE; y++) {
            for (let z = 0; z < CUBE_SIZE; z++) {
                
                const materials = [
                    new THREE.MeshLambertMaterial({ color: (x === CUBE_SIZE - 1) ? colors[4] : 0x222222 }), // Kanan (X+)
                    new THREE.MeshLambertMaterial({ color: (x === 0) ? colors[5] : 0x222222 }),           // Kiri (X-)
                    new THREE.MeshLambertMaterial({ color: (y === CUBE_SIZE - 1) ? colors[2] : 0x222222 }), // Atas (Y+)
                    new THREE.MeshLambertMaterial({ color: (y === 0) ? colors[3] : 0x222222 }),           // Bawah (Y-)
                    new THREE.MeshLambertMaterial({ color: (z === CUBE_SIZE - 1) ? colors[0] : 0x222222 }), // Depan (Z+)
                    new THREE.MeshLambertMaterial({ color: (z === 0) ? colors[1] : 0x222222 }),           // Belakang (Z-)
                ];

                const cube = new THREE.Mesh(smallCubeGeometry, materials);

                const offset = (CUBE_SIZE - 1) / 2;
                cube.position.x = (x - offset) * UNIT;
                cube.position.y = (y - offset) * UNIT;
                cube.position.z = (z - offset) * UNIT;

                // Tambahkan kubus kecil ke grup, bukan langsung ke scene
                rubiksGroup.add(cube);
            }
        }
    }
}

function createStarfield() {
    const starQty = 10000;
    const vertices = [];

    for (let i = 0; i < starQty; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

// --- ANIMASI DAN RESPONSIVITAS ---

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}

// Mulai aplikasi saat DOM dimuat
window.onload = init;

