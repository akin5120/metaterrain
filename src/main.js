import * as THREE from 'three';

let scene, camera, renderer;
let cube;
let isGrabbing = false;
let grabbingHandedness = null;

function initAR(session) {
    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    document.body.appendChild(renderer.domElement);
    renderer.xr.setSession(session);

    // Scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Cube to grab
    const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, -0.5); // In front of the user
    scene.add(cube);

    // Render loop
    renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame) return;

        const session = renderer.xr.getSession();
        const referenceSpace = renderer.xr.getReferenceSpace();

        for (const source of session.inputSources) {
            if (!source.hand) continue;

            const indexTip = source.hand.get('index-finger-tip');
            const thumbTip = source.hand.get('thumb-tip');
            const indexPose = frame.getJointPose(indexTip, referenceSpace);
            const thumbPose = frame.getJointPose(thumbTip, referenceSpace);

            if (!indexPose || !thumbPose) continue;

            const dx = indexPose.transform.position.x - thumbPose.transform.position.x;
            const dy = indexPose.transform.position.y - thumbPose.transform.position.y;
            const dz = indexPose.transform.position.z - thumbPose.transform.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            const pinch = distance < 0.02;

            if (pinch && !isGrabbing) {
                isGrabbing = true;
                grabbingHandedness = source.handedness;
                console.log('[PINCH] Grab started');
            }

            if (!pinch && isGrabbing && source.handedness === grabbingHandedness) {
                isGrabbing = false;
                grabbingHandedness = null;
                console.log('[PINCH] Grab released');
            }

            // While grabbing, move cube with fingertip
            if (isGrabbing && source.handedness === grabbingHandedness) {
                cube.position.set(
                    indexPose.transform.position.x,
                    indexPose.transform.position.y,
                    indexPose.transform.position.z
                );
            }
        }

        renderer.render(scene, camera);
    });
}

// AR Button Click
document.getElementById('enter-ar').addEventListener('click', async () => {
    if (!navigator.xr) {
        alert('WebXR not supported');
        return;
    }

    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
        alert('AR not supported on this device');
        return;
    }

    try {
        const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['local-floor', 'hand-tracking']
        });
        initAR(session);
    } catch (e) {
        console.error('AR session error:', e);
        alert('Failed to start AR session');
    }
});
