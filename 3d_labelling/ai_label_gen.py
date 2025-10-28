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

# ✅ Kidney image paths
kidney_images = [
    "screenshots/kidney_front.jpg",
    "screenshots/kidney_back.jpg",
    "screenshots/kidney_top.jpg",
    "screenshots/kidney_bottom.jpg"
]

# ✅ Kidney prompt
kidney_prompt = """
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
"""

# ✅ Initialize model
model = genai.GenerativeModel(MODEL_NAME)

# ✅ Attach kidney images + prompt
input_parts = [{"mime_type": "image/jpeg", "data": encode_image(img)} for img in kidney_images]

# ✅ Generate kidney labels
try:
    print("Generating kidney labels...")
    response = model.generate_content(input_parts + [kidney_prompt])
    text = response.text.strip()

    # 🔧 Clean Markdown fences (```json … ```)
    if "```" in text:
        text = text.split("```")[1]
        if text.strip().startswith("json"):
            text = text.split("\n", 1)[1]

    print("Cleaned Response Preview:\n", text[:500])

    data = json.loads(text)

    os.makedirs("output", exist_ok=True)
    with open("output/kidney_labels.json", "w") as f:
        json.dump(data, f, indent=2)

    print("\nSuccess! Saved labeled parts to output/kidney_labels.json")

except Exception as e:
    print("Error parsing response:", e)
    os.makedirs("output", exist_ok=True)
    with open("output/raw_response.txt", "w") as f:
        f.write(response.text if hasattr(response, "text") else str(response))
    print("Raw text saved to output/raw_response.txt")
