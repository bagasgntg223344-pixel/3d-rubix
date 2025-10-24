// --- VARIABEL GLOBAL ---

let scene, camera, renderer, controls;

let rubiksGroup; // Grup untuk menampung semua bagian kubus

let currentSize = 3; // Melacak ukuran kubus saat ini, default 3x3

let isAnimating = false; // Mencegah beberapa gerakan sekaligus


// --- INISIALISASI ---

function init() {

    // 1. Scene

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x111111);


    // 2. Camera

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(8, 8, 8);


    // 3. Renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);


    // 4. Controls

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


    // 8. Tambahkan Event Listeners untuk Tombol

    document.getElementById('btn-easy').addEventListener('click', () => startGame(2));

    document.getElementById('btn-medium').addEventListener('click', () => startGame(3));

    document.getElementById('btn-hard').addEventListener('click', () => startGame(4));

   

    document.getElementById('btn-shuffle').addEventListener('click', shuffleCube);

    document.getElementById('btn-reset').addEventListener('click', resetCube);


    // 9. Mulai game dengan kubus default (3x3)

    startGame(currentSize);


    // Handle Resize

    window.addEventListener('resize', onWindowResize, false);

   

    // Mulai animasi

    animate();

}


// --- FUNGSI LOGIKA GAME ---


function startGame(size) {

    if (isAnimating) return; // Jangan lakukan apa-apa jika sedang sibuk


    currentSize = size; // Simpan ukuran saat ini

    clearCube();

    createRubiksCube(currentSize);

   

    // Sesuaikan posisi kamera berdasarkan ukuran kubus

    const cubeUnitSize = 1 + 0.1; // (UNIT dari fungsi createRubiksCube)

    const cameraPos = (cubeUnitSize * size) * 1.5;

    camera.position.set(cameraPos, cameraPos, cameraPos);

    controls.update();

}


function resetCube() {

    // Cukup mulai ulang game dengan ukuran yang tersimpan

    startGame(currentSize);

}


function clearCube() {

    while (rubiksGroup.children.length > 0) {

        rubiksGroup.remove(rubiksGroup.children[0]);

    }

}


function createRubiksCube(size) {

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


    for (let x = 0; x < size; x++) {

        for (let y = 0; y < size; y++) {

            for (let z = 0; z < size; z++) {

               

                // Jangan buat kubus di bagian dalam (hanya untuk 3x3 ke atas)

                if (size > 2) {

                    if (x > 0 && x < size - 1 && y > 0 && y < size - 1 && z > 0 && z < size - 1) {

                        continue; // Lewati bagian tengah yang tidak terlihat

                    }

                }


                const materials = [

                    new THREE.MeshLambertMaterial({ color: (x === size - 1) ? colors[4] : 0x222222 }), // Kanan (X+)

                    new THREE.MeshLambertMaterial({ color: (x === 0) ? colors[5] : 0x222222 }),           // Kiri (X-)

                    new THREE.MeshLambertMaterial({ color: (y === size - 1) ? colors[2] : 0x222222 }), // Atas (Y+)

                    new THREE.MeshLambertMaterial({ color: (y === 0) ? colors[3] : 0x222222 }),           // Bawah (Y-)

                    new THREE.MeshLambertMaterial({ color: (z === size - 1) ? colors[0] : 0x222222 }), // Depan (Z+)

                    new THREE.MeshLambertMaterial({ color: (z === 0) ? colors[1] : 0x222222 }),           // Belakang (Z-)

                ];


                const cube = new THREE.Mesh(smallCubeGeometry, materials);


                const offset = (size - 1) / 2;

                cube.position.x = (x - offset) * UNIT;

                cube.position.y = (y - offset) * UNIT;

                cube.position.z = (z - offset) * UNIT;


                rubiksGroup.add(cube);

            }

        }

    }

}


// --- LOGIKA SHUFFLE (Acak) ---


function shuffleCube() {

    if (isAnimating) return;

    isAnimating = true;


    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];

    const directions = [1, -1]; // 1 = Searah jarum jam, -1 = Berlawanan

   

    // Lakukan sejumlah putaran acak berdasarkan ukuran kubus

    const numShuffles = currentSize * 7 + 10;


    for (let i = 0; i < numShuffles; i++) {

        const move = moves[Math.floor(Math.random() * moves.length)];

        const direction = directions[Math.floor(Math.random() * directions.length)];

       

        // Lakukan putaran instan (tanpa animasi)

        performInstantMove(move, direction);

    }

   

    isAnimating = false;

}


/**

* Fungsi inti yang melakukan putaran kubus.

* Ini menggunakan "pivoting":

* 1. Buat Grup "pivot" sementara.

* 2. Ambil semua kubus kecil ("cubies") yang ada di irisan yang benar.

* 3. Pasang (attach) cubies tersebut ke pivot.

* 4. Putar pivot.

* 5. Lepaskan (attach) cubies kembali ke grup kubus utama.

*/

function performInstantMove(move, direction) {

    const pivot = new THREE.Group();

    scene.add(pivot); // Pivot harus ada di scene untuk berfungsi


    const slice = getSlice(move);

    slice.forEach(cubie => pivot.attach(cubie)); // Memindahkan cubie ke pivot


    const angle = (Math.PI / 2) * direction;


    // Tentukan sumbu dan arah putaran

    if (move === 'U') pivot.rotation.y = angle;

    else if (move === 'D') pivot.rotation.y = -angle; // 'D' adalah kebalikan dari 'U'

    else if (move === 'R') pivot.rotation.x = angle;

    else if (move === 'L') pivot.rotation.x = -angle; // 'L' adalah kebalikan dari 'R'

    else if (move === 'F') pivot.rotation.z = angle;

    else if (move === 'B') pivot.rotation.z = -angle; // 'B' adalah kebalikan dari 'F'


    pivot.updateMatrixWorld(true); // Memperbarui transformasi dunia


    // Kembalikan cubies ke grup utama

    slice.forEach(cubie => rubiksGroup.attach(cubie));

   

    scene.remove(pivot); // Hapus pivot sementara

    pivot.clear();

}


/**

* Mengambil semua kubus kecil ("cubies") dalam satu irisan

* berdasarkan gerakan (U, D, L, R, F, B).

*/

function getSlice(move) {

    const slice = [];

    const offset = (currentSize - 1) / 2;

    // Ambang batas (threshold) untuk menentukan irisan.

    // Kita gunakan (offset - 0.5) untuk menemukan lapisan terluar.

    // +0.01 untuk menghindari kesalahan floating point

    const threshold = (offset - 0.5) + 0.01;


    rubiksGroup.children.forEach(cubie => {

        const pos = cubie.position;

       

        switch (move) {

            case 'U': if (pos.y > threshold) slice.push(cubie); break;

            case 'D': if (pos.y < -threshold) slice.push(cubie); break;

            case 'R': if (pos.x > threshold) slice.push(cubie); break;

            case 'L': if (pos.x < -threshold) slice.push(cubie); break;

            case 'F': if (pos.z > threshold) slice.push(cubie); break;

            case 'B': if (pos.z < -threshold) slice.push(cubie); break;

        }

    });

    return slice;

}


// --- FUNGSI PENDUKUNG ---


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

