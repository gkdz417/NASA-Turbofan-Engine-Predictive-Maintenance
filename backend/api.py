from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import pandas as pd
import joblib

from models import CustomSimulationData

# ================= NASA CMAPSS SENSÖR SÖZLÜĞÜ =================
SENSOR_DICT = {
    's1': {'name': 'Fan Inlet Temp. (T24)', 'unit': '°R', 'is_dropped': True},
    's2': {'name': 'LPC Outlet Temp. (T30)', 'unit': '°R', 'is_dropped': False, 'min': 641, 'max': 644},
    's3': {'name': 'HPC Outlet Temp. (T50)', 'unit': '°R', 'is_dropped': False, 'min': 1569, 'max': 1600},
    's4': {'name': 'LPT Outlet Temp. (Tinf)', 'unit': '°R', 'is_dropped': False, 'min': 1380, 'max': 1440},
    's5': {'name': 'Fan Inlet Pressure (P2)', 'unit': 'psia', 'is_dropped': True},
    's6': {'name': 'Bypass-duct Pressure (P15)', 'unit': 'psia', 'is_dropped': True},
    's7': {'name': 'HPC Outlet Pressure (P30)', 'unit': 'psia', 'is_dropped': False, 'min': 552, 'max': 555},
    's8': {'name': 'Physical Fan Speed (Nf)', 'unit': 'rpm', 'is_dropped': False, 'min': 2387, 'max': 2389},
    's9': {'name': 'Physical Core Speed (Nc)', 'unit': 'rpm', 'is_dropped': False, 'min': 9000, 'max': 9250},
    's10': {'name': 'Engine Pressure Ratio (EPR)', 'unit': '-', 'is_dropped': True},
    's11': {'name': 'Static Pressure HPC (Ps30)', 'unit': 'psia', 'is_dropped': False, 'min': 46, 'max': 48},
    's12': {'name': 'Ratio of Fuel/Ps30 (phi)', 'unit': '-', 'is_dropped': False, 'min': 517, 'max': 523},
    's13': {'name': 'Corrected Fan Speed (NRf)', 'unit': 'rpm', 'is_dropped': False, 'min': 2388, 'max': 2389},
    's14': {'name': 'Corrected Core Speed (NRc)', 'unit': 'rpm', 'is_dropped': False, 'min': 8100, 'max': 8250},
    's15': {'name': 'Bypass Ratio (BPR)', 'unit': '-', 'is_dropped': False, 'min': 8.3, 'max': 8.5},
    's16': {'name': 'Burner Fuel-Air Ratio', 'unit': '-', 'is_dropped': True},
    's17': {'name': 'Bleed Enthalpy (htc)', 'unit': '-', 'is_dropped': False, 'min': 390, 'max': 395},
    's18': {'name': 'Demanded Fan Speed (Nd)', 'unit': 'rpm', 'is_dropped': True},
    's19': {'name': 'Demanded Corrected Fan Speed', 'unit': 'rpm', 'is_dropped': True},
    's20': {'name': 'HPT Coolant Bleed', 'unit': 'lbm/s', 'is_dropped': False, 'min': 38, 'max': 40},
    's21': {'name': 'LPT Coolant Bleed', 'unit': 'lbm/s', 'is_dropped': False, 'min': 23, 'max': 23.5},
    'setting1': {'name': 'Operational Setting 1', 'unit': '-', 'is_dropped': False, 'min': -0.008, 'max': 0.008},
    'setting2': {'name': 'Operational Setting 2', 'unit': '-', 'is_dropped': False, 'min': -0.0006, 'max': 0.0006},
    'setting3': {'name': 'Operational Setting 3', 'unit': '-', 'is_dropped': False, 'min': 99.0, 'max': 101.0},
}

# ================= Global Hafıza =================
MODEL = None
SCALER = None
FEATURE_COLS = None
DROP_COLS = None
TEST_DATA = None
REAL_RUL_DATA = None
SEQUENCE_LENGTH = 50
EMA_SPAN = 5


