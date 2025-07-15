import * as THREE from 'three';

let scene, camera, renderer;

function initAR() {
    console.log('[AR] Initializing scene...');
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, -0.5);
    scene.add(plane);

    renderer.setAnimationLoop(() => {
        console.log('[AR] Rendering frame...');
        renderer.render(scene, camera);
    });
}

document.getElementById('enter-ar').addEventListener('click', async () => {
    console.log('[AR] Enter AR clicked');
    if (!navigator.xr) {
        console.error('[AR] navigator.xr not available');
        alert('WebXR not supported in this browser');
        return;
    }

    try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        console.log('[AR] AR supported:', supported);
        if (!supported) {
            alert('AR mode not supported on this device');
            return;
        }
    } catch (err) {
        console.error('[AR] isSessionSupported error:', err);
        alert('Error checking AR support — see console');
        return;
    }

    let session;
    try {
        session = await navigator.xr.requestSession('immersive-ar', {
            optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
            requiredFeatures: ['local']
        });
        console.log('[AR] AR session created');
    } catch (err) {
        console.error('[AR] requestSession failed:', err);
        alert('Failed to start AR session: ' + err.message);
        return;
    }

    initAR();

    try {
        renderer.xr.setSession(session);
        console.log('[AR] Session set into renderer');
    } catch (err) {
        console.error('[AR] setSession error:', err);
        alert('Unable to set AR session: ' + err.message);
    }
});
