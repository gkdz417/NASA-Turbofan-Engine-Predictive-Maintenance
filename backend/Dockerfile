# Yapay Zeka tabanlı Python uygulamaları için uygun, hafif bir imaj kullanıyoruz
FROM python:3.10-slim

# Çalışma dizinini belirliyoruz
WORKDIR /app

# İşletim sistemi güncellemeleri ve gerekli temel derleyicileri yüklüyoruz
# (Tensorflow ve Pandas için bazı C++ bağımlılıkları gerekebilir)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Önce sadece requiremets dosyasını kopyalıyoruz ki 
# Docker'ın cache mekanizması her kod değişiminde paketleri baştan indirmesin
COPY requirements.txt .

# Kütüphaneleri kuruyoruz (Tensorflow kurulumu biraz vakit alacaktır)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Şimdi asıl kodlarımızı ve modelleri kopyalıyoruz
COPY . .

# Konteyner dışarıya 8000 portundan veri verecek
EXPOSE 8000

# FastAPI / Uvicorn sunucusunu başlatıyoruz
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
