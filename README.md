# 🌿 LeafLens AI — Potato Disease Classifier

> An end-to-end deep learning system for detecting potato leaf diseases. Built with TensorFlow, FastAPI, React, React Native, and deployed on Google Cloud Platform.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Architecture](#architecture)
- [Disease Classes](#disease-classes)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Model Training](#1-model-training)
  - [2. Local API (FastAPI)](#2-local-api-fastapi)
  - [3. TensorFlow Serving (Docker)](#3-tensorflow-serving-docker)
  - [4. Frontend (React Web App)](#4-frontend-react-web-app)
  - [5. Mobile App (React Native Android)](#5-mobile-app-react-native-android)
- [Google Cloud Deployment](#google-cloud-deployment)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**LeafLens AI** is a full-stack machine learning application that identifies diseases in potato plant leaves from a single photo. A Convolutional Neural Network (CNN) trained on the PlantVillage dataset classifies leaf images into one of three categories — Early Blight, Late Blight, or Healthy — and returns a confidence score.

The system is accessible via:
- 🌐 A **React web app** with drag-and-drop image upload
- 📱 A **React Native Android app** with camera and gallery support
- ☁️ A **serverless Google Cloud Function** for scalable inference

---

## Demo

| Web App | Mobile App |
|--------|------------|
| Drag & drop a leaf image → instant diagnosis | Snap or pick a photo → diagnosis card with confidence % |

**Supported predictions:**
| Result | Color Indicator |
|--------|----------------|
| 🟠 Early Blight | Orange |
| 🔴 Late Blight | Red |
| 🟢 Healthy | Green |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────────┐          ┌──────────────────────────┐   │
│   │  React Web App   │          │  React Native Mobile App │   │
│   │  (Material UI)   │          │  (Android / iOS)         │   │
│   └────────┬─────────┘          └────────────┬─────────────┘   │
└────────────┼────────────────────────────────-┼─────────────────┘
             │  HTTP POST /predict              │  HTTP POST /predict
             ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                                                                 │
│   ┌─────────────────────┐    ┌──────────────────────────────┐  │
│   │  FastAPI (Local)    │    │  GCP Cloud Function          │  │
│   │  uvicorn @ :8000    │    │  (Serverless, auto-scaling)  │  │
│   │  main.py            │    │  gcp/main.py                 │  │
│   └────────┬────────────┘    └────────────┬─────────────────┘  │
│            │  (optional)                  │                     │
│   ┌────────▼────────────┐    ┌────────────▼─────────────────┐  │
│   │  TF Serving (Docker)│    │  Google Cloud Storage        │  │
│   │  REST @ :8501       │    │  Bucket: solar-node-tf-models│  │
│   │  main-tf-serving.py │    │  models/classifier_potato_3  │  │
│   └─────────────────────┘    └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│                       MODEL LAYER                               │
│                                                                 │
│   Keras CNN — classifier_potato_3.keras                        │
│   Input: 256×256 RGB image                                     │
│   Output: softmax over 3 classes                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Disease Classes

The model detects the following conditions:

| Class Label | Display Name | Description |
|-------------|-------------|-------------|
| `Potato___Early_blight` | Early Blight | Fungal infection (*Alternaria solani*) — dark spots with concentric rings |
| `Potato___Late_blight` | Late Blight | *Phytophthora infestans* — water-soaked lesions, white mold on underside |
| `Potato___healthy` | Healthy | No disease detected |

---

## Project Structure

```
Potato-disease-classifier/
│
├── 📓 potato_disease_classifier.ipynb   # Model training notebook
│
├── 📁 api/                              # Local FastAPI backend
│   ├── main.py                          # FastAPI server (direct Keras inference)
│   ├── main-tf-serving.py              # FastAPI server (TF Serving proxy)
│   └── requirements.txt
│
├── 📁 gcp/                              # Google Cloud Function
│   ├── main.py                          # Cloud Function entry point
│   └── requirements.txt
│
├── 📁 frontend/                         # React web application
│   ├── src/
│   │   ├── home.js                      # Main UI component
│   │   ├── App.js
│   │   └── index.css
│   ├── .env                             # API endpoint config
│   └── package.json
│
├── 📁 mobile-app/                       # React Native Android app
│   ├── App.js                           # Main app component
│   ├── Permissions.js
│   └── android/
│
├── 📁 training/                         # TF Serving config
│   └── models.config
│
├── 📁 saved_model/                      # Legacy SavedModel format
├── 📁 saved_model_new/                  # Current Keras model (.keras)
│   └── classifier_potato_3.keras
│
├── requirements.txt                     # Root Python dependencies
└── commands.txt                         # Docker / TF Serving commands
```

---

## Tech Stack

### Machine Learning
| Tool | Version | Purpose |
|------|---------|---------|
| TensorFlow / Keras | 2.20.0 | Model training & inference |
| NumPy | 1.26.4 | Numerical operations |
| Pillow | 10.4.0 | Image preprocessing |
| Matplotlib | 3.10.8 | Training visualization |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.115.0 | REST API framework |
| Uvicorn | 0.30.6 | ASGI server |
| python-multipart | 0.0.9 | File upload handling |
| TF Serving | 2.19.1 | Model serving (Docker) |
| google-cloud-storage | 3.10.1 | GCP model download |

### Frontend (Web)
| Tool | Version | Purpose |
|------|---------|---------|
| React | 17.0.2 | UI framework |
| Material UI | 4.12.4 | Component library |
| material-ui-dropzone | 3.5.0 | Drag-and-drop upload |
| Axios | 1.15.2 | HTTP client |

### Mobile (Android)
| Tool | Purpose |
|------|---------|
| React Native | Cross-platform mobile framework |
| react-native-image-picker | Camera & gallery access |
| react-native-config | Environment variable injection |
| Axios | HTTP client |

### Cloud
| Tool | Purpose |
|------|---------|
| Google Cloud Functions | Serverless model inference |
| Google Cloud Storage | Model artifact storage |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- Docker (for TF Serving)
- Android Studio + Android SDK (for mobile app)
- Google Cloud SDK (`gcloud`) — for deployment only

---

### 1. Model Training

Open and run the Jupyter notebook:

```bash
jupyter notebook potato_disease_classifier.ipynb
```

The notebook trains a CNN on the PlantVillage potato dataset. The trained model is saved to:
```
saved_model_new/classifier_potato_3.keras
```

---

### 2. Local API (FastAPI)

The FastAPI server loads the Keras model and exposes a `/predict` endpoint.

```bash
cd api
pip install -r requirements.txt
```

Run the server:
```bash
uvicorn main:app --reload --host localhost --port 8000
```

Or run directly:
```bash
python main.py
```

The API will be available at `http://localhost:8000`.

> **Health check:** `GET http://localhost:8000/ping` → `"hello i am alive"`

---

### 3. TensorFlow Serving (Docker)

An alternative to the direct FastAPI inference. Uses TF Serving for optimised batched inference.

**Step 1:** Start the TF Serving Docker container:

```bash
docker run -t --rm --platform linux/amd64 -p 8501:8501 \
  -v "/path/to/Potato-disease-classifier:/potato_app" \
  tensorflow/serving \
  --rest_api_port=8501 \
  --model_config_file=/potato_app/training/models.config
```

> Replace `/path/to/Potato-disease-classifier` with the absolute path to your local clone.

**Step 2:** Use the TF Serving API wrapper instead:

```bash
cd api
uvicorn main-tf-serving:app --reload --host localhost --port 8000
```

This routes requests through the TF Serving REST endpoint at `http://localhost:8501/v1/models/potatoes_model:predict`.

---

### 4. Frontend (React Web App)

```bash
cd frontend
npm install
```

**Configure the API endpoint** in `frontend/.env`:

```env
# Production (GCP Cloud Function)
REACT_APP_API_URL=https://us-central1-<your-project>.cloudfunctions.net/predict

# Local development
# REACT_APP_API_URL=http://localhost:8000/predict
```

**Start the development server:**

```bash
npm start
```

The app will open at `http://localhost:3000`.

**Build for production:**

```bash
npm run build
```

---

### 5. Mobile App (React Native Android)

```bash
cd mobile-app
npm install
```

**Configure the API endpoint** in `mobile-app/.env`:

```env
URL=http://localhost:8000/predict
# or for GCP:
# URL=https://us-central1-<your-project>.cloudfunctions.net/predict
```

**Run on Android emulator or device:**

```bash
npx react-native run-android
```

**Build a release APK:**

```bash
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

> **Permissions required:** `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`

---

## Google Cloud Deployment

The `gcp/` folder contains a single-function serverless deployment. The model is loaded lazily from a GCS bucket on first invocation and cached in memory for subsequent requests.

### Setup

**1. Upload the model to GCS:**

```bash
gsutil cp saved_model_new/classifier_potato_3.keras \
  gs://<your-bucket>/models/classifier_potato_3.keras
```

**2. Deploy the Cloud Function:**

```bash
cd gcp
gcloud functions deploy predict \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --memory 512MB \
  --timeout 120s
```

**3. Test the deployed function:**

```bash
curl -X POST \
  https://us-central1-<your-project>.cloudfunctions.net/predict \
  -F "file=@/path/to/leaf.jpg"
```

### GCP Configuration

| Variable | Value |
|----------|-------|
| Bucket Name | `solar-node-tf-models` |
| Model Path (GCS) | `models/classifier_potato_3.keras` |
| Model Cache Path | `/tmp/classifier_potato_3.keras` |
| Region | `us-central1` |

---

## API Reference

### `GET /ping`
Health check endpoint.

**Response:**
```json
"hello i am alive"
```

---

### `POST /predict`
Classifies a potato leaf image.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | `image/*` | Potato leaf image (JPEG, PNG) |

**Response:** `application/json`

```json
{
  "class": "Potato___Early_blight",
  "confidence": 97.43
}
```

**Possible `class` values:**
- `Potato___Early_blight`
- `Potato___Late_blight`
- `Potato___healthy`

**Example (curl):**

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@leaf_image.jpg"
```

**Example (JavaScript/Axios):**

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await axios.post(process.env.REACT_APP_API_URL, formData);
console.log(response.data); // { class: "Potato___healthy", confidence: 99.12 }
```

---

## Configuration

### CORS

The local FastAPI server permits requests from:
- `http://localhost`
- `http://localhost:3000`
- `http://localhost:3001`

The GCP Cloud Function sets `Access-Control-Allow-Origin: *` and handles preflight `OPTIONS` requests.

### Model Input

| Property | Value |
|----------|-------|
| Input shape | `(256, 256, 3)` |
| Color mode | RGB |
| Batch dimension | Added automatically via `np.expand_dims` |

---

## Dependencies

### Python (root `requirements.txt`)

### Frontend (`frontend/package.json`)



---



---

<p align="center">
  Built using TensorFlow · FastAPI · React · React Native · Google Cloud
</p>
