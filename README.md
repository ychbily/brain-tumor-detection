# 🧠 Brain Tumor Detection

A deep-learning web application that classifies brain MRI scans into multiple tumor categories using a custom CNN built with TensorFlow / Keras. The project ships as a fully containerised production stack — **React + Vite** frontend served by **Nginx** and a **Flask + Gunicorn** API backend — orchestrated with Docker Compose.

> [!CAUTION]
> **Educational Purpose Only.** This application is strictly an educational proof-of-concept and must **never** be used as a substitute for professional medical diagnosis. Brain tumor detection requires specialised medical expertise — always consult a qualified neurologist or radiologist. This tool is designed to assist medical professionals by minimising scan review time, **not** to replace them.

---

## 📂 Project Structure

```
brain_Tumor_Detection/
├── backend/
│   ├── app.py                         # Flask API (inference + MRI validation)
│   ├── BrainTumorClassifier.keras     # Trained model (not tracked by git)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                          # React + Vite UI (served by Nginx)
│   ├── src/
│   ├── nginx.conf
│   └── Dockerfile
├── Model_Training.ipynb               # Google Colab training notebook
├── test_pictures/                     # Sample MRI images for testing
├── docker-compose.yml
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Multi-Class CNN** | 5-class architecture with **BatchNormalization**, **EarlyStopping**, and **ReduceLROnPlateau** to prevent overfitting. |
| **MRI Validation** | Rejects non-medical uploads by analysing colour variance and pixel intensity. |
| **Containerised** | One-command production startup with Docker Compose (Gunicorn + Nginx). |
| **Modern Frontend** | React + Vite drag-and-drop interface with real-time scan animation. |

**Classification Categories:**

| Class | Description |
|---|---|
| No Tumor | Healthy brain scan |
| Glioma | Glioma tumor detected |
| Meningioma | Meningioma tumor detected |
| Pituitary | Pituitary tumor detected |
| Unclassified | Unclassified tumor detected |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- The trained model file `BrainTumorClassifier.keras` placed inside `backend/`

### Getting the Pre-Trained Model

If you don't want to retrain the model yourself, you can download the pre-trained weights directly:

> **[⬇️ Download BrainTumorClassifier.keras from Google Drive](https://drive.google.com/drive/folders/1EkjMa6NPCeG3E72Fg5LXM9rZPgJL7tQh?usp=sharing)**

Place the downloaded file inside the `backend/` directory before running Docker Compose.

### Run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

### How to Use

1. Open `http://localhost:5173` in your browser.
2. Drag and drop a brain MRI scan (or click to upload).
3. Click **Analyze Scan** — the model will classify the scan into one of the 5 categories.
4. The result is displayed with the specific tumor type detected.

---

## 🔬 API

### `POST /predict`

Upload an MRI image for tumour classification.

**Request** — `multipart/form-data` with a `file` field.

```bash
curl -X POST -F "file=@scan.jpg" http://localhost:5000/predict
```

**Success Response** — `200`

```json
{
  "detection": "GLIOMA, tumor detected",
  "status": "success"
}
```

**Error Responses**

| Code | Reason |
|---|---|
| `400` | No file uploaded, image is not a valid MRI, model not loaded, or analysis failed |

---

## 🛠 Model Training

If you need to retrain the model or experiment with different hyperparameters:

1. Open **`Model_Training.ipynb`** in [Google Colab](https://colab.research.google.com/).
2. Add your Kaggle credentials as Colab Secrets (`KAGGLE_USERNAME`, `KAGGLE_KEY`).
3. Run all cells — the notebook downloads the datasets, trains the CNN with overfitting protection, and exports `BrainTumorClassifier.keras`.
4. Download the model file and place it in `backend/`.

---

## 🧩 Tech Stack

- **Backend:** Python · Flask · Gunicorn · TensorFlow · Keras 3 · OpenCV
- **Frontend:** React · TypeScript · Vite · Tailwind CSS
- **Infrastructure:** Docker · Docker Compose · Nginx