import * as THREE from 'three';

let scene, camera, renderer;
const jointMeshes = {}; // To hold fingertip spheres

function createJointMesh() {
    const geometry = new THREE.SphereGeometry(0.01, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
}

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

    // Flat green plane for reference
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, -0.5);
    scene.add(plane);

    // Render loop
    renderer.setAnimationLoop((timestamp, frame) => {
        if (frame) {
            const session = renderer.xr.getSession();
            const referenceSpace = renderer.xr.getReferenceSpace();

            for (const source of session.inputSources) {
                if (!source.hand) continue;

                for (const jointName of source.hand.keys()) {
                    const joint = source.hand.get(jointName);
                    const jointPose = frame.getJointPose(joint, referenceSpace);

                    if (jointPose) {
                        let mesh = jointMeshes[jointName];
                        if (!mesh) {
                            mesh = createJointMesh();
                            scene.add(mesh);
                            jointMeshes[jointName] = mesh;
                        }
                        mesh.visible = true;
                        mesh.position.set(
                            jointPose.transform.position.x,
                            jointPose.transform.position.y,
                            jointPose.transform.position.z
                        );
                    }
                }
            }
        }

        renderer.render(scene, camera);
    });
}

// AR Button Click Handler
document.getElementById('enter-ar').addEventListener('click', async () => {
    if (!navigator.xr) {
        alert('WebXR not supported');
        return;
    }

    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    console.log('immersive-ar supported:', supported);
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
