# ✈️ NASA Turbofan Engine — Predictive Maintenance AI Dashboard

An AI-powered predictive maintenance platform that estimates the **Remaining Useful Life (RUL)** of turbofan jet engines using Deep Learning. Built with **NASA's CMAPSS open-source dataset**.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.16-orange?logo=tensorflow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)

---

## 🚀 Project Overview

In aerospace, predicting when an engine will fail is critical for safety and cost management. This project uses a **Long Short-Term Memory (LSTM)** neural network to analyze time-series sensor data and predict how many flight cycles an engine has left before failure.

### Key Features
- **Fleet Telemetry Dashboard** — Select any engine (1–100) and get instant AI-powered RUL predictions with degradation charts
- **Custom Simulation** — Input your own sensor readings to predict RUL for any hypothetical engine
- **Project Report** — Built-in technical documentation explaining the AI methodology
- **PDF Export** — Download analysis reports as PDF
- **Bilingual UI** — Full Turkish / English language support

---

## 🧠 Technical Architecture

### Backend (Python / FastAPI)
| Component | Technology |
|-----------|-----------|
| API Framework | FastAPI + Uvicorn |
| AI Model | TensorFlow / Keras LSTM |
| Data Processing | Pandas, NumPy, Scikit-learn |
| Model Architecture | 2× LSTM layers (100 & 50 units) + Dropout (0.2) + Dense |
| Sequence Length | 50 flight cycles (sliding window) |

### Frontend (Next.js)
| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS |
| Charts | Recharts |
| PDF Generation | jsPDF + html2canvas |
| Icons | Lucide React |

### AI Pipeline
```
Raw Sensor Data → MinMaxScaler → Drop Zero-Variance Cols → 
EMA Smoothing (span=5) → Sliding Window (50 cycles) → 
LSTM Network → RUL Prediction
```

---

## ⚙️ Installation & Usage

### Prerequisites
- Python 3.10+ with pip
- Node.js 18+ with npm
- NASA CMAPSS FD001 dataset files (`test_FD001.txt`, `RUL_FD001.txt`, `train_FD001.txt`)

### 1. Clone & Setup Backend
```bash
git clone https://github.com/your-username/nasa-predictive-maintenance.git
cd nasa-predictive-maintenance

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Start Backend API
```bash
cd backend
uvicorn api:app --reload
```
The API will start at `http://localhost:8000`

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`

---

## 📁 Project Structure
```
├── backend/
│   ├── api.py              # FastAPI endpoints & AI inference
│   ├── models.py           # Pydantic data models
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Container configuration
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx        # Main dashboard (Landing + Dashboard + Simulation + Docs)
│   │   ├── locales.ts      # TR/EN translations
│   │   └── globals.css     # Global styles
│   └── public/
│       └── fleet_report.png
├── nasa_jet_engine_model.keras   # Trained LSTM model
├── scaler.pkl                     # MinMaxScaler
├── feature_cols.pkl               # Selected feature columns
├── drop_cols.pkl                  # Dropped zero-variance columns
├── test_FD001.txt                 # NASA test dataset
├── train_FD001.txt                # NASA training dataset
├── RUL_FD001.txt                  # Ground truth RUL values
└── README.md
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/engines` | List available engine IDs |
| `GET` | `/predict/{motor_id}` | Predict RUL for a specific engine |
| `POST` | `/predict/custom` | Predict RUL from custom sensor data |

---

## 👨‍💻 Author

**Gökdeniz Erten**

---

**Disclaimer:** This is an academic project using open-source NASA data to demonstrate time-series forecasting with deep learning. It does not replace certified aerospace safety analytics.
