import os

import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
from keras.utils import normalize
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "BrainTumorClassifier.keras")

try:
    model = load_model(MODEL_PATH, compile=False)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    import traceback
    traceback.print_exc()
    model = None
    print(f"Warning: Could not load model from {MODEL_PATH}. Error: {e}")

# ---------------------------------------------------------------------------
# Image validation
# ---------------------------------------------------------------------------
INPUT_SIZE = 64
CLASSES = {
    0: "NO, there is no brain tumor",
    1: "GLIOMA, tumor detected",
    2: "MENINGIOMA, tumor detected",
    3: "PITUITARY, tumor detected",
    4: "YES, unclassified tumor detected"
}


def is_valid_mri_scan(image_path):
    """Validate that the uploaded image resembles a brain MRI scan.

    Checks colour variance, dark-background ratio, and centre brightness
    to filter out non-medical images (photos, drawings, etc.).
    """
    img = cv2.imread(image_path)
    if img is None:
        return False

    # Colour check – MRIs are primarily grayscale
    b, g, r = cv2.split(img)
    diff_bg = np.abs(b.astype(np.int32) - g.astype(np.int32))
    diff_rg = np.abs(r.astype(np.int32) - g.astype(np.int32))
    if np.mean(diff_bg) > 20 or np.mean(diff_rg) > 20:
        return False

    # Dark-background check – MRIs have dark surrounding regions
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    dark_ratio = np.sum(gray < 40) / gray.size
    if dark_ratio < 0.05:
        return False

    # Centre check – brain matter should not be pitch-black
    h, w = gray.shape
    centre = gray[h // 3 : 2 * h // 3, w // 3 : 2 * w // 3]
    if np.mean(centre) < 20:
        return False

    return True


# ---------------------------------------------------------------------------
# Prediction helper
# ---------------------------------------------------------------------------
def predict_tumor(image_path):
    """Pre-process an image and run inference through the CNN model."""
    if model is None:
        raise RuntimeError(
            "Model not loaded. Place BrainTumorClassifier.keras in the backend/ folder."
        )

    image = cv2.imread(image_path)
    image = cv2.resize(image, (INPUT_SIZE, INPUT_SIZE))
    input_img = np.expand_dims(np.array(image), axis=0)
    input_img = normalize(input_img, axis=1)

    result = model.predict(input_img)
    predicted_class = int(np.argmax(result, axis=-1)[0])
    return CLASSES[predicted_class]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/predict", methods=["POST"])
def upload():
    """Accept an MRI image upload and return a tumour detection result."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    f = request.files["file"]
    upload_folder = os.path.join(BASE_DIR, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, secure_filename(f.filename))

    try:
        f.save(file_path)
    except Exception:
        return jsonify({"error": "Could not save file."}), 400

    if not is_valid_mri_scan(file_path):
        os.remove(file_path)
        return jsonify({
            "error": "The uploaded image does not look like an MRI. "
                     "Please provide a real MRI scan."
        }), 400

    try:
        result = predict_tumor(file_path)
        return jsonify({"detection": result, "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
