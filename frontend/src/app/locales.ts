export const dict = {
  TR: {
    // Genel
    lang: "EN", 
    langText: "English",
    navBrand1: "NASA CMAPSS",
    navBrand2: "Predictive Maintenance AI",

    // Dashboard - Tabs
    tabDashboard: "Filo Telemetrisi",
    tabSim: "Özel Simülasyon",
    tabDocs: "Proje Raporu",

    // Dashboard - Main
    dashTitle: "Jet Fleet Command Center",
    dashDesc: "Gelişmiş Turbofan Motor Mimarisi Telemetri Ağı",
    targetMotor: "Hedef Motor ID",
    telemetryBtn: "Telemetriyi Başlat",
    analyzing: "Sinir Ağı Çözümleniyor...",
    fleetStatusTitle: "Genel Filo Operasyon Durumu",
    fleetStatusDesc: "Filodaki 100 ünitenin aktif yaşam döngüsü dağılımı (RUL Eğrisi).",
    waitingData: "Telemetri verisi bekleniyor. Lütfen analiz başlatın.",
    analyzedUnit: "Analiz Edilen Birim",
    motor: "Motor",
    statusNormal: "Uçuşa Uygun",
    statusDanger: "Bakım Gerekiyor",
    remainingLife: "Kalan Yararlı Ömür",
    flightCycle: "Uçuş Döngüsü",
    liveTelemetry: "Canlı Sensör Telemetrisi",
    apiError: "API'ye bağlanılamadı. Lütfen Backend sunucusunun açık olduğundan emin olun.",
    limitError: "Sistemde sadece 1 ile 100 arasında tanımlı test motoru bulunmaktadır. Kendi verileriniz için Özel Simülasyon sekmesini kullanın.",

    // Dashboard - Docs
    docTitle: "NASA CMAPSS ve Yapay Zeka Altyapısı",
    whatIsCmapss: "Havacılıkta Kestirimci Bakım & CMAPSS Verisi",
    cmapssDesc: "CMAPSS (Commercial Modular Aero-Propulsion System Simulation), NASA tarafından geliştirilen ve turbofan jet motorlarının bozulma döngülerini milisaniyeler bazında simüle eden devasa bir açık veri setidir. Uçak motorları mekanik hata vermeden çok önce mikro fiziksel devinimler (titreşim, minör basınç kayıpları) gösterir. Biz bu projede, 21 farklı sensör içinden yapay zekanın sadece çöküşü tetikleyen 14 hayati sensöre (LPC/HPC çıkış değerleri vb.) odaklanmasını sağladık. Böylece 'gürültüyü' eleyerek analiz netliğini maksimize ettik.",
    why100: "Laboratuvarımız (Test Motorları) ve Özel Simülasyon Ağı",
    why100Desc: "Sistemimizin omurgası, NASA'nın FD001 (Deniz Seviyesi Standart Şartlarında Mekanik Arıza) setindeki 100 benzersiz jet motorunun karakteristik yorulma paternleriyle eğitildi. Filo panelinde incelediğiniz bu birimler, modelin geçmişten ders aldığı mutlak laboratuvar sonuçlarıdır. Ancak devrimsel olan kısım; 'Özel Simülasyon' reaktörü sayesinde uygulamanın sadece bu 100 birimle kısıtlı kalmamasıdır. Model, öğrendiği nöral örüntüler sayesinde, dünyanın başka bir yerinden sisteme gireceğiniz anlık sensör değerleri üzerinden herhangi bir motorun 'Remaining Useful Life (RUL - Kalan Yararlı Ömür)' skorunu anında tahmin edebilecek Evrensel (Generalization) bir zekaya ulaştı.",
    howItWorks: "Derin Öğrenme & LSTM Zaman Serisi Mimarisi",
    howItWorksDesc: "Kurduğumuz mimari anlık verilere tepki veren sıradan bir makine öğrenmesi değil, Temporal (Zaman Serisi) analizi yapabilen Derin Öğrenme (Deep Learning) tabanlı bir LSTM ağıdır. Motor arızaları anlık oluşmaz, birikerek gerçekleşir. Bu yüzden modelimize motorun sadece son saniyesini değil, geriye dönük son 50 uçuşunun tüm profilini aynı 3 Boyutlu Matrix içinde iletiyoruz. Backend (Python/FastAPI) üzerinde çalışan Sequential Keras ağı, bu 50 döngülük haritadaki en ufak istikrarsızlığı saptayarak insan gözünün fark edemeyeceği matematiksel hataları yakalıyor. Motor hiçbir kaza alarmı vermiyorken dahi ömrünün tükeneceği uçuşu hatasız öngörebiliyor.",

    // Dashboard - Simulation
    simTitle: "Özel Simülasyon Paneli",
    simDesc: "Canlı sensör verilerinizi girerek yapay zekanın motorunuz için RUL değerini (kalan uçuş döngüsü) hesaplamasını sağlayın.",
    simRandomBtn: "Rastgele (Mantıksal) Veri Üret",
    simCalculateBtn: "Özel Simülasyonu Başlat",
    chartTitle: "Telemetri Bozunma Grafiği (Son 50 Döngü)",
    matrixTitle: "Son Ölçeklenen Telemetri Matrix'i",
    customSimLabel: "ÖZEL SİMÜLASYON",
    chartInfoTitle: "Grafik Ne Anlama Geliyor?",
    chartInfoDesc: "Mavi çizgi LPC (Düşük Basınç Fırını) ve kırmızı çizgi HPC (Yüksek Basınç Fırını) çıkış sıcaklıklarını temsil eder. Uçuş sayısı arttıkça (sağa doğru), bu değerlerin istikrarsız biçimde tırmanması motor içi mekanik parçaların aşındığını ve ömrünün (RUL) sonuna o kadar hızla yaklaştığını açıkça göstermektedir.",

    // Landing Page
    landingBadge: "Yapay Zeka ile Kestirimci Bakım",
    landingTitle: "NASA Turbofan Motor",
    landingTitle2: "Arıza Tahmin Sistemi",
    landingSubtitle: "Bir uçak motoru arızalanmadan önce sizi uyarabilir mi?",
    landingAnswer: "Bu sistem uyarıyor.",
    landingDesc: "NASA'nın gerçek sensör verilerinden eğitilmiş bir Derin Öğrenme modeli, jet motorlarının kaç uçuş sonra bakım gerekeceğini önceden hesaplar. Saniyeler içinde sonuç.",

    // Feature cards
    landingF1Title: "RUL Nedir?",
    landingF1Desc: "\"Remaining Useful Life\" — motorun arızalanmadan önce kalan uçuş döngüsü sayısı. Bu sistem tam olarak bunu tahmin eder.",
    landingF1Tag: "Temel Kavram",
    landingF2Title: "NASA Verisi ile Eğitildi",
    landingF2Desc: "100 farklı jet motorundan toplanan milyonlarca sensör ölçümü ile eğitildi. Baskı, sıcaklık, titreşim verileri dahil.",
    landingF2Tag: "CMAPSS Dataset",
    landingF3Title: "Derin Öğrenme (LSTM)",
    landingF3Desc: "Motorun son 50 uçuş geçmişini analiz eden bir LSTM ağı. İnsan gözünün göremeyeceği örüntüleri tespit eder.",
    landingF3Tag: "AI Mimarisi",

    // How it works steps
    landingHowTitle: "Nasıl Çalışır?",
    landingStep1: "Sensörler, motordaki sıcaklık/basınç verilerini uçuş başına ölçer",
    landingStep2: "Son 50 uçuşun verisi bir matris olarak modele iletilir",
    landingStep3: "LSTM ağı, bozulma örüntüsünü analiz eder ve RUL tahminler",

    launchBtn: "Paneli Aç — Analizi Başlat",
    returnToLanding: "Sunuma Dön",
  },
  EN: {
    // General
    lang: "TR",
    langText: "Türkçe",
    navBrand1: "NASA CMAPSS",
    navBrand2: "Predictive Maintenance AI",

    // Dashboard - Tabs
    tabDashboard: "Fleet Telemetry",
    tabSim: "Custom Simulation",
    tabDocs: "Project Report",

    // Dashboard - Main
    dashTitle: "Jet Fleet Command Center",
    dashDesc: "Advanced Turbofan Engine Architecture Telemetry Network",
    targetMotor: "Target Engine ID",
    telemetryBtn: "Initiate Telemetry",
    analyzing: "Resolving Neural Network...",
    fleetStatusTitle: "General Fleet Operational Status",
    fleetStatusDesc: "Active life cycle distribution of 100 units in the fleet (RUL Curve).",
    waitingData: "Awaiting telemetry data. Please initiate analysis.",
    analyzedUnit: "Analyzed Unit",
    motor: "Engine",
    statusNormal: "Cleared for Flight",
    statusDanger: "Maintenance Required",
    remainingLife: "Remaining Useful Life",
    flightCycle: "Flight Cycle",
    liveTelemetry: "Live Sensor Telemetry",
    apiError: "Cannot connect to API. Please ensure the Backend server is running.",
    limitError: "There are only 100 test engines defined in the system. Use the Custom Simulation tab for testing your own data.",

    // Dashboard - Docs
    docTitle: "NASA CMAPSS & Artificial Intelligence Infrastructure",
    whatIsCmapss: "Predictive Maintenance & CMAPSS Intelligence",
    cmapssDesc: "CMAPSS (Commercial Modular Aero-Propulsion System Simulation) is a rigorous open dataset developed by NASA, simulating specific degradation cycles of turbofan jet engines. Engines inherently broadcast micro-physical deviations (vibration, thermal leaks, pressure drops) long before an observable catastrophic failure occurs. In this architecture, we engineered a feature-selection mechanism that isolates the 14 most critical sensors (such as LPC/HPC dynamics) out of 21, effectively eliminating noise and maximizing the precision of our Remaining Useful Life prediction.",
    why100: "Our Laboratory Data & Generalized Custom Network",
    why100Desc: "The backbone of this AI is strictly trained on 100 unique jet engines from the FD001 (Sea Level Standards) condition. While the Fleet Telemetry panel allows you to observe these 100 historical cases, the application transcends static reporting through the 'Custom Simulation' reactor. It enables engineers to inject ad-hoc, real-world sensor streams into the network. Leveraging its robust generalized neural pattern recognition, the model instantly predicts the exact physical endurance capability (RUL) of completely unknown external engines without retraining.",
    howItWorks: "Deep Learning & LSTM Time-Series Dynamics",
    howItWorksDesc: "A simple linear machine learning setup reacts to immediate snapshots, whereas engine failure accumulates over time. Thus, our backend leverages a Deep Learning LSTM (Long Short-Term Memory) sequence model operating via Python FastAPI. Instead of one data point, we feed the network an exact sliding window of the engine's last 50 absolute flight cycles as a 3D matrix. The Keras Sequential network scans these 50-cycle pathways, aggressively tracking microscopic decay patterns, enabling it to foresee the exact operational failure frontier even when the physical engine exhibits optimal functioning metrics to the naked eye.",

    // Dashboard - Simulation
    simTitle: "Custom Simulation Panel",
    simDesc: "Enter live sensor data or use the random generator to calculate the real-time Remaining Useful Life (RUL) of your engine via the AI model.",
    simRandomBtn: "Autofill Logical Data",
    simCalculateBtn: "Initialize Custom Simulation",
    chartTitle: "Telemetry Degradation Plot (Last 50 Cycles)",
    matrixTitle: "Latest Scaled Telemetry Matrix",
    customSimLabel: "CUSTOM SIMULATION",
    chartInfoTitle: "What does this graph mean?",
    chartInfoDesc: "The blue line represents LPC and the red line represents HPC outlet temperatures. A continuous or unstable rise in these temperatures across flight cycles directly indicates severe degradation of internal engine components, heavily accelerating the Remaining Useful Life (RUL) towards failure.",

    // Landing Page
    landingBadge: "Predictive Maintenance with AI",
    landingTitle: "NASA Turbofan Engine",
    landingTitle2: "Failure Prediction System",
    landingSubtitle: "Can an aircraft engine warn you before it breaks down?",
    landingAnswer: "This system does.",
    landingDesc: "A Deep Learning model trained on NASA's real sensor data calculates how many flights remain before a jet engine needs maintenance. Results in seconds.",

    // Feature cards
    landingF1Title: "What is RUL?",
    landingF1Desc: "\"Remaining Useful Life\" — the number of flight cycles left before engine failure. This system predicts exactly that.",
    landingF1Tag: "Core Concept",
    landingF2Title: "Trained on NASA Data",
    landingF2Desc: "Trained on millions of sensor readings from 100 real jet engines. Includes pressure, temperature, and vibration data.",
    landingF2Tag: "CMAPSS Dataset",
    landingF3Title: "Deep Learning (LSTM)",
    landingF3Desc: "An LSTM network that analyzes the last 50 flight cycles of an engine, detecting patterns invisible to the human eye.",
    landingF3Tag: "AI Architecture",

    // How it works steps
    landingHowTitle: "How Does It Work?",
    landingStep1: "Sensors measure temperature & pressure data from the engine per flight",
    landingStep2: "Last 50 flights of data are passed as a matrix to the model",
    landingStep3: "The LSTM network analyzes degradation patterns and predicts RUL",

    launchBtn: "Open Dashboard — Start Analysis",
    returnToLanding: "Back to Presentation",
  }
};
