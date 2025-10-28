import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/controls/OrbitControls.js";
import { addLabels } from "./labels.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 2, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Organ configuration
const organConfig = {
  heart: {
    model: "./models/heart.glb",
    labels: "./output/heart_labels.json",
    title: "3D Heart Label Viewer"
  },
  kidney: {
    model: "./models/kidney.glb",
    labels: "./output/kidney_labels.json",
    title: "3D Kidney Label Viewer"
  }
};

let currentModel = null;
let currentLabelGroup = null;
let sidebar = null;

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
  
  // Remove after 5 seconds
  setTimeout(() => el.remove(), 5000);
}

function frameCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = new THREE.Vector3(0, 0, 1);
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  controls.target.copy(center);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.update();
}

function createSidebar(organType) {
  // Remove existing sidebar
  if (sidebar) {
    sidebar.remove();
  }
  
  sidebar = document.createElement("div");
  sidebar.id = "info-panel";
  sidebar.style.position = "absolute";
  sidebar.style.top = "20px";
  sidebar.style.right = "20px";
  sidebar.style.width = "260px";
  sidebar.style.padding = "12px";
  sidebar.style.background = "rgba(0,0,0,0.6)";
  sidebar.style.borderRadius = "10px";
  sidebar.style.color = "white";
  sidebar.style.fontFamily = "Segoe UI, sans-serif";
  sidebar.style.transition = "all 0.3s ease";
  sidebar.innerHTML = `<h3>Click a label</h3><p>Select any label to learn more.</p>`;
  document.body.appendChild(sidebar);
}

function enableLabelClick(labelGroup) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Click listener
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
          <h3>${clicked.name}</h3>
          <p>${clicked.short_description}</p>
        `;
      }
    }
  });
}

async function loadOrgan(organType) {
  const config = organConfig[organType];
  if (!config) {
    showInlineError(`Unknown organ: ${organType}`);
    return;
  }

  // Update title
  const titleElement = document.getElementById("title-text");
  if (titleElement) {
    titleElement.textContent = config.title;
  }

  // Remove old model and labels
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }
  
  if (currentLabelGroup) {
    scene.remove(currentLabelGroup);
    // Remove all lines
    const lines = scene.children.filter(child => child.type === 'Line');
    lines.forEach(line => scene.remove(line));
    currentLabelGroup = null;
  }

  // Create sidebar
  createSidebar(organType);

  // Load model
  const loader = new GLTFLoader();
  loader.load(
    config.model,
    (gltf) => {
      const model = gltf.scene;
      currentModel = model;
      scene.add(model);
      console.log("Model loaded", model);
      frameCameraToObject(model);

      // Load labels after model
      fetch(config.labels)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((labels) => {
          currentLabelGroup = addLabels(scene, labels);
          enableLabelClick(currentLabelGroup);
        })
        .catch((err) => {
          console.error("Failed to load labels:", err);
          showInlineError(`Failed to load labels: ${err}`);
        });
    },
    undefined,
    (err) => {
      console.error("Failed to load model:", err);
      showInlineError("Failed to load model. See console for details.");
    }
  );
}

// Set up dropdown listener
const organSelector = document.getElementById("organ-selector");
if (organSelector) {
  organSelector.addEventListener("change", (e) => {
    loadOrgan(e.target.value);
  });
}

// Load initial organ (heart)
loadOrgan("heart");

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
