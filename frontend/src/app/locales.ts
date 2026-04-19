export const dict = {
  TR: {
    // Genel
    lang: "EN", 
    langText: "Türkçe",

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
    // Faz 4 ve UI Fix
    chartTitle: "Telemetri Bozunma Grafiği (Son 50 Döngü)",
    matrixTitle: "Son Ölçeklenen Telemetri Matrix'i",
    customSimLabel: "ÖZEL SİMÜLASYON",
    chartInfoTitle: "Grafik Ne Anlama Geliyor?",
    chartInfoDesc: "Mavi çizgi LPC (Düşük Basınç Fırını) ve kırmızı çizgi HPC (Yüksek Basınç Fırını) çıkış sıcaklıklarını temsil eder. Uçuş sayısı arttıkça (sağa doğru), bu değerlerin istikrarsız biçimde tırmanması motor içi mekanik parçaların aşındığını ve ömrünün (RUL) sonuna o kadar hızla yaklaştığını açıkça göstermektedir."
  },
  EN: {
    // General
    lang: "TR",
    langText: "English",

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
    // Phase 4 and UI Fix
    chartTitle: "Telemetry Degradation Plot (Last 50 Cycles)",
    matrixTitle: "Latest Scaled Telemetry Matrix",
    customSimLabel: "CUSTOM SIMULATION",
    chartInfoTitle: "What does this graph mean?",
    chartInfoDesc: "The blue line represents LPC and the red line represents HPC outlet temperatures. A continuous or unstable rise in these temperatures across flight cycles directly indicates severe degradation of internal engine components, heavily accelerating the Remaining Useful Life (RUL) towards failure."
  }
};
