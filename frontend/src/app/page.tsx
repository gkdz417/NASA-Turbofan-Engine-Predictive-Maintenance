"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, CheckCircle, Activity, LogOut, Globe, Info, Settings, Database, ArrowDownToLine, Cpu, Network, ChevronDown } from "lucide-react";
import { dict } from "./locales";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
        html2canvas(element, { backgroundColor: '#ffffff', scale: 2 }).then((canvas) => {
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
      <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col items-center text-[#1E293B] relative overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white pb-12">
         
         {/* Background effects — light theme subtle glows */}
         {/* Background effects — subtle tech grid and glows */}
         <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
         <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-200/10 filter blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-slate-200/20 filter blur-[100px] pointer-events-none"></div>
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

         {/* TOP BAR */}
         <div className="z-10 w-full max-w-6xl flex items-center justify-between px-6 py-6">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20 shadow-sm">
               <Network className="w-4 h-4 text-blue-700"/>
             </div>
             <span className="text-[10px] md:text-xs font-bold text-blue-900 uppercase tracking-[0.2em]">{t.navBrand1} · {t.navBrand2}</span>
           </div>
           <button onClick={toggleLang} className="text-slate-600 hover:text-blue-900 flex items-center gap-2 text-sm border border-slate-200 px-3 py-1.5 cursor-pointer z-50 rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all font-semibold hover:shadow-md">
             <Globe className="w-4 h-4" /> 
             <div className="flex items-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${lang === 'TR' ? 'bg-blue-900 text-white' : 'text-slate-400'}`}>TR</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${lang === 'EN' ? 'bg-blue-900 text-white' : 'text-slate-400'}`}>EN</span>
             </div>
           </button>
         </div>

         {/* MAIN CONTENT */}
         <div className="z-10 max-w-6xl w-full flex flex-col items-center text-center px-6 mt-4 md:mt-8">

            {/* Hook line */}
            <div className="mb-4 text-sm md:text-lg text-slate-500 font-medium italic">
              &quot;{t.landingSubtitle}&quot; &nbsp;<span className="not-italic font-black text-blue-700">{t.landingAnswer}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] text-center text-[#1A237E]">
              {t.landingTitle}
              <br className="hidden sm:block"/>
              <span className="text-blue-600">{t.landingTitle2}</span>
            </h1>
            
            <p className="text-sm md:text-xl text-[#1E293B] max-w-3xl mb-10 leading-relaxed font-bold">
              {t.landingDesc}
            </p>

            {/* 3 Feature Cards — Light Theme Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10 text-left">
               <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300 shadow-sm">
                       <Database className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.landingF1Tag}</span>
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg mb-2">{t.landingF1Title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t.landingF1Desc}</p>
               </div>
               
               <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300 shadow-sm">
                       <Cpu className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.landingF2Tag}</span>
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg mb-2">{t.landingF2Title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t.landingF2Desc}</p>
               </div>
               
               <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300 shadow-sm">
                       <Activity className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.landingF3Tag}</span>
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg mb-2">{t.landingF3Title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t.landingF3Desc}</p>
               </div>
            </div>

            {/* How it works — Light responsive steps */}
            <div className="w-full glass-panel p-6 md:p-8 mb-10 text-left bg-white/60">
              <h2 className="text-xs font-black text-blue-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-600 rounded-full"></div>
                {t.landingHowTitle}
              </h2>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <span className="w-10 h-10 rounded-full bg-blue-900 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-lg">1</span>
                  <p className="text-sm text-slate-600 font-medium leading-snug">{t.landingStep1}</p>
                </div>
                <div className="hidden md:block text-slate-300 font-light text-2xl">→</div>
                <div className="flex items-center gap-4 flex-1">
                  <span className="w-10 h-10 rounded-full bg-blue-900 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-lg">2</span>
                  <p className="text-sm text-slate-600 font-medium leading-snug">{t.landingStep2}</p>
                </div>
                <div className="hidden md:block text-slate-300 font-light text-2xl">→</div>
                <div className="flex items-center gap-4 flex-1">
                  <span className="w-10 h-10 rounded-full bg-blue-900 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-lg">3</span>
                  <p className="text-sm text-slate-600 font-medium leading-snug">{t.landingStep3}</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => setShowLanding(false)}
              className="bg-[#1A237E] hover:bg-blue-800 text-white font-bold text-lg px-8 md:px-12 py-5 rounded-full shadow-2xl hover:shadow-blue-200 transition-all hover:-translate-y-1 flex items-center gap-3 group relative overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" /> {t.launchBtn}
            </button>
         </div>

         {/* FOOTER */}
         <div className="mt-12 text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            Engineered by <span className="text-blue-900 ml-1">Gökdeniz Erten</span>
         </div>
      </div>
    );
  } 

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* GLOBAL BACKGROUND EFFECTS - Subtle Soft Glows */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/40 filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-100/40 filter blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

      {/* LANGUAGE TOGGLE */}
      <button onClick={toggleLang} className="absolute top-4 right-4 text-slate-500 hover:text-blue-900 flex items-center gap-2 text-xs border border-slate-200 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md z-50 transition-all shadow-sm">
        <Globe className="w-3.5 h-3.5" />
        <div className="flex items-center">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${lang === 'TR' ? 'bg-blue-900 text-white' : 'text-slate-400'}`}>TR</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${lang === 'EN' ? 'bg-blue-900 text-white' : 'text-slate-400'}`}>EN</span>
        </div>
      </button>

      {/* MAIN SINGLE SCROLLABLE CONTAINER */}
      <div className="w-full h-full px-4 pt-4 pb-20 relative z-10 flex flex-col items-center">
        
        {/* TOP NAVBAR */}
        <div className="w-full max-w-7xl glass-panel px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between border border-slate-200 bg-white/90 backdrop-blur-md mb-6 gap-4">

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center border border-blue-200 shadow-sm">
              <Network className="text-blue-900 w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-blue-800 uppercase tracking-[0.2em] font-bold">{t.navBrand1}</div>
              <div className="font-extrabold text-[#1A237E] tracking-tight text-sm uppercase">{t.navBrand2}</div>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button onClick={()=>setActiveTab("DASHBOARD")} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'bg-[#1A237E] text-white shadow-lg' : 'text-slate-500 hover:bg-white/60 hover:text-blue-900'}`}>
              <Activity className="w-4 h-4"/> {t.tabDashboard}
            </button>
            <button onClick={()=>setActiveTab("SIMULATION")} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'SIMULATION' ? 'bg-[#1A237E] text-white shadow-lg' : 'text-slate-500 hover:bg-white/60 hover:text-blue-900'}`}>
              <Settings className="w-4 h-4"/> {t.tabSim}
            </button>
            <button onClick={()=>setActiveTab("DOCS")} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'DOCS' ? 'bg-[#1A237E] text-white shadow-lg' : 'text-slate-500 hover:bg-white/60 hover:text-blue-900'}`}>
              <Database className="w-4 h-4"/> {t.tabDocs}
            </button>
          </div>

          <button onClick={handleLogout} className="w-full sm:w-auto flex items-center justify-center gap-2 text-slate-500 hover:text-blue-900 transition-all border border-slate-200 hover:border-blue-900/20 px-4 py-2.5 rounded-xl bg-white shadow-sm hover:shadow-md">
            <LogOut className="w-4 h-4 rotate-180" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.returnToLanding}</span>
          </button>
        </div>

        {/* HEADER / HERO TITLE */}
        <div className="w-full max-w-7xl text-center mt-2 mb-8 px-4">
          <h1 className="text-2xl md:text-5xl font-black text-[#1A237E] mb-2 drop-shadow-sm leading-tight tracking-tight">
            {t.dashTitle}
          </h1>
          <p className="text-slate-500 text-[10px] md:text-xs tracking-[0.4em] font-black uppercase opacity-60">
            {activeTab === "DASHBOARD" ? t.dashDesc : activeTab === "SIMULATION" ? t.simTitle : t.docTitle}
          </p>
        </div>

        {/* ===================== TAB CONTENT: DOCS ===================== */}
        {activeTab === "DOCS" && (
          <div className="w-full max-w-7xl glass-panel animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white shadow-2xl relative border border-slate-200 overflow-hidden rounded-[2.5rem]">
            {/* Header Section */}
            <div className="p-8 md:p-12 bg-slate-50 border-b border-slate-200">
              <div className="mb-10 border-b border-slate-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                   <div className="text-blue-600 uppercase tracking-[0.3em] font-black text-[10px] mb-3 flex items-center gap-2">
                     <Network className="w-4 h-4"/> NASA AI SYSTEMS ALGORITHM
                   </div>
                   <h2 className="text-3xl md:text-5xl font-black text-[#1A237E] max-w-3xl leading-tight tracking-tight">
                     {t.docTitle}
                   </h2>
                 </div>
                 <div className="text-left md:text-right">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-[10px] text-blue-900 font-mono font-bold">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> LSTM_NEURAL_v3.4
                    </div>
                 </div>
              </div>
              
              <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-300 transition-all duration-300 group shadow-md flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                    <Database className="w-6 h-6"/>
                  </div>
                  <h3 className="text-[#1A237E] font-black mb-4 text-xl tracking-tight uppercase">{t.whatIsCmapss}</h3>
                  <p className="text-slate-800 leading-relaxed text-sm font-bold">{t.cmapssDesc}</p>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-300 transition-all duration-300 group shadow-md relative overflow-hidden">
                  <div className="flex flex-col xl:flex-row gap-8 relative z-10 h-full">
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-[#1A237E] text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                        <Cpu className="w-6 h-6"/>
                      </div>
                      <h3 className="text-[#1A237E] font-black mb-4 text-xl tracking-tight uppercase">{t.howItWorks}</h3>
                      <p className="text-slate-800 leading-relaxed text-sm font-bold mb-6">{t.howItWorksDesc}</p>
                    </div>

                    <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 font-mono text-[10px] sm:text-xs text-white relative shadow-2xl overflow-hidden flex flex-col gap-1.5 self-stretch min-h-[220px]">
                       <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                         <div className="flex gap-1">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                         </div>
                         <span className="text-[9px] text-white/40 font-bold ml-2">lstm_model.py</span>
                       </div>
                       <div className="text-blue-400 font-bold mb-1 italic"># LSTM NEURAL NETWORK ARCHITECTURE</div>
                       <div className="text-pink-400">model <span className="text-white">=</span> Sequential()</div>
                       <div className="text-white">model.<span className="text-yellow-300">add</span>(LSTM(units<span className="text-white">=</span><span className="text-orange-400">100</span>, sequences<span className="text-white">=</span><span className="text-orange-400">True</span>))</div>
                       <div className="text-blue-300 italic">model.<span className="text-yellow-300">add</span>(Dropout(<span className="text-orange-400">0.2</span>))</div>
                       <div className="text-white">model.<span className="text-yellow-300">add</span>(LSTM(units<span className="text-white">=</span><span className="text-orange-400">50</span>))</div>
                       <div className="text-white">model.<span className="text-yellow-300">add</span>(Dense(units<span className="text-white">=</span><span className="text-orange-400">1</span>))</div>
                       <div className="text-green-400 mt-2 font-bold italic">// ENGINE RUL PREDICTION</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-[#1A237E] p-8 rounded-3xl border border-blue-950 transition-all flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                  <div className="shrink-0 w-20 h-20 rounded-full bg-blue-700/50 flex items-center justify-center border-4 border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                    <Activity className="text-white w-10 h-10" />
                  </div>
                  <div className="text-center md:text-left relative z-10">
                    <h3 className="text-white font-black mb-2 text-2xl tracking-tight leading-none uppercase">{t.why100}</h3>
                    <p className="text-blue-100 leading-relaxed text-base font-bold max-w-4xl opacity-90">{t.why100Desc}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB CONTENT: SIMULATION ===================== */}
        {activeTab === "SIMULATION" && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" id="report-container">
            <div className="glass-panel p-6 md:p-8 w-full lg:w-2/3 bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-[#1A237E] mb-1 flex items-center gap-2"><Settings className="w-6 h-6 text-blue-600"/> {t.simTitle}</h2>
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">{t.simDesc}</p>
                  </div>
                  <button onClick={handleRandomizeSensors} className="w-full sm:w-auto bg-blue-50 text-blue-900 border border-blue-200 px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm">
                    <Activity className="w-4 h-4" /> {t.simRandomBtn}
                  </button>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {CMAPSS_KEYS.map((sensor) => (
                    <div key={sensor.key} className="flex flex-col gap-2 group">
                      <label className="text-[10px] text-blue-900 uppercase tracking-widest font-black flex justify-between">
                        {sensor.key} <span className="text-slate-400 font-medium">[{sensor.min}-{sensor.max}]</span>
                      </label>
                      <input 
                        type="number" step="0.0001"
                        value={customSensors[sensor.key] || ""}
                        onChange={(e) => parseValue(sensor.key, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all focus:ring-4 ring-blue-50 group-hover:border-slate-300"
                      />
                    </div>
                  ))}
               </div>

               <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4 relative">
                  <button 
                    onClick={handleCustomSimulation}
                    disabled={simLoading}
                    className="w-full bg-[#1A237E] hover:bg-blue-800 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-200 disabled:opacity-50 text-sm tracking-[0.2em] uppercase flex justify-center items-center gap-3"
                  >
                    {simLoading && <Activity className="w-5 h-5 animate-spin" />}
                    {simLoading ? t.analyzing : t.simCalculateBtn}
                  </button>
                  {isTakingLong && simLoading && (
                    <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs text-center font-bold italic flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Info className="w-5 h-5" />
                      {t.wakeUpWarning}
                    </div>
                  )}
               </div>
            </div>

            <div className="glass-panel p-8 w-full lg:w-1/3 flex flex-col justify-center items-center min-h-[400px] bg-slate-50 border border-slate-200 shadow-xl relative overflow-hidden">
              {!simResult ? (
                 <div className="text-slate-400 text-center flex flex-col items-center justify-center h-full">
                   <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center animate-spin-slow mb-6">
                     <Activity className="w-8 h-8 text-slate-300"/>
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.2em]">{t.waitingData}</p>
                 </div>
              ) : (
                 <div className="w-full text-center fade-in flex flex-col h-full z-10">
                    <div className="flex justify-between items-start mb-8 text-left">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">{t.analyzedUnit}</h3>
                        <div className="font-black text-xl text-[#1A237E]">{t.customSimLabel}</div>
                      </div>
                      <button onClick={downloadPDF} disabled={pdfGenerating} className="text-[10px] font-black flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:border-blue-200 transition-all shadow-sm">
                        <ArrowDownToLine className="w-4 h-4 text-blue-600" /> PDF
                      </button>
                    </div>

                    <div className={`flex-1 p-10 rounded-3xl border-4 flex flex-col items-center justify-center mx-auto shadow-2xl w-full mb-8 relative ${
                      simResult.status === 'NORMAL' ? 'bg-white border-green-500 shadow-green-100' :
                      simResult.status === 'RISKY' ? 'bg-white border-yellow-500 shadow-yellow-100' :
                      'bg-white border-red-500 shadow-red-100'
                    }`}>
                      <span className="text-slate-500 mb-2 font-bold uppercase tracking-widest text-[10px]">{t.remainingLife}</span>
                      <span className={`text-8xl font-black tracking-tighter ${
                        simResult.status === 'NORMAL' ? 'text-green-600' :
                        simResult.status === 'RISKY' ? 'text-yellow-600' : 
                        'text-red-700'
                      }`}>
                        {simResult.predicted_rul}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-4 uppercase font-black tracking-widest">{t.flightCycle}</span>
                    </div>

                    <div className="flex items-center justify-center">
                       {simResult.status === "NORMAL" ? (
                          <span className="text-xs font-black bg-green-50 text-green-700 border-2 border-green-200 px-8 py-3.5 rounded-full flex items-center gap-3 uppercase tracking-tighter shadow-lg shadow-green-100">
                            <CheckCircle className="w-5 h-5" /> {t.statusNormal}
                          </span>
                        ) : (
                          <span className="text-xs font-black bg-red-50 text-red-700 border-2 border-red-200 px-8 py-3.5 rounded-full flex items-center gap-3 uppercase tracking-tighter shadow-lg shadow-red-100">
                            <AlertTriangle className="w-5 h-5" /> {t.statusDanger}
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
              
              <div className="glass-panel p-8 flex flex-col gap-6 bg-white border-t-4 border-[#1A237E] shadow-xl">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-blue-900 tracking-[0.3em] uppercase font-black flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" /> {t.targetMotor}
                  </label>
                  <div className="relative group">
                    <select
                      value={motorId}
                      onChange={(e) => setMotorId(e.target.value)}
                      className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-5 text-[#1A237E] focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-2xl font-black text-center shadow-md cursor-pointer appearance-none group-hover:border-blue-400"
                    >
                      {Array.from({length: 100}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{t.motor} #{num}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-900/60 transition-transform group-hover:translate-y-[-40%]">
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={fetchPrediction}
                  className="w-full bg-[#1A237E] hover:bg-blue-800 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-200 disabled:opacity-50 text-sm tracking-[0.2em] uppercase flex justify-center items-center gap-3"
                  disabled={loading}
                >
                  {loading && <Activity className="w-5 h-5 animate-spin" />}
                  {loading ? t.analyzing : t.telemetryBtn}
                </button>
                {isTakingLong && loading && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs text-center font-bold italic flex items-center justify-center gap-3 animate-pulse">
                    <Info className="w-5 h-5" />
                    {t.wakeUpWarning}
                  </div>
                )}
              </div>

              <div className="glass-panel p-6 bg-white border border-slate-200 shadow-xl flex flex-col items-center">
                <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center justify-center gap-2 w-full bg-slate-50 py-3 rounded-xl border border-slate-100">
                  <Database className="w-4 h-4 text-blue-600"/> {t.fleetStatusTitle}
                </h3>
                <div 
                  onClick={() => setShowImageModal(true)}
                  className="relative w-full aspect-video rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 border-2 border-slate-100 cursor-pointer hover:border-blue-200 transition-all group"
                >
                  <Image 
                    src="/fleet_report.png" 
                    alt="Fleet Overview" 
                    fill 
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-6 text-center leading-relaxed font-bold uppercase tracking-widest">
                  {t.fleetStatusDesc}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6 min-w-0 w-full">
              {!result ? (
                <div className="glass-panel flex-1 min-h-[500px] flex items-center justify-center text-slate-300 flex-col gap-6 bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] w-full">
                  <Activity className="w-20 h-20 opacity-10 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">{t.waitingData}</p>
                </div>
              ) : (
                <div className="glass-panel p-6 md:p-10 flex flex-col gap-8 bg-white border-t-4 border-[#1A237E] shadow-2xl relative overflow-hidden rounded-[2rem] w-full">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100 relative z-10">
                    <div className="flex flex-col gap-3">
                      <div className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black flex items-center gap-2">
                        {t.analyzedUnit}
                        <span className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-[9px] font-bold border border-blue-100">ID: {result.motor_id}</span>
                      </div>
                      <div className="text-4xl md:text-5xl font-black flex flex-wrap items-center gap-6 text-[#1A237E]">
                        {t.motor} #{result.motor_id}
                        
                        {result.status === "NORMAL" ? (
                          <span className="text-[10px] font-black bg-green-50 text-green-700 border-2 border-green-200 px-5 py-2 rounded-full flex items-center gap-2 uppercase tracking-tighter">
                            <CheckCircle className="w-4 h-4" /> {t.statusNormal}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black bg-red-50 text-red-700 border-2 border-red-200 px-5 py-2 rounded-full flex items-center gap-2 uppercase tracking-tighter">
                            <AlertTriangle className="w-4 h-4" /> {t.statusDanger}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4">
                      <button onClick={downloadPDF} disabled={pdfGenerating} className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-900 px-5 py-2.5 rounded-xl transition-all border border-blue-200 shadow-sm active:scale-95">
                          <ArrowDownToLine className="w-4 h-4" /> DOWNLOAD PDF REPORT
                      </button>

                      <div className={`px-10 py-6 rounded-3xl border-4 flex flex-col items-center justify-center min-w-[220px] shadow-2xl relative overflow-hidden bg-white ${
                        result.status === 'NORMAL' ? 'border-green-500 shadow-green-100' :
                        result.status === 'RISKY' ? 'border-yellow-500 shadow-yellow-100' : 'border-red-600 shadow-red-100'
                      }`}>
                        <span className="text-slate-500 mb-1 font-bold uppercase tracking-widest text-[10px]">{t.remainingLife}</span>
                        <span className={`text-7xl font-black tracking-tighter leading-none ${
                        result.status === 'NORMAL' ? 'text-green-600' :
                        result.status === 'RISKY' ? 'text-yellow-600' : 'text-red-700'
                        }`}>
                          {result.predicted_rul}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">{t.flightCycle}</span>
                      </div>
                    </div>
                  </div>

                   {/* RECHARTS - ENHANCED VIBRANT AREA CHART */}
                   {result.history && result.history.length > 0 && (
                    <div className="w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-xl relative z-10 w-full overflow-hidden">
                       <div className="flex items-center justify-between mb-8">
                          <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="text-blue-600 w-4 h-4" /> {t.chartTitle}
                          </h3>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                               <span className="text-[9px] font-bold text-slate-500">LPC</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                               <span className="text-[9px] font-bold text-slate-500">HPC</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={result.history}>
                              <defs>
                                <linearGradient id="colorLPC" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorHPC" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="cycle" stroke="#94a3b8" fontSize={10} fontWeight={700} tickMargin={10} axisLine={false} tickLine={false} />
                              <YAxis yAxisId="left" fontSize={10} fontWeight={700} stroke="#3b82f6" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                              <YAxis yAxisId="right" orientation="right" fontSize={10} fontWeight={700} stroke="#ef4444" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                              <Tooltip 
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                contentStyle={{backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)'}}
                                itemStyle={{fontSize: '11px', fontWeight: '800', padding: '4px 0'}}
                                labelStyle={{color: '#64748b', fontSize: '10px', marginBottom: '8px', fontWeight: '900', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px'}}
                              />
                              <Area yAxisId="left" type="monotone" dataKey="s2" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLPC)" animationDuration={1500} />
                              <Area yAxisId="right" type="monotone" dataKey="s3" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorHPC)" animationDuration={1500} />
                            </AreaChart>
                          </ResponsiveContainer>
                       </div>
                       
                       <div className="mt-8 p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row gap-4 shadow-sm items-center sm:items-start text-center sm:text-left">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                           <Info className="w-6 h-6 text-blue-600" />
                         </div>
                         <div className="flex-1">
                           <div className="text-xs font-black text-[#1A237E] uppercase tracking-wider mb-1">{t.chartInfoTitle}</div>
                           <div className="text-xs text-slate-500 leading-relaxed font-medium">{t.chartInfoDesc}</div>
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="relative z-10 w-full">
                    <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-6 flex items-center justify-center gap-2 w-full bg-slate-50 py-3 rounded-xl border border-slate-100">
                      <Database className="text-blue-600 w-4 h-4" /> {t.matrixTitle}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Object.entries(result.sensors).map(([key, sensor]: [string, any]) => (
                        <div 
                          key={key} 
                          className={`p-5 rounded-2xl border-2 flex flex-col relative transition-all group shadow-sm ${
                            sensor.status === "Danger" 
                            ? "bg-red-50 border-red-200 shadow-lg shadow-red-100/50 scale-105 z-20" 
                            : "bg-slate-100/60 border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-xl hover:-translate-y-1"
                          }`}
                        >
                          {sensor.status === "Danger" && (
                            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-600 m-3 animate-ping"></div>
                          )}
                          <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">{key}</span>
                          <span className="text-[10px] text-slate-500 font-black uppercase truncate mb-3" title={sensor.name}>{sensor.name}</span>
                          <div className="flex items-baseline gap-1.5 mt-auto border-t border-slate-300/50 pt-3">
                            <span className={`text-2xl font-black tracking-tight ${sensor.status === "Danger" ? "text-red-700" : "text-slate-900"}`}>
                              {sensor.value}
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{sensor.unit}</span>
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
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between py-12 mt-12 border-t border-slate-200 text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase gap-6 text-center">
          <div>Engineered by <span className="text-[#1A237E] font-black">GÖKDENİZ ERTEN</span></div>
          <div className="text-slate-300">NASA EXPERIMENTAL SYSTEMS · AI PREDICTIVE NETWORK © 2026</div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-[100] bg-[#1A237E]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out" onClick={() => setShowImageModal(false)}>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] animate-in zoom-in-95 duration-300 shadow-2xl">
            <Image src="/fleet_report.png" alt="Fleet Overview" fill className="object-contain" />
            <button className="absolute -top-6 -right-6 bg-white text-blue-900 w-12 h-12 rounded-full flex items-center justify-center font-black shadow-2xl hover:scale-110 transition-transform text-xl border-4 border-blue-900" onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
