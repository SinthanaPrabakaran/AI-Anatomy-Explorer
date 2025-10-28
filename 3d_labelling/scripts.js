// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// // Scene setup
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.getElementById('canvas-container').appendChild(renderer.domElement);

// // Camera + Controls
// camera.position.set(0, 1, 2);
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

// // Lighting
// const light = new THREE.DirectionalLight(0xffffff, 2);
// light.position.set(1, 1, 1);
// scene.add(light);
// scene.add(new THREE.AmbientLight(0x404040));

// // Raycaster setup for click detection
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// let labelSprites = [];

// // Load 3D heart model
// const loader = new GLTFLoader();
// loader.load(
//   './models/heart.glb',
//   (gltf) => {
//     const model = gltf.scene;
//     model.scale.set(1, 1, 1);
//     scene.add(model);
//     console.log("✅ Model loaded");
//     loadLabels(scene);
//   },
//   undefined,
//   (error) => console.error("❌ Error loading model:", error)
// );

// // Load labels JSON and create floating tags
// async function loadLabels(scene) {
//   try {
//     const res = await fetch('./heart_labels.json');
//     const labels = await res.json();
//     console.log("✅ Labels loaded:", labels);

//     labels.forEach(label => {
//       const sprite = createLabelSprite(label.part, label.color);
//       const pos = getApproxPosition(label.approx_location);
//       sprite.position.copy(pos);
//       sprite.userData = { part: label.part, info: label.info };
//       labelSprites.push(sprite);
//       scene.add(sprite);
//     });
//   } catch (err) {
//     console.error("❌ Error loading labels:", err);
//   }
// }

// // Create 2D text as 3D Sprite
// function createLabelSprite(text, color) {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
//   ctx.font = 'bold 24px Arial';
//   ctx.fillStyle = color;
//   ctx.fillText(text, 10, 40);
//   const texture = new THREE.CanvasTexture(canvas);
//   const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
//   const sprite = new THREE.Sprite(material);
//   sprite.scale.set(0.5, 0.25, 1);
//   return sprite;
// }

// // Approximate coordinates
// function getApproxPosition(location) {
//   const map = {
//     "top center": new THREE.Vector3(0, 1.0, 0),
//     "upper back-left": new THREE.Vector3(-0.5, 0.8, -0.5),
//     "lower front-right": new THREE.Vector3(0.5, -0.8, 0.5),
//     "upper front": new THREE.Vector3(0, 0.8, 0.4),
//     "lower left": new THREE.Vector3(-0.6, -0.8, 0)
//   };
//   return map[location] || new THREE.Vector3(0, 0, 0);
// }

// // Handle click events
// function onClick(event) {
//   const rect = renderer.domElement.getBoundingClientRect();
//   mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//   mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//   raycaster.setFromCamera(mouse, camera);
//   const intersects = raycaster.intersectObjects(labelSprites);

//   if (intersects.length > 0) {
//     const clicked = intersects[0].object.userData;
//     document.getElementById('label-title').textContent = clicked.part;
//     document.getElementById('label-info').textContent = clicked.info;
//   }
// }

// window.addEventListener('click', onClick);

// // Resize handler
// window.addEventListener('resize', () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });

// // Animate
// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }
// animate();
