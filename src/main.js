import * as THREE from 'three';

let scene, camera, renderer;

function initAR(session) {
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    document.body.appendChild(renderer.domElement);

    // Set up session
    renderer.xr.setSession(session);

    // Scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Terrain plane
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, -0.5);
    scene.add(plane);

    // Render loop
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

// Handle AR button click
document.getElementById('enter-ar').addEventListener('click', async () => {
    if (!navigator.xr) {
        alert('WebXR not supported');
        return;
    }

    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    console.log("AR session supported:", supported);
    if (!supported) {
        alert('AR not supported on this device');
        return;
    }

    try {
        const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['local-floor']
        });
        initAR(session);
    } catch (e) {
        console.error("AR session error", e);
        alert('Failed to start AR session.');
    }
});
