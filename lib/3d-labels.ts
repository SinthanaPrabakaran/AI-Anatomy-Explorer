import * as THREE from "three";

export function addLabels(scene: THREE.Scene, labels: any[], model: THREE.Object3D) {
  // Remove any old label sprites or lines before adding new ones
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    if (obj.userData?.isLabelSprite || obj.userData?.isLabelLine) toRemove.push(obj);
  });
  toRemove.forEach((obj) => scene.remove(obj));

  const labelGroup = new THREE.Group();

  // Compute model bounds
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const halfSize = size.clone().multiplyScalar(0.5);

  labels.forEach((label) => {
    if (
      !label.position ||
      typeof label.position.x !== "number" ||
      typeof label.position.y !== "number" ||
      typeof label.position.z !== "number"
    )
      return;

    let { x, y, z } = label.position;
    const isNormalized = Math.abs(x) <= 1.2 && Math.abs(y) <= 1.2 && Math.abs(z) <= 1.2;

    const anchor = isNormalized
      ? new THREE.Vector3(
          center.x + x * halfSize.x,
          center.y + y * halfSize.y,
          center.z + z * halfSize.z
        )
      : new THREE.Vector3(x, y, z);

    // skip invalid or far-off points
    if (!isFinite(anchor.x) || !isFinite(anchor.y) || !isFinite(anchor.z)) return;
    if (anchor.distanceTo(center) > size.length() * 0.8) return;

    // text sprite
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const padding = 3;
    const fontSize = 14;
    const text = label.name;
    ctx.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`;
    const textWidth = Math.ceil(ctx.measureText(text).width);

    // Set canvas size to fit text plus padding
    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;

    // Draw label background
    ctx.fillStyle = "#000000cc"; // semi-transparent black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw label text
    ctx.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`; // Need to set font again after resizing
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, padding, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set((canvas.width / canvas.height) * 0.15, 0.15, 1);
    sprite.center.set(0, 1); // Align top-left
    sprite.position.copy(anchor);
    sprite.userData = { isLabelSprite: true, labelData: label };

    // Add line from sprite to anchor point
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      anchor,
      anchor.clone().add(new THREE.Vector3(0.2, 0.2, 0)),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(lineGeom, lineMat);
    line.userData = { isLabelLine: true };

    labelGroup.add(sprite);
    labelGroup.add(line);
  });

  scene.add(labelGroup);
  return labelGroup;
}

export function enableLabelClick(labelGroup: THREE.Group) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const sidebar = document.getElementById("info-sidebar") || createSidebar();
  
  function handleLabelClick(event: MouseEvent) {
    const canvas = event.target as HTMLCanvasElement;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, window.__threeCameras[0]);
    const intersects = raycaster.intersectObjects(labelGroup.children, true);

    if (intersects.length > 0) {
      const sprite = intersects[0].object;
      if (sprite instanceof THREE.Sprite && sprite.userData?.labelData) {
        showLabelInfo(sprite.userData.labelData, sidebar);
      }
    }
  }

  window.addEventListener("click", handleLabelClick);
}

function createSidebar() {
  const sidebar = document.createElement("div");
  sidebar.id = "info-sidebar";
  sidebar.className = "sidebar";
  document.body.appendChild(sidebar);
  return sidebar;
}

function showLabelInfo(label: any, sidebar: HTMLElement) {
  if (!sidebar) return;

  const nameSection = label.name ? `<h3>${label.name}</h3>` : "";
  const descriptionSection = label.description
    ? `<p class="description">${label.description}</p>`
    : "";
  const locationSection = label.location
    ? `<p class="location"><strong>Location:</strong> ${label.location}</p>`
    : "";
  const functionSection = label.function
    ? `<p class="function"><strong>Function:</strong> ${label.function}</p>`
    : "";

  sidebar.innerHTML = `
    ${nameSection}
    ${descriptionSection}
    ${locationSection}
    ${functionSection}
  `;

  sidebar.style.display = "block";
}