import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";

export function addLabels(scene, labels, model) {
  // 🧹 Remove any old label sprites or lines before adding new ones
  const toRemove = [];
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
    const ctx = canvas.getContext("2d");
    const padding = 3;
    const fontSize = 14;
    const text = label.name;
    ctx.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`;
    const textWidth = Math.ceil(ctx.measureText(text).width);
    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;

    const ctx2 = canvas.getContext("2d");
    ctx2.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`;
    ctx2.fillStyle = "rgba(0,0,0,0.55)";
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    ctx2.fillStyle = "#ffd7d7";
    ctx2.fillText(text, padding, padding + fontSize - 4);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
    });
    const sprite = new THREE.Sprite(material);
    sprite.userData = { ...label, isLabelSprite: true };

    // float label outward
    const direction = anchor.clone().sub(center);
    if (direction.length() < 1e-5) return;
    direction.normalize();

    const offsetDistance = 0.25 * size.length();
    const labelPos = anchor.clone().add(direction.multiplyScalar(offsetDistance));
    sprite.position.copy(labelPos);

    const heightWorldUnits = 0.03 * size.length();
    sprite.scale.set(
      (canvas.width / canvas.height) * heightWorldUnits,
      heightWorldUnits,
      1
    );

    // connector line (only if distance reasonable)
    const dist = anchor.distanceTo(labelPos);
    if (dist > 0.001 && dist < size.length() * 0.5) {
      const geometry = new THREE.BufferGeometry().setFromPoints([anchor, labelPos]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffd7d7,
        transparent: true,
        opacity: 0.7,
      });
      const line = new THREE.Line(geometry, lineMaterial);
      line.userData = { isLabelLine: true };
      scene.add(line);
    }

    labelGroup.add(sprite);
  });

  scene.add(labelGroup);

  // ✅ Handle label clicks for showing descriptions
  if (!window.__labelClickSetup) {
    window.__labelClickSetup = true; // ensure only one listener added

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Create sidebar element if not already present
    let sidebar = document.getElementById("infoSidebar");
    if (!sidebar) {
      sidebar = document.createElement("div");
      sidebar.id = "infoSidebar";
      sidebar.style.position = "absolute";
      sidebar.style.right = "20px";
      sidebar.style.top = "50%";
      sidebar.style.transform = "translateY(-50%)";
      sidebar.style.width = "260px";
      sidebar.style.background = "rgba(0, 0, 0, 0.65)";
      sidebar.style.color = "#ffd7d7";
      sidebar.style.padding = "15px";
      sidebar.style.borderRadius = "12px";
      sidebar.style.fontFamily = "Segoe UI, Arial, sans-serif";
      sidebar.style.display = "none";
      sidebar.style.zIndex = "10";
      sidebar.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      document.body.appendChild(sidebar);
    }

    window.addEventListener("click", (event) => {
      const canvas = document.querySelector("canvas");
      const rect = canvas.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const sceneList = window.__threeScenes || [scene];
      const cameraList = window.__threeCameras || [];

      for (let i = 0; i < sceneList.length; i++) {
        const sc = sceneList[i];
        const cam = cameraList[i] || window.camera;
        if (!cam) continue;

        raycaster.setFromCamera(mouse, cam);
        const sprites = [];
        sc.traverse((obj) => {
          if (obj.isSprite) sprites.push(obj);
        });

        const intersects = raycaster.intersectObjects(sprites, true);
        if (intersects.length > 0) {
          const data = intersects[0].object.userData;
          if (data && data.name && data.short_description) {
            sidebar.innerHTML = `
              <h3 style="margin-top:0; color:#fff;">${data.name}</h3>
              <p style="font-size:14px; color:#ffd7d7;">${data.short_description}</p>
            `;
            sidebar.style.display = "block";
            return;
          }
        }
      }

      sidebar.style.display = "none"; // clicked empty space → hide
    });
  }

  return labelGroup;
}
