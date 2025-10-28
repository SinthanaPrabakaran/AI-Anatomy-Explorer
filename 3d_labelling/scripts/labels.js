// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";

// export function addLabels(scene, labels, onLabelClick) {
//   const labelGroup = new THREE.Group();

//   labels.forEach((label) => {
//     const anchor = new THREE.Vector3(label.position.x, label.position.y, label.position.z);

//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const padding = 3;
//     const fontSize = 14;
//     ctx.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`;
//     const text = label.name;
//     const textWidth = Math.ceil(ctx.measureText(text).width);
//     canvas.width = textWidth + padding * 2;
//     canvas.height = fontSize + padding * 2;

//     const ctx2 = canvas.getContext("2d");
//     if (!ctx2) return;
//     ctx2.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`;
//     ctx2.fillStyle = "rgba(0,0,0,0.55)";
//     ctx2.fillRect(0, 0, canvas.width, canvas.height);
//     ctx2.fillStyle = "#ffd7d7";
//     ctx2.fillText(text, padding, padding + fontSize - 4);

//     const texture = new THREE.CanvasTexture(canvas);
//     const material = new THREE.SpriteMaterial({
//       map: texture,
//       transparent: true,
//       depthTest: true,
//     });
//     const sprite = new THREE.Sprite(material);

//     const tinyOffset = 0.02;
//     const outward = anchor.clone().normalize();
//     sprite.position.copy(anchor.clone().add(outward.multiplyScalar(tinyOffset)));

//     const heightWorldUnits = 0.06;
//     sprite.scale.set((canvas.width / canvas.height) * heightWorldUnits, heightWorldUnits, 1);

//     // Store label metadata for clicks
//     sprite.userData = label;

//     labelGroup.add(sprite);
//   });

//   scene.add(labelGroup);

//   // Return the label group for interactivity
//   return labelGroup;
// }

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";

export function addLabels(scene, labels, onLabelClick) {
  const labelGroup = new THREE.Group();

  labels.forEach((label) => {
    const anchor = new THREE.Vector3(label.position.x, label.position.y, label.position.z);

    // Create the canvas-based text sprite
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 3;
    const fontSize = 14;
    ctx.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`;
    const text = label.name;
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

    // Offset the label slightly upward (fixed offset)
    // Offset label slightly *outward* from the organ center
    const direction = anchor.clone().normalize(); // vector pointing outward from center
    const offsetDistance = 0.15; // how far label floats away
    const labelPos = anchor.clone().add(direction.multiplyScalar(offsetDistance));
    sprite.position.copy(labelPos);


    // Set consistent label size
    const heightWorldUnits = 0.06;
    sprite.scale.set((canvas.width / canvas.height) * heightWorldUnits, heightWorldUnits, 1);

    // --- connector line ---
    const points = [anchor, labelPos];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffd7d7,
      transparent: true,
      opacity: 0.7,
      linewidth: 1.5
    });
    const line = new THREE.Line(geometry, lineMaterial);

    // Add both separately so click still hits sprite
    scene.add(line);

    sprite.userData = label;
    labelGroup.add(sprite);
  });

  scene.add(labelGroup);
  return labelGroup;
}
