import * as THREE from 'three';

let scene, camera, renderer;

function initAR() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Terrain placeholder
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, -0.5);
    scene.add(plane);

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

document.getElementById('enter-ar').addEventListener('click', async () => {
    if (navigator.xr) {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!supported) {
            alert('AR not supported on this device');
            return;
        }

        const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test']
        });

        initAR();
        renderer.xr.setSession(session);
    } else {
        alert('WebXR not supported');
    }
});
 