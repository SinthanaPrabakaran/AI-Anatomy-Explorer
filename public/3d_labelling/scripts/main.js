import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/controls/OrbitControls.js";
import { addLabels } from "./labels.js";

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ✅ make sure renderer attaches correctly even if #canvas-container missing
const container = document.getElementById("canvas-container") || document.body;
container.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 2, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.__threeScenes = [scene];
window.__threeCameras = [camera];

// --- ORGAN CONFIG ---
const organConfig = {
  heart: {
    model: "./models/heart.glb",
    labels: "./output/heart_labels.json",
    title: "3D Heart Label Viewer",
  },
  kidney: {
    model: "./models/kidney.glb",
    labels: "./output/kidney_labels.json",
    title: "3D Kidney Label Viewer",
  },
  lungs: {
    model: "./models/lungs2.glb",
    labels: "./output/lungs_labels.json",
    title: "3D Lungs Label Viewer",
  },
  brain: {
    model: "./models/brain.glb",
    labels: "./output/brain_labels.json",
    title: "3D Brain Label Viewer",
  },
  liver: {
    model: "./models/liver3.glb",
    labels: "./output/liver_labels.json",
    title: "3D Liver Label Viewer",
  },
};

let currentModel = null;
let currentLabelGroup = null;
let sidebar = document.getElementById("info-panel");

// --- INLINE ERROR DISPLAY ---
function showInlineError(message) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.top = "48px";
  el.style.left = "10px";
  el.style.padding = "8px 12px";
  el.style.background = "rgba(255, 80, 80, 0.85)";
  el.style.color = "#fff";
  el.style.borderRadius = "6px";
  el.style.fontFamily = "Segoe UI, sans-serif";
  el.style.zIndex = "9999";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// --- CAMERA FIT ---
function frameCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

  camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));
  controls.target.copy(center);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.update();
}

// --- LABEL CLICK INTERACTIONS ---
function enableLabelClick(labelGroup) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("click", (event) => {
    if (!labelGroup || !labelGroup.children) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(labelGroup.children);
    if (intersects.length > 0) {
      const clicked = intersects[0].object.userData;
      if (sidebar) {
        sidebar.innerHTML = `
          <h3 id="label-title">${clicked.name}</h3>
          <p id="label-info">${clicked.short_description}</p>
        `;
      }
    }
  });
}

// --- LOAD ORGAN ---
async function loadOrgan(organType) {
  const config = organConfig[organType];
  if (!config) return showInlineError(`Unknown organ: ${organType}`);

  // Update header text
  const titleElement = document.getElementById("title-text");
  if (titleElement) titleElement.textContent = config.title;

  // Clear previous model and labels
  if (currentModel) scene.remove(currentModel);
  if (currentLabelGroup) {
    currentLabelGroup.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    scene.remove(currentLabelGroup);
  }

  // Reset sidebar
  if (sidebar) {
    sidebar.innerHTML = `
      <h3 id="label-title">Click a label</h3>
      <p id="label-info">Select any floating label on the 3D model to learn more.</p>
    `;
  }

  // Load model
  const loader = new GLTFLoader();
  loader.load(
    config.model,
    (gltf) => {
      const model = gltf.scene;
      currentModel = model;
      scene.add(model);
      frameCameraToObject(model);

      // Load labels
      fetch(config.labels)
        .then((res) => res.json())
        .then((labels) => {
          currentLabelGroup = addLabels(scene, labels, currentModel);
          enableLabelClick(currentLabelGroup);
        })
        .catch((err) => {
          console.error("Failed to load labels:", err);
          showInlineError("Failed to load labels.");
        });
    },
    undefined,
    (err) => {
      console.error("Failed to load model:", err);
      showInlineError("Failed to load model.");
    }
  );
}

// --- ORGAN INPUT ---
const organInput = document.getElementById("organ-input");
const validOrgans = Object.keys(organConfig); // ["heart", "kidney", "lungs", "brain", "liver"]

// Load default organ initially
loadOrgan("heart");

// Listen for Enter key in text input
if (organInput) {
  organInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const organ = e.target.value.trim().toLowerCase();
      if (validOrgans.includes(organ)) {
        loadOrgan(organ);
      } else {
        showInlineError("Please enter a valid organ name: heart, kidney, lungs, brain, or liver.");
      }
    }
  });
}


// --- ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- HANDLE RESIZE ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
