"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, CheckCircle, Activity, User, LogOut, Globe, Info, Settings, Database, ArrowDownToLine, Cpu, Network, Layers, ChevronDown } from "lucide-react";
import { dict } from "./locales";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "SIMULATION" | "DOCS">("DASHBOARD");
  const [motorId, setMotorId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  // Custom Simulation State
  const [customSensors, setCustomSensors] = useState<{[key: string]: number}>({});
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const [isTakingLong, setIsTakingLong] = useState(false);

  const [user, setUser] = useState<string | null>("Misafir"); // Varsayılan ziyaretçi
  const [showImageModal, setShowImageModal] = useState(false);
  const [lang, setLang] = useState<"TR" | "EN">("TR");
  const [showLanding, setShowLanding] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem("nasa_lang") as "TR" | "EN";
    if (savedLang) setLang(savedLang);

    handleRandomizeSensors();
  }, [router]);

  const toggleLang = () => {
    const newLang = lang === "TR" ? "EN" : "TR";
    setLang(newLang);
    localStorage.setItem("nasa_lang", newLang);
  };

  const t = dict[lang];

  const handleLogout = () => {
    setShowLanding(true);
  };

  const fetchPrediction = async () => {
    const numId = parseInt(motorId);
    if (!numId || numId < 1 || numId > 100) {
      alert(t.limitError);
      return;
    }
    
    setLoading(true);
    setIsTakingLong(false);
    const timeoutId = setTimeout(() => setIsTakingLong(true), 3000);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/predict/${motorId}`);
      if (!response.ok) {
        alert(t.limitError);
        setLoading(false);
        clearTimeout(timeoutId);
        setIsTakingLong(false);
        return;
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert(t.apiError);
    } finally {
      clearTimeout(timeoutId);
      setIsTakingLong(false);
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('report-container');
    if(!element) return;
    setPdfGenerating(true);
    
    setTimeout(() => {
        html2canvas(element, { backgroundColor: '#0b0c10', scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`NASA_FleetReport_Motor${result?.motor_id || 'Sim'}.pdf`);
          setPdfGenerating(false);
        });
    }, 100);
  };

  const CMAPSS_KEYS = [
    { key: "s2", min: 641, max: 644 }, { key: "s3", min: 1569, max: 1600 },
    { key: "s4", min: 1380, max: 1440 }, { key: "s7", min: 552, max: 555 },
    { key: "s8", min: 2387, max: 2389 }, { key: "s9", min: 9000, max: 9250 },
    { key: "s11", min: 46, max: 48 }, { key: "s12", min: 517, max: 523 },
    { key: "s13", min: 2388, max: 2389 }, { key: "s14", min: 8100, max: 8250 },
    { key: "s15", min: 8.3, max: 8.5 }, { key: "s17", min: 390, max: 395 },
    { key: "s20", min: 38, max: 40 }, { key: "s21", min: 23, max: 23.5 },
    { key: "setting1", min: -0.008, max: 0.008 }, 
    { key: "setting2", min: -0.0006, max: 0.0006 },
    { key: "setting3", min: 100.0, max: 100.0 }
  ];

  const handleRandomizeSensors = () => {
    // 0.0 (Tamamen bozuk) ile 1.0 (Yepyeni) arası rastgele bir motor "sağlık durumu" seçimi
    const healthFactor = 0.2 + (Math.random() * 0.8); // 0.2 ile 1.0 arası
    
    // Küçük çevresel gürültü (%5 sapma)
    const noise = () => (Math.random() * 0.1 - 0.05);

    const newSensors: {[k:string]: number} = {};
    CMAPSS_KEYS.forEach(sensor => {
      let baseVal;
      
      // CMAPSS Veritabanında: Sıcaklıklar/Hızlar (s2, s3, s4 vb.) zamanla ARTAR.
      const ascSensors = ['s2', 's3', 's4', 's8', 's9', 's11', 's13', 's14', 's15', 's17'];
      // Basınçlar (s7, s12, s20, s21) zamanla DÜŞER.
      const descSensors = ['s7', 's12', 's20', 's21'];
      
      if (ascSensors.includes(sensor.key)) {
         // Health 1.0 (İyi) -> Min değere yakın olmalı.
         const position = 1.0 - healthFactor;
         baseVal = sensor.min + (sensor.max - sensor.min) * (position + noise());
      } 
      else if (descSensors.includes(sensor.key)) {
         // Health 1.0 (İyi) -> Max değere yakın olmalı.
         const position = healthFactor;
         baseVal = sensor.min + (sensor.max - sensor.min) * (position + noise());
      } 
      else {
         // Operational Settings
         if (sensor.key === "setting3") {
            baseVal = 100.0;
         } else {
            baseVal = sensor.min + Math.random() * (sensor.max - sensor.min);
         }
      }
      
      // Fiziksel sınırları (min/max) aşmaması için kırpma (Clamp)
      if (baseVal < sensor.min) baseVal = sensor.min;
      if (baseVal > sensor.max) baseVal = sensor.max;
      
      newSensors[sensor.key] = parseFloat(baseVal.toFixed(4));
    });
    setCustomSensors(newSensors);
  };

  const handleCustomSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    setIsTakingLong(false);
    const timeoutId = setTimeout(() => setIsTakingLong(true), 3000);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/predict/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensors: customSensors })
      });
      if (!response.ok) throw new Error("Simulation Error");
      const data = await response.json();
      setSimResult(data);
    } catch (error) {
      alert(t.apiError);
    } finally {
      clearTimeout(timeoutId);
      setIsTakingLong(false);
      setSimLoading(false);
    }
  };

  const parseValue = (key: string, val: string) => {
    setCustomSensors(prev => ({...prev, [key]: parseFloat(val) || 0}));
  };

  if (!user) return null; 

  if (showLanding) {
    return (
      <div className="w-full h-screen bg-[#f8fafc] flex flex-col justify-between items-center text-slate-800 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 py-6 px-6">
         
         {/* Background effects — light theme */}
         <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
         <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/30 filter blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-50/50 filter blur-[120px] pointer-events-none"></div>
         <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

         {/* TOP BAR */}
         <div className="z-10 w-full max-w-6xl flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-900/10 flex items-center justify-center border border-blue-900/10">
               <Network className="w-4 h-4 text-[#1a237e]"/>
             </div>
             <span className="text-xs font-bold text-[#1a237e] uppercase tracking-[0.2em]">NASA CMAPSS · Predictive Maintenance</span>
           </div>
           <button onClick={toggleLang} className="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm border border-slate-200 px-3 py-1.5 cursor-pointer z-50 rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all font-semibold hover:shadow-md">
             <Globe className="w-4 h-4 text-[#1a237e]" /> 
             <div className="flex items-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${lang === 'TR' ? 'bg-[#1a237e] text-white' : 'text-slate-400'}`}>TR</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${lang === 'EN' ? 'bg-[#1a237e] text-white' : 'text-slate-400'}`}>EN</span>
             </div>
           </button>
         </div>

         {/* MAIN CONTENT */}
         <div className="z-10 max-w-6xl w-full flex flex-col items-center text-center">

            {/* Hook line */}
            <div className="mb-3 text-base md:text-lg text-slate-500 font-medium italic">
              &quot;{t.landingSubtitle}&quot; &nbsp;<span className="not-italic font-black text-[#1a237e]">{t.landingAnswer}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tight leading-[1.0] text-center text-[#1a237e]">
              {t.landingTitle}
              <br/>
              <span className="text-slate-800">{t.landingTitle2}</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 max-w-3xl mb-10 leading-relaxed font-medium">
              {t.landingDesc}
            </p>

            {/* 3 Feature Cards — light style matching user photo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8 text-left">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1a237e] flex items-center justify-center group-hover:bg-[#1a237e] group-hover:text-white transition-colors duration-300">
                       <Database className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-bold text-[#1a237e] uppercase tracking-widest">{t.landingF1Tag}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{t.landingF1Title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">&quot;{t.landingF1Desc}&quot;</p>
               </div>
               
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1a237e] flex items-center justify-center group-hover:bg-[#1a237e] group-hover:text-white transition-colors duration-300">
                       <Cpu className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-bold text-[#1a237e] uppercase tracking-widest">{t.landingF2Tag}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{t.landingF2Title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t.landingF2Desc}</p>
               </div>
               
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1a237e] flex items-center justify-center group-hover:bg-[#1a237e] group-hover:text-white transition-colors duration-300">
                       <Activity className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-bold text-[#1a237e] uppercase tracking-widest">{t.landingF3Tag}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{t.landingF3Title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t.landingF3Desc}</p>
               </div>
            </div>

            {/* How it works — light */}
            <div className="w-full bg-white/50 backdrop-blur-sm border border-slate-100 px-8 py-5 mb-8 flex items-center gap-6 rounded-2xl shadow-sm">
              <span className="text-xs font-black text-[#1a237e] uppercase tracking-widest whitespace-nowrap">{t.landingHowTitle}</span>
              <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-8 h-8 rounded-full bg-[#1a237e] text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
                  <p className="text-xs text-slate-600 font-medium">{t.landingStep1}</p>
                </div>
                <div className="text-slate-300">→</div>
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-8 h-8 rounded-full bg-[#1a237e] text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
                  <p className="text-xs text-slate-600 font-medium">{t.landingStep2}</p>
                </div>
                <div className="text-slate-300">→</div>
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-8 h-8 rounded-full bg-[#1a237e] text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
                  <p className="text-xs text-slate-600 font-medium">{t.landingStep3}</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => setShowLanding(false)}
              className="bg-[#1a237e] hover:bg-blue-800 text-white font-bold text-lg px-12 py-5 rounded-full shadow-xl hover:shadow-blue-200 transition-all hover:-translate-y-1 flex items-center gap-3 group"
            >
              <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" /> {t.launchBtn}
            </button>
         </div>

         {/* FOOTER */}
         <div className="z-10 text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            Engineered by <span className="text-[#1a237e] ml-1">Gökdeniz Erten</span>
         </div>
      </div>
    );
  } 

  return (
    <div className="w-full h-screen bg-[#f8fafc] text-slate-800 font-sans relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* GLOBAL BACKGROUND EFFECTS — Light Theme */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/20 filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-50/40 filter blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

      {/* LANGUAGE TOGGLE */}
      <button onClick={toggleLang} className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm border border-slate-200 px-2 py-1 rounded-full bg-white/80 backdrop-blur-md z-50 transition-colors shadow-sm">
        <Globe className="w-4 h-4 ml-1 text-[#1a237e]" />
        <div className="flex items-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${lang === 'TR' ? 'bg-[#1a237e] text-white' : 'text-slate-400'}`}>TR</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${lang === 'EN' ? 'bg-[#1a237e] text-white' : 'text-slate-400'}`}>EN</span>
        </div>
      </button>

      {/* MAIN SINGLE SCROLLABLE CONTAINER */}
      <div className="w-full h-full overflow-y-auto px-4 pt-4 pb-32 relative z-10 flex flex-col items-center">
        
        {/* TOP NAVBAR */}
        <div className="w-full max-w-7xl glass-panel px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md mb-6 shadow-sm">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
              <Network className="text-[#1a237e] w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-[#1a237e] uppercase tracking-[0.2em] font-bold">{t.navBrand1}</div>
              <div className="font-semibold text-slate-900 tracking-wide text-sm">{t.navBrand2}</div>
            </div>
          </div>
          
          <div className="hidden md:flex bg-slate-50 p-1 rounded-md border border-slate-100 shadow-inner">
            <button onClick={()=>setActiveTab("DASHBOARD")} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'DASHBOARD' ? 'bg-[#1a237e] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
              <Activity className="w-4 h-4"/> {t.tabDashboard}
            </button>
            <button onClick={()=>setActiveTab("SIMULATION")} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'SIMULATION' ? 'bg-[#1a237e] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
              <Settings className="w-4 h-4"/> {t.tabSim}
            </button>
            <button onClick={()=>setActiveTab("DOCS")} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'DOCS' ? 'bg-[#1a237e] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
              <Database className="w-4 h-4"/> {t.tabDocs}
            </button>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg bg-white shadow-sm">
            <LogOut className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline text-sm font-medium">{t.returnToLanding}</span>
          </button>
        </div>

        {/* HEADER / HERO TITLE */}
        <div className="w-full max-w-7xl text-center mt-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl md:text-5xl font-black text-[#1a237e] mb-2 drop-shadow-sm leading-tight">
            {t.dashTitle}
          </h1>
          <p className="text-slate-500 text-sm tracking-[0.3em] font-bold uppercase opacity-80">
            {activeTab === "DASHBOARD" ? t.dashDesc : activeTab === "SIMULATION" ? t.simTitle : t.docTitle}
          </p>
        </div>

        {/* ===================== TAB CONTENT: DOCS ===================== */}
        {activeTab === "DOCS" && (
          <div className="w-full max-w-7xl glass-panel p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white/95 relative group/docs border border-blue-50 shadow-xl">
            
            {/* Arka Plan Efektleri */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "linear-gradient(#1a237e 1px, transparent 1px), linear-gradient(90deg, #1a237e 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="mb-12 border-b border-slate-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                   <div className="text-[#1a237e] uppercase tracking-[0.3em] font-bold text-xs mb-3 flex items-center gap-2">
                     <Network className="w-4 h-4"/> Bilişim Raporu Ve Altyapı
                   </div>
                   <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                     {t.docTitle}
                   </h2>
                 </div>
                 <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 text-xs text-slate-500 font-mono">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> ALGORITHM: LSTM_v3.4
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Sol Kutu - CMAPSS */}
                <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 shadow-sm group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                    <Database className="text-[#1a237e] w-6 h-6"/>
                  </div>
                  <h3 className="text-slate-900 font-bold mb-4 text-xl tracking-wide">{t.whatIsCmapss}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{t.cmapssDesc}</p>
                </div>

                {/* Orta Div - Yapay Zeka Nasıl Çalışıyor */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
                  <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <Cpu className="text-blue-700 w-6 h-6"/>
                      </div>
                      <h3 className="text-slate-900 font-bold mb-4 text-xl tracking-wide">{t.howItWorks}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm mb-6">{t.howItWorksDesc}</p>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4 font-mono text-[10px] sm:text-xs text-slate-500 relative shadow-inner overflow-hidden flex flex-col justify-center">
                      <div className="text-blue-700 mb-2">// LSTM Neural Network Structure</div>
                      <div className="text-slate-800">model = Sequential()</div>
                      <div className="text-indigo-800">model.add(<span className="text-blue-900">LSTM</span>(units=100, return_sequences=True))</div>
                      <div className="text-indigo-800">model.add(<span className="text-blue-900">Dropout</span>(0.2))</div>
                      <div className="text-indigo-800">model.add(<span className="text-blue-900">LSTM</span>(units=50, return_sequences=False))</div>
                      <div className="text-indigo-800">model.add(<span className="text-blue-900">Dense</span>(units=1, activation=&apos;linear&apos;))</div>
                      <div className="text-green-700 mt-2"># RUL Regression Output</div>
                    </div>
                  </div>
                </div>

                {/* Alt Tam Genişlik - Neden 100 */}
                <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all flex flex-col sm:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1.5 h-full bg-[#1a237e]"></div>
                  
                  <div className="shrink-0 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                    <Activity className="text-blue-900 w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-slate-900 font-bold mb-2 text-lg tracking-wide">{t.why100}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm max-w-5xl">{t.why100Desc}</p>
                  </div>
                </div>
                  {/* ===================== TAB CONTENT: SIMULATION ===================== */}
        {activeTab === "SIMULATION" && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-6 w-full lg:w-2/3 bg-white shadow-lg border border-slate-100">
               <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2"><Settings className="w-5 h-5 text-[#1a237e]"/> {t.simTitle}</h2>
                    <p className="text-[11px] text-slate-500 tracking-wider uppercase font-bold">{t.simDesc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleRandomizeSensors} className="bg-blue-50 text-[#1a237e] border border-blue-100 px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm">
                      <Activity className="w-4 h-4" /> {t.simRandomBtn}
                    </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {CMAPSS_KEYS.map((sensor) => (
                    <div key={sensor.key} className="flex flex-col gap-1.5 group">
                      <label className="text-[10px] text-[#1a237e] uppercase tracking-widest font-black">
                        {sensor.key} <span className="text-slate-400 font-normal">({sensor.min}-{sensor.max})</span>
                      </label>
                      <input 
                        type="number" step="0.0001"
                        value={customSensors[sensor.key] || ""}
                        onChange={(e) => parseValue(sensor.key, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 text-sm focus:outline-none focus:border-[#1a237e] transition-all group-hover:border-slate-300 focus:bg-white"
                      />
                    </div>
                  ))}
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2 relative">
                  <button 
                    onClick={handleCustomSimulation}
                    disabled={simLoading}
                    className="w-full bg-[#1a237e] hover:bg-blue-800 text-white font-bold py-3.5 rounded-md transition-all shadow-md disabled:opacity-50 text-sm tracking-widest uppercase flex justify-center items-center gap-2"
                  >
                    {simLoading && <Activity className="w-4 h-4 animate-spin" />}
                    {simLoading ? t.analyzing : t.simCalculateBtn}
                  </button>
                  {/* Slow API Warning for Custom Simulation */}
                  {isTakingLong && simLoading && (
                    <div className="absolute top-full left-0 mt-2 w-full p-2.5 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] text-center italic font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 shadow-md z-50">
                      <Info className="w-3.5 h-3.5 text-yellow-600" />
                      {t.wakeUpWarning}
                    </div>
                  )}
               </div>
            </div>

            <div className="glass-panel p-6 w-full lg:w-1/3 flex flex-col justify-center items-center min-h-[300px] bg-white border border-slate-100 shadow-inner">
              {!simResult ? (
                 <div className="text-slate-500 text-center flex flex-col items-center justify-center h-full">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center animate-spin-slow mb-4">
                     <Activity className="w-6 h-6 text-slate-400"/>
                   </div>
                   <p className="text-sm tracking-wide">{t.waitingData}</p>
                 </div>
              ) : (
                 <div className="w-full text-center fade-in flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-left">
                        <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1">{t.analyzedUnit}</h3>
                        <div className="font-bold text-lg text-slate-900">{t.customSimLabel}</div>
                      </div>
                      
                      <button onClick={downloadPDF} disabled={pdfGenerating} className="text-xs flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded text-slate-600 transition-colors border border-slate-200">
                        <ArrowDownToLine className="w-3 h-3" /> PDF
                      </button>
                    </div>

                    <div className={`flex-1 p-8 rounded-xl border flex flex-col items-center justify-center mx-auto shadow-2xl w-full mb-6 relative overflow-hidden ${
                      simResult.status === 'NORMAL' ? 'bg-green-50 border-green-200' :
                      simResult.status === 'RISKY' ? 'bg-amber-50 border-amber-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <span className="text-slate-600 mb-2 font-medium tracking-wide z-10">{t.remainingLife}</span>
                      <span className={`text-7xl font-black z-10 tracking-tighter ${
                        simResult.status === 'NORMAL' ? 'text-green-700' :
                        simResult.status === 'RISKY' ? 'text-amber-700' : 
                        'text-red-700'
                      }`}>
                        {simResult.predicted_rul}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest z-10">{t.flightCycle}</span>
                    </div>

                    <div className="flex items-center justify-center">
                       {simResult.status === "NORMAL" ? (
                          <span className="text-sm font-semibold bg-green-100 text-green-700 border border-green-200 px-5 py-2.5 rounded-full flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> {t.statusNormal}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold bg-red-100 text-red-700 border border-red-200 px-5 py-2.5 rounded-full flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {t.statusDanger}
                          </span>
                        )}
                    </div>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB CONTENT: DASHBOARD ===================== */}
        {activeTab === "DASHBOARD" && (
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500" id="report-container">
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <div className="glass-panel p-6 flex flex-col gap-4 bg-white border border-slate-100 shadow-lg">
                <div>
                  <label className="text-xs text-[#1a237e] tracking-widest uppercase font-bold flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4" /> {t.targetMotor}
                  </label>
                  <div className="relative">
                    <select
                      value={motorId}
                      onChange={(e) => setMotorId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-slate-900 focus:outline-none focus:border-[#1a237e] transition-colors text-xl font-bold text-center shadow-inner appearance-none cursor-pointer"
                    >
                      {Array.from({length: 100}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num} className="bg-white text-slate-800">{t.motor} #{num}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1a237e]">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={fetchPrediction}
                  className="w-full bg-[#1a237e] hover:bg-blue-800 text-white font-bold py-3.5 rounded-md transition-all shadow-md disabled:opacity-50 mt-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <Activity className="w-4 h-4 animate-spin" />}
                  {loading ? t.analyzing : t.telemetryBtn}
                </button>
                {/* Slow API Warning for Dashboard */}
                {isTakingLong && loading && (
                  <div className="mt-2 w-full p-2.5 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] text-center italic flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 shadow-sm">
                    <Info className="w-3.5 h-3.5" />
                    {t.wakeUpWarning}
                  </div>
                )}
              </div>

              <div className="glass-panel p-6 flex flex-col items-center border border-slate-100 bg-white shadow-lg">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 w-full text-center flex items-center justify-center gap-2">
                  <Database className="w-3 h-3"/> {t.fleetStatusTitle}
                </h3>
                <div 
                  onClick={() => setShowImageModal(true)}
                  className="relative w-full aspect-video rounded flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors group"
                >
                  <Image 
                    src="/fleet_report.png" 
                    alt="Fleet Overview" 
                    fill 
                    className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay"></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 text-center leading-relaxed font-medium uppercase tracking-wider">
                  {t.fleetStatusDesc}
                </p>
              </div>

            </div>

            <div className="lg:col-span-2 flex flex-col gap-6 min-w-0 w-full overflow-hidden">
              {!result ? (
                <div className="glass-panel flex-1 min-h-[400px] flex items-center justify-center text-slate-400 flex-col gap-4 border-dashed border-2 border-slate-200 hover:border-slate-300 transition-colors w-full bg-white">
                  <Activity className="w-12 h-12 opacity-20 animate-pulse" />
                  <p className="text-sm tracking-wide font-medium">{t.waitingData}</p>
                </div>
              ) : (
                <div className="glass-panel p-6 md:p-8 flex flex-col gap-8 bg-white border border-slate-100 shadow-lg relative overflow-hidden min-w-0 w-full">
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 relative z-10">
                    <div className="flex flex-col gap-2">
                      <div className="text-slate-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                        {t.analyzedUnit}
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px]">ID: {result.motor_id}</span>
                      </div>
                      <div className="text-4xl font-black flex items-center gap-4 text-slate-900">
                        {t.motor} #{result.motor_id}
                        
                        {result.status === "NORMAL" ? (
                          <span className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> {t.statusNormal}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> {t.statusDanger}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button onClick={downloadPDF} disabled={pdfGenerating} className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1a237e] px-3 py-1.5 rounded transition-colors border border-blue-100">
                          <ArrowDownToLine className="w-3.5 h-3.5" /> PDF
                      </button>

                      <div className={`px-6 py-5 rounded-xl border flex flex-col items-center justify-center min-w-[200px] shadow-sm relative overflow-hidden ${
                        result.status === 'NORMAL' ? 'bg-green-50 border-green-100' :
                        result.status === 'RISKY' ? 'bg-amber-50 border-amber-100' :
                        'bg-red-50 border-red-100'
                      }`}>
                        <span className="text-slate-600 mb-1 font-medium text-sm tracking-wide">{t.remainingLife}</span>
                        <span className={`text-6xl font-black tracking-tighter ${
                          result.status === 'NORMAL' ? 'text-green-700' :
                          result.status === 'RISKY' ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {result.predicted_rul}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-widest font-bold">{t.flightCycle}</span>
                      </div>
                    </div>
                  </div>

                  {/* RECHARTS - SENSOR DEGRADATION PLOT */}
                  {result.history && result.history.length > 0 && (
                    <div className="w-full bg-slate-50 rounded-xl border border-slate-100 p-5 mt-2 shadow-inner relative z-10 overflow-hidden min-w-0">
                       <h3 className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                         <Activity className="text-[#1a237e] w-3.5 h-3.5" /> {t.chartTitle}
                       </h3>
                       <div className="h-[200px] w-full text-xs min-w-0 overflow-hidden">
                          <ResponsiveContainer width="99%" height="100%">
                            <LineChart data={result.history}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                              <XAxis dataKey="cycle" stroke="#94a3b8" tick={{fill: '#64748b'}} tickMargin={10} minTickGap={20} />
                              <YAxis yAxisId="left" stroke="#3b82f6" tick={{fill: '#64748b'}} domain={['auto', 'auto']} width={40} />
                              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fill: '#64748b'}} domain={['auto', 'auto']} width={40} />
                              <Tooltip 
                                labelStyle={{color: '#9ca3af', marginBottom: '4px', fontSize: '10px'}}
                              />
                              <Line yAxisId="left" type="monotone" dataKey="s2" name="LPC Outlet T." stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{r: 4}} />
                              <Line yAxisId="right" type="monotone" dataKey="s3" name="HPC Outlet T." stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{r: 4}} />
                            </LineChart>
                          </ResponsiveContainer>
                       </div>
                       
                       {/* GRAFİK BİLGİ KUTUSU */}
                       <div className="mt-4 p-3 rounded-lg bg-blue-900/10 border border-blue-900/30 flex gap-3">
                         <Info className="w-5 h-5 text-blue-400 shrink-0" />
                         <div>
                           <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">{t.chartInfoTitle}</div>
                           <div className="text-[11px] text-slate-400 leading-relaxed font-medium">{t.chartInfoDesc}</div>
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <h3 className="text-[11px] font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Database className="text-neonCyan w-3.5 h-3.5" /> {t.matrixTitle}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {Object.entries(result.sensors).map(([key, sensor]: [string, any]) => (
                        <div 
                          key={key} 
                          className={`p-3 rounded-lg border flex flex-col relative overflow-hidden transition-all group ${
                            sensor.status === "Danger" 
                            ? "bg-red-950/20 border-red-900/50 hover:bg-red-950/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]" 
                            : "bg-[#12131f] border-slate-800 hover:border-slate-700 hover:bg-[#161826]"
                          }`}
                        >
                          {sensor.status === "Danger" && (
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-red-500 m-2.5 shadow-[0_0_8px_rgba(239,68,68,1)] animate-ping"></div>
                          )}
                          <span className="text-[9px] font-bold text-neonCyan uppercase tracking-widest">{key}</span>
                          <span className="text-[11px] text-slate-400 font-medium mt-0.5 mb-2 line-clamp-1" title={sensor.name}>{sensor.name}</span>
                          <div className="flex items-baseline gap-1 mt-auto">
                            <span className={`text-lg font-black tracking-tight ${sensor.status === "Danger" ? "text-red-400" : "text-slate-200 group-hover:text-white"}`}>
                              {sensor.value}
                            </span>
                            <span className="text-[9px] font-medium text-slate-500">{sensor.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        )}
        {/* FOOTER BRANDING INSIDE SCROLL - Centered and Spaced */}
        <div className="w-full max-w-7xl flex items-center justify-center py-12 mt-12 border-t border-slate-800/50 text-slate-600 text-[10px] font-bold tracking-[0.3em] uppercase">
          Engineered by <span className="text-neonCyan ml-1.5 mr-3">GÖKDENİZ ERTEN</span> | <span className="ml-3">NASA Predictive Maintenance Network © 2026</span>
        </div>
      </div>

      {showImageModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out backdrop-blur-md"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image 
              src="/fleet_report.png" 
              alt="Fleet Overview Fullscreen" 
              fill 
              className="object-contain"
            />
            <button 
              className="absolute -top-4 -right-4 bg-red-500/80 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-red-500 transition-colors border border-white/20"
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
