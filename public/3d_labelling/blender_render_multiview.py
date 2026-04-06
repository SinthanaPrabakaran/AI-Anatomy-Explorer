import bpy
import os
import math


base_dir = os.path.dirname(bpy.data.filepath)
model_dir = os.path.join(base_dir, "models")
output_dir = os.path.join(base_dir, "screenshots")

# Create output folder if not exists
if not os.path.exists(output_dir):
    os.makedirs(output_dir)


models = [f for f in os.listdir(model_dir) if f.endswith((".glb", ".gltf", ".obj", ".fbx"))]
if not models:
    raise FileNotFoundError("No 3D model found in 'models' folder!")

model_path = os.path.join(model_dir, models[0])
print(f"🧩 Loading model: {model_path}")

# Remove default cube/light/camera
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Import model
if model_path.endswith(".glb") or model_path.endswith(".gltf"):
    bpy.ops.import_scene.gltf(filepath=model_path)
elif model_path.endswith(".obj"):
    bpy.ops.import_scene.obj(filepath=model_path)
elif model_path.endswith(".fbx"):
    bpy.ops.import_scene.fbx(filepath=model_path)

bpy.ops.object.light_add(type='SUN', location=(5, 5, 5))
bpy.context.object.data.energy = 3.0


bpy.ops.object.camera_add(location=(0, -5, 0), rotation=(math.radians(90), 0, 0))
camera = bpy.context.object
bpy.context.scene.camera = camera


views = {
    "front": (0, -5, 0, 90, 0, 0),
    "back": (0, 5, 0, 90, 180, 0),
    "top": (0, 0, 5, 0, 0, 0),
    "bottom": (0, 0, -5, 180, 0, 0),
}


scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 95
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024



model_name = os.path.splitext(os.path.basename(model_path))[0]

for name, (x, y, z, rx, ry, rz) in views.items():
    camera.location = (x, y, z)
    camera.rotation_euler = (
        math.radians(rx),
        math.radians(ry),
        math.radians(rz)
    )

    output_file = os.path.join(output_dir, f"{model_name}_{name}.jpg")
    scene.render.filepath = output_file
    bpy.ops.render.render(write_still=True)
    print(f"✅ Saved screenshot: {output_file}")

print("\n🎉 All views rendered and saved in 'screenshots/' folder!")