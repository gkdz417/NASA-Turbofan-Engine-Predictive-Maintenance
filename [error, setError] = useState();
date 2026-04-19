"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Rocket, Globe, ShieldCheck, Database, Cpu, AlertTriangle } from "lucide-react";
import { dict } from "../locales";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"TR" | "EN">("TR");
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem("nasa_lang") as "TR" | "EN";
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === "TR" ? "EN" : "TR";
    setLang(newLang);
    localStorage.setItem("nasa_lang", newLang);
  };

  const t = dict[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        const regRes = await fetch("http://localhost:8000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!regRes.ok) {
          throw new Error(t.regError);
        }
        await loginRequest();
      } else {
        await loginRequest();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginRequest = async () => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const logRes = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!logRes.ok) {
      throw new Error(t.loginError);
    }

    const { access_token } = await logRes.json();
    localStorage.setItem("nasa_token", access_token);
    localStorage.setItem("nasa_user", email);
    router.push("/");
  };

  const handleGuest = () => {
    localStorage.removeItem("nasa_token");
    localStorage.setItem("nasa_user", t.guestName);
    router.push("/");
  };

  return (
    <div className="w-full min-h-screen flex text-white relative bg-[#0b0c10]">
      
      {/* 🌐 LANGUAGE TOGGLE FLOATING TOP RIGHT */}
      <button onClick={toggleLang} className="absolute top-6 right-6 text-slate-400 hover:text-white flex items-center gap-1 text-sm border border-slate-700 px-4 py-2 rounded-full bg-[#151624] z-50 transition-colors shadow-lg shadow-black">
        <Globe className="w-4 h-4" /> {t.langText}
      </button>

      {/* LEFT SIDE - VISUAL / CORPORATE HERO */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-[#060b19] via-[#091535] to-[#040813] border-r border-[#1a233a]">
        {/* Background Grid Pattern CSS */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(#203864 1px, transparent 1px), linear-gradient(90deg, #203864 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-neonCyan rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>

        <div className="z-10 mt-12">
           <div className="flex items-center gap-3 mb-16">
             <Rocket className="w-10 h-10 text-neonCyan" />
             <span className="text-2xl font-bold tracking-widest text-slate-200">JET<span className="text-neonCyan">VISION</span> AI</span>
           </div>
           
           <h1 className="text-5xl font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
             {lang === "TR" ? "Jet Motoru Telemetri & Yapay Zeka İstasyonu" : "Jet Engine Telemetry & Artificial Intelligence Station"}
           </h1>
           <p className="text-slate-400 text-lg mb-12 max-w-lg leading-relaxed">
             {lang === "TR" 
               ? "Kurumsal RUL (Remaining Useful Life) tahminleme ağı. Yüzlerce motordan alınan canlı CMAPSS telemetri verisi, derin öğrenme (LSTM) algoritmalarıyla analiz edilir."
               : "Enterprise RUL (Remaining Useful Life) prediction network. Live CMAPSS telemetry from hundreds of engines analyzed via deep learning (LSTM) algorithms."}
           </p>

           <div className="flex flex-col gap-6">
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm max-w-sm">
               <div className="bg-neonCyan/20 p-3 rounded-lg"><Cpu className="w-6 h-6 text-neonCyan" /></div>
               <div>
                  <h4 className="font-semibold text-white">{lang === "TR" ? "Gelişmiş LSTM Modeli" : "Advanced LSTM Model"}</h4>
                  <p className="text-xs text-slate-400">{lang === "TR" ? "Zaman serisi tabanlı sıfır hata toleransı" : "Time-series based zero error tolerance"}</p>
               </div>
             </div>
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm max-w-sm">
               <div className="bg-blue-500/20 p-3 rounded-lg"><Database className="w-6 h-6 text-blue-400" /></div>
               <div>
                  <h4 className="font-semibold text-white">{lang === "TR" ? "Büyük Veri Analizi" : "Big Data Analysis"}</h4>
                  <p className="text-xs text-slate-400">{lang === "TR" ? "Milisaniye bazında 100 üniteden canlı ölçüm" : "Millisecond based live measurement from 100 units"}</p>
               </div>
             </div>
           </div>
        </div>

        <div className="z-10 flex flex-col gap-2">
          <div className="text-sm font-bold tracking-widest text-slate-300">
            ENGINEERED BY <span className="text-neonCyan">GÖKDENİZ ERTEN</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium tracking-widest flex items-center justify-start gap-1">
            SYSTEM SECURED UNDER DIRECTIVE 44-A <ShieldCheck className="w-3 h-3"/>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
           
           <div className="mb-10 lg:hidden text-center flex flex-col items-center">
             <Rocket className="w-12 h-12 text-neonCyan mb-3" />
             <h2 className="text-2xl font-bold tracking-widest text-slate-200">JET<span className="text-neonCyan">VISION</span> AI</h2>
           </div>

           <div className="mb-8">
             <h2 className="text-3xl font-bold text-white mb-2">{t.loginTitle}</h2>
             <p className="text-slate-400">{t.loginDesc}</p>
           </div>

          <div className="glass-panel p-8 shadow-2xl">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-md text-sm text-center mb-6 flex flex-col gap-1 items-center">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 block">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d0e1b] border border-slate-700 pl-11 pr-4 py-3.5 rounded-md text-white focus:outline-none focus:border-neonCyan transition-all"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 block">{t.passLabel}</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0d0e1b] border border-slate-700 pl-11 pr-4 py-3.5 rounded-md text-white focus:outline-none focus:border-neonCyan transition-all"
                    placeholder={t.passPlaceholder}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-neonCyan hover:bg-cyan-400 text-black font-bold py-4 rounded-md transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] disabled:opacity-50 text-sm tracking-wide uppercase"
              >
                {loading ? t.loading : (isRegister ? t.registerBtn : t.loginBtn)}
              </button>
            </form>

            <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-slate-800">
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-neonCyan hover:text-white transition-colors text-center"
              >
                {isRegister ? t.switchLogin : t.switchRegister}
              </button>

              <button 
                onClick={handleGuest}
                className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 border border-slate-700 py-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                <User className="w-4 h-4" />
                {t.guestBtn}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