def load_ai_artifacts():
    global MODEL, SCALER, FEATURE_COLS, DROP_COLS, TEST_DATA, REAL_RUL_DATA
    try:
        base_path = ".."
        
        # 1. Modeli ve Scaler'ı yükle
        print("🧠 AI Modeli Yükleniyor...")
        MODEL = load_model(f"{base_path}/nasa_jet_engine_model.keras")
        SCALER = joblib.load(f"{base_path}/scaler.pkl")
        FEATURE_COLS = joblib.load(f"{base_path}/feature_cols.pkl")
        DROP_COLS = joblib.load(f"{base_path}/drop_cols.pkl")
        
        # 2. Test verilerini yükle (Göstermek İçin)
        columns = ['id', 'cycle', 'setting1', 'setting2', 'setting3'] + [f's{i}' for i in range(1, 22)]
        TEST_DATA = pd.read_csv(f"{base_path}/test_FD001.txt", sep=r'\s+', header=None, names=columns)
        # 3. Gerçek RUL verilerini yükle
        REAL_RUL_DATA = pd.read_csv(f"{base_path}/RUL_FD001.txt", sep=r'\s+', header=None, names=['RUL'])
        print("✅ AI Modeli ve Veriler Başarıyla Belleğe Alındı!")
        
    except Exception as e:
        print(f"❌ Kritik Hata - AI Dosyaları Bulunamadı: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama Başlarken (Startup)
    load_ai_artifacts()
    yield
    # Uygulama Kapanırken (Shutdown)
    print("Shutting down NASA API...")

app = FastAPI(title="NASA Predictive Maintenance API", lifespan=lifespan)

# Frontend ile iletişim için CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Daha sonra Vercel linkimiz ile değiştireceğiz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======= YARDIMCI FONKSİYONLAR =======
def prepare_motor_data(motor_id: int):
    """Belirli bir motorun son SEQUENCE_LENGTH (50) kaydını çeker ve normalize eder."""
    group = TEST_DATA[TEST_DATA['id'] == motor_id].copy().reset_index(drop=True)
    
    if len(group) == 0:
        return None, None
        
    cols_normalize = ['setting1', 'setting2', 'setting3'] + [f's{i}' for i in range(1, 22)]
    
    # Scale işlemi
    group[cols_normalize] = SCALER.transform(group[cols_normalize])
    group = group.drop(columns=DROP_COLS, errors='ignore')
    
    # Sensör sinyalini düzleştirme (EMA)
    feature_cols = [c for c in group.columns if c not in ['id', 'cycle', 'RUL']]
    group[feature_cols] = group[feature_cols].ewm(span=EMA_SPAN, adjust=False).mean()
    
    v = group[feature_cols].values
    if len(v) < SEQUENCE_LENGTH:
        # Başa (sol tarafa) ilk değeri kopyalayarak padding (edge pad) atalım:
        pad_size = SEQUENCE_LENGTH - len(v)
        v = np.pad(v, ((pad_size, 0), (0, 0)), 'edge')
    else:
        v = v[-SEQUENCE_LENGTH:]
        
    X_input = v.reshape(1, SEQUENCE_LENGTH, len(feature_cols))
    
    # Test setindeki gerçeğe uygun, henüz normalize edilmemiş (veya denormalize edilmiş) saf değerler isteniyor
    raw_group = TEST_DATA[TEST_DATA['id'] == motor_id].copy().reset_index(drop=True)
    last_sensor_values = raw_group.iloc[-1].to_dict()
    
    # Tüm 50 birimlik zaman döngüsünün grafiğe aktarılabilmesi amaçlı sensör geçiş dizisi
    history_array = raw_group.tail(min(len(raw_group), SEQUENCE_LENGTH)).to_dict(orient='records')
    
    return X_input, last_sensor_values, history_array

# ================= API ENDPOINT'LERİ =================

@app.get("/")
def read_root():
    return {"message": "NASA Predictive Maintenance API is ON! Gökyüzüne Hoş Geldiniz."}

@app.get("/engines")
def get_engine_list():
    """Test setindeki kullanılabilir Motor ID'lerini döndürür"""
    ids = sorted(TEST_DATA['id'].unique().tolist())
    return {"available_engines": ids}

@app.get("/predict/{motor_id}")
async def get_prediction(motor_id: int):
    """Seçilen motorun anlık grafiğine bakıp RUL Tahmini yapar"""
    if MODEL is None:
        raise HTTPException(status_code=500, detail="AI Modeli henüz yüklenmedi.")
        
    # Veriyi modele uygun hale getir
    X_input, last_sensor_values, history_array = prepare_motor_data(motor_id)
    
    if X_input is None:
        raise HTTPException(status_code=404, detail=f"Motor {motor_id} bulunamadı.")
        
    # AI Tahmini
    predicted_rul = float(MODEL.predict(X_input, verbose=0).flatten()[0])
    
    # Gerçek Değeri Bul
    real_rul = float(REAL_RUL_DATA.iloc[motor_id - 1]['RUL'])
    
    status = "NORMAL"
    if predicted_rul < 20: status = "URGENT"
    elif predicted_rul < 50: status = "RISKY"
    
    # Sensör Map İşlemi
    detailed_sensors = {}
    for key, val in last_sensor_values.items():
        if key in SENSOR_DICT and not SENSOR_DICT[key]['is_dropped']:
            sensor_info = SENSOR_DICT[key]
            sensor_status = "Normal"
            if 'min' in sensor_info and 'max' in sensor_info:
                if val < sensor_info['min'] or val > sensor_info['max']:
                    sensor_status = "Danger"
                    
            detailed_sensors[key] = {
                "name": sensor_info['name'],
                "unit": sensor_info['unit'],
                "value": round(val, 2),
                "status": sensor_status
            }
        
    return {
        "motor_id": motor_id,
        "predicted_rul": max(0.0, round(predicted_rul, 1)),
        "real_rul": real_rul,
        "status": status,
        "sensors": detailed_sensors,
        "history": history_array
    }

@app.post("/predict/custom")
async def predict_custom_simulation(data: CustomSimulationData):
    """Kullanıcının manuel girdiği sensör verilerini gerçekçi bir zaman serisi ile birleştirip RUL tahminler."""
    if MODEL is None or SCALER is None:
        raise HTTPException(status_code=500, detail="AI Modeli henüz yüklenmedi.")
    
    # STRATEJI: Motor 1'in gerçek geçmiş verisini baz olarak al.
    # Kullanıcının girdiği veriyi bu serinin SON satırı olarak ekle.
    # Böylece model, gerçekçi bir bozulma eğrisi + kullanıcının anı'nı görür.
    base_motor_id = 1
    base_group = TEST_DATA[TEST_DATA['id'] == base_motor_id].copy().reset_index(drop=True)
    
    cols_normalize = ['setting1', 'setting2', 'setting3'] + [f's{i}' for i in range(1, 22)]
    
    # Kullanıcının verdiği sensör değerlerini bir satır olarak hazırla
    user_row = {col: data.sensors.get(col, 0.0) for col in cols_normalize}
    # Eksik kalan dropped sensörleri (s1, s5, s6 vb.) Motor 1'in son satırından al
    for col in cols_normalize:
        if col not in data.sensors:
            user_row[col] = float(base_group.iloc[-1][col])
    
    user_df = pd.DataFrame([user_row])
    user_df['id'] = base_motor_id
    user_df['cycle'] = int(base_group.iloc[-1]['cycle']) + 1
    
    # Son 49 geçmiş satırı al + kullanıcının satırını ekle = 50 satırlık seri
    history_count = SEQUENCE_LENGTH - 1
    base_tail = base_group.tail(history_count).copy()
    combined = pd.concat([base_tail, user_df], ignore_index=True)
    
    # --- Aynı Normal Endpoint Pipeline'ı ---
    # 1. Scale
    combined[cols_normalize] = SCALER.transform(combined[cols_normalize])
    # 2. Drop
    combined = combined.drop(columns=DROP_COLS, errors='ignore')
    # 3. Feature cols (id ve cycle hariç)
    feature_cols = [c for c in combined.columns if c not in ['id', 'cycle', 'RUL']]
    # 4. EMA düzleştirme
    combined[feature_cols] = combined[feature_cols].ewm(span=EMA_SPAN, adjust=False).mean()
    
    v = combined[feature_cols].values
    if len(v) < SEQUENCE_LENGTH:
        pad_size = SEQUENCE_LENGTH - len(v)
        v = np.pad(v, ((pad_size, 0), (0, 0)), 'edge')
    else:
        v = v[-SEQUENCE_LENGTH:]
    
    X_input = v.reshape(1, SEQUENCE_LENGTH, len(feature_cols))
    
    # AI Tahmini
    predicted_rul = float(MODEL.predict(X_input, verbose=0).flatten()[0])
    
    status = "NORMAL"
    if predicted_rul < 20: status = "URGENT"
    elif predicted_rul < 50: status = "RISKY"
    
    # Sensör Map İşlemi
    detailed_sensors = {}
    for key, val in data.sensors.items():
        if key in SENSOR_DICT and not SENSOR_DICT[key]['is_dropped']:
            sensor_info = SENSOR_DICT[key]
            sensor_status = "Normal"
            if 'min' in sensor_info and 'max' in sensor_info:
                if val < sensor_info['min'] or val > sensor_info['max']:
                    sensor_status = "Danger"
                    
            detailed_sensors[key] = {
                "name": sensor_info['name'],
                "unit": sensor_info['unit'],
                "value": round(val, 2),
                "status": sensor_status
            }
            
    return {
        "motor_id": "Özel Simülasyon",
        "predicted_rul": max(0.0, round(predicted_rul, 1)),
        "real_rul": "-", 
        "status": status,
        "sensors": detailed_sensors
    }

