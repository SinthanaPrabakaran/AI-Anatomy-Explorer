import google.generativeai as genai
import base64
import json
import os

# ✅ Configure Gemini API key
genai.configure(api_key="AIzaSyD_49KKvYe0hRcr7ejIf9EJslPpr3kAmfQ")

# ✅ Correct model name
MODEL_NAME = "gemini-2.0-flash-exp"

# ✅ Helper: encode image to base64
def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# ✅ Organ configurations
organ_configs = {
    "kidney": {
        "images": [
            "screenshots/kidney_front.jpg",
            "screenshots/kidney_back.jpg", 
            "screenshots/kidney_top.jpg",
            "screenshots/kidney_bottom.jpg"
        ],
        "prompt": """
You are an expert in human anatomy and 3D reasoning.
The following images show a human kidney from multiple angles.

Identify and label key anatomical structures visible in these images.

Return ONLY a JSON array, where each item contains:
- name: Name of the kidney part
- short_description: 1–2 line explanation
- position: approximate 3D position (x, y, z) normalized between -1 and 1, assuming the kidney is centered.

Example:
[
  {
    "name": "Renal Cortex",
    "short_description": "Outer layer of the kidney containing the filtering units.",
    "position": { "x": 0.3, "y": 0.2, "z": 0.1 }
  }
]
""",
        "output": "output/kidney_labels.json"
    },
    "lungs": {
        "images": [
            "screenshots/lungs_front.jpg",
            "screenshots/lungs_back.jpg",
            "screenshots/lungs_top.jpg", 
            "screenshots/lungs_bottom.jpg"
        ],
        "prompt": """
You are an expert in human anatomy and 3D reasoning.
The following images show human lungs from multiple angles.

Identify and label key anatomical structures visible in these images.

Return ONLY a JSON array, where each item contains:
- name: Name of the lung part
- short_description: 1–2 line explanation
- position: approximate 3D position (x, y, z) normalized between -1 and 1, assuming the lungs are centered.

Example:
[
  {
    "name": "Left Lung",
    "short_description": "Left side lung responsible for gas exchange.",
    "position": { "x": -0.4, "y": 0.1, "z": 0.0 }
  }
]
""",
        "output": "output/lungs_labels.json"
    },
    "brain": {
        "images": [
            "screenshots/brain_front.jpg",
            "screenshots/brain_back.jpg",
            "screenshots/brain_top.jpg",
            "screenshots/brain_bottom.jpg"
        ],
        "prompt": """
You are an expert in human anatomy and 3D reasoning.
The following images show a human brain from multiple angles.

Identify and label key anatomical structures visible in these images.

Return ONLY a JSON array, where each item contains:
- name: Name of the brain part
- short_description: 1–2 line explanation
- position: approximate 3D position (x, y, z) normalized between -1 and 1, assuming the brain is centered.

Example:
[
  {
    "name": "Frontal Lobe",
    "short_description": "Front part of the brain responsible for reasoning and motor control.",
    "position": { "x": 0.0, "y": 0.4, "z": 0.2 }
  }
]
""",
        "output": "output/brain_labels.json"
    },
    "liver": {
        "images": [
            "screenshots/liver_front.jpg",
            "screenshots/liver_back.jpg",
            "screenshots/liver_top.jpg",
            "screenshots/liver_bottom.jpg"
        ],
        "prompt": """
You are an expert in human anatomy and 3D reasoning.
The following images show a human liver from multiple angles.

Identify and label key anatomical structures visible in these images.

Return ONLY a JSON array, where each item contains:
- name: Name of the liver part
- short_description: 1–2 line explanation
- position: approximate 3D position (x, y, z) normalized between -1 and 1, assuming the liver is centered.

Example:
[
  {
    "name": "Right Lobe",
    "short_description": "Larger right portion of the liver.",
    "position": { "x": 0.3, "y": 0.1, "z": 0.0 }
  }
]
""",
        "output": "output/liver_labels.json"
    }
}

# ✅ Initialize model
model = genai.GenerativeModel(MODEL_NAME)
import sys

# ✅ Choose organ from command line (default = kidney)
organ_name = sys.argv[1] if len(sys.argv) > 1 else "kidney"

if organ_name not in organ_configs:
    raise ValueError(f"Unknown organ: {organ_name}. Choose from {list(organ_configs.keys())}")

config = organ_configs[organ_name]


# ✅ Encode images dynamically
input_parts = [{"mime_type": "image/jpeg", "data": encode_image(img)} for img in config["images"]]

try:
    print(f"Generating labels for {organ_name}...")
    response = model.generate_content(input_parts + [config["prompt"]])
    text = response.text.strip()

    # 🔧 Clean Markdown fences (```json … ```)
    if "```" in text:
        text = text.split("```")[1]
        if text.strip().startswith("json"):
            text = text.split("\n", 1)[1]

    print(f"Cleaned Response Preview ({organ_name}):\n", text[:500])

    data = json.loads(text)

    os.makedirs("output", exist_ok=True)
    with open(config["output"], "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ Success! Saved labeled parts to {config['output']}")

except Exception as e:
    print(f"❌ Error parsing response for {organ_name}:", e)
    os.makedirs("output", exist_ok=True)
    with open("output/raw_response.txt", "w") as f:
        f.write(response.text if hasattr(response, "text") else str(response))
    print("Raw text saved to output/raw_response.txt")
