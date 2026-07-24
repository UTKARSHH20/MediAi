"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { predictAPI } from "@/lib/api";
import {
  Brain, ArrowLeft, ArrowRight, Search, X,
  CheckCircle, AlertTriangle, RefreshCw, Save
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Badge from "@/components/Badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ALL_SYMPTOMS = [
  "fever", "cough", "headache", "fatigue", "nausea", "chest_pain",
  "shortness_of_breath", "sore_throat", "runny_nose", "body_ache",
  "chills", "sweating", "loss_of_taste", "loss_of_smell", "vomiting",
  "diarrhea", "abdominal_pain", "joint_pain", "rash", "dizziness",
  "blurred_vision", "palpitations", "swelling", "weight_loss",
  "excessive_thirst", "frequent_urination", "dry_mouth", "muscle_pain",
  "confusion", "insomnia", "mood_swings", "loss_of_appetite",
  "yellow_skin", "dark_urine", "wheezing", "chest_tightness",
  "blood_in_sputum", "night_sweats", "persistent_cough", "stiff_neck",
  "sensitivity_to_light", "nose_bleed", "bruising", "cold_hands",
  "excessive_hunger", "slow_healing", "numbness", "tingling",
  "back_pain", "neck_pain",
];

const CATEGORIES: Record<string, string[]> = {
  "🫁 Respiratory": ["cough", "shortness_of_breath", "wheezing", "chest_tightness", "blood_in_sputum", "persistent_cough"],
  "🤒 General": ["fever", "fatigue", "chills", "sweating", "body_ache", "weight_loss"],
  "🧠 Neurological": ["headache", "dizziness", "confusion", "blurred_vision", "stiff_neck", "sensitivity_to_light"],
  "🫶 Cardiac": ["chest_pain", "palpitations", "cold_hands", "swelling"],
  "🤢 Digestive": ["nausea", "vomiting", "diarrhea", "abdominal_pain", "dark_urine", "yellow_skin"],
  "🦵 Musculoskeletal": ["joint_pain", "muscle_pain", "back_pain", "neck_pain", "numbness", "tingling"],
  "🔬 Metabolic": ["excessive_thirst", "frequent_urination", "dry_mouth", "excessive_hunger", "slow_healing"],
  "😷 Immune": ["rash", "loss_of_taste", "loss_of_smell", "runny_nose", "sore_throat", "nose_bleed", "bruising"],
  "🧘 Mental": ["insomnia", "mood_swings", "loss_of_appetite"],
};

const steps = ["Select Category", "Pick Symptoms", "Review & Analyze"];

function getRiskColor(risk: string) {
  switch (risk) {
    case "critical": return "text-red-600 bg-red-50";
    case "high": return "text-orange-600 bg-orange-50";
    case "moderate": return "text-amber-600 bg-amber-50";
    default: return "text-emerald-600 bg-emerald-50";
  }
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
};

export default function SymptomCheckerPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else router.push("/login");
  });

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goPrev = () => { setDirection(-1); setStep((s) => s - 1); };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await predictAPI.symptoms({ symptoms: selectedSymptoms });
      setResult(res.data);
      setDirection(1);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setSelectedSymptoms([]);
    setActiveCategory(null);
    setResult(null);
    setDirection(-1);
  };

  const displaySymptoms = activeCategory
    ? CATEGORIES[activeCategory] || []
    : searchTerm
    ? ALL_SYMPTOMS.filter((s) => s.includes(searchTerm.toLowerCase().replace(/ /g, "_")))
    : ALL_SYMPTOMS;

  const shapeFeatureData = result?.top_features?.slice(0, 8).map((f: any) => ({
    name: f.feature.replace(/_/g, " "),
    value: parseFloat((f.importance * 100).toFixed(1)),
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user || undefined} />

      <div className="lg:pl-64">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <div className="pl-12 lg:pl-0">
              <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft size={18} />
                <span className="font-semibold text-sm">Dashboard</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Step indicators */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-sky-100 rounded-xl">
                <Brain size={22} className="text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Symptom Checker</h1>
                <p className="text-slate-500 text-sm">AI-powered diagnosis in 3 steps</p>
              </div>
            </div>

            {step < 3 && (
              <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === step ? "bg-sky-500 text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {i < step ? <CheckCircle size={12} /> : <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>}
                      <span className="hidden sm:inline">{s}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Category Selection */}
            {step === 0 && (
              <motion.div key="step0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">What area is affected?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {Object.keys(CATEGORIES).map((cat) => (
                      <motion.button
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                        className={`p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${cat === activeCategory ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 hover:border-sky-300 text-slate-700"}`}
                      >
                        {cat}
                      </motion.button>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setActiveCategory(null); goNext(); }}
                      className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm hover:border-sky-400"
                    >
                      🔍 Browse All
                    </motion.button>
                  </div>
                  <button onClick={goNext} disabled={!activeCategory && step === 0} className="btn-primary w-full !py-3">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Symptom Selection */}
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Select your symptoms</h2>
                  <p className="text-slate-500 text-sm mb-4">
                    {activeCategory ? `Showing: ${activeCategory}` : "All symptoms"} — tap to select
                  </p>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search symptoms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-9 py-2"
                    />
                  </div>

                  {/* Selected chips */}
                  {selectedSymptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-sky-50 rounded-xl border border-sky-100">
                      {selectedSymptoms.map((s) => (
                        <motion.span
                          key={s}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center gap-1.5 bg-sky-500 text-white text-xs px-3 py-1.5 rounded-full font-medium"
                        >
                          {s.replace(/_/g, " ")}
                          <button onClick={() => toggleSymptom(s)} className="hover:opacity-75" aria-label={`Remove ${s}`}>
                            <X size={12} />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Symptom grid */}
                  <div className="max-h-64 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                    {displaySymptoms.map((symptom) => (
                      <motion.button
                        key={symptom}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-sky-500 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                        aria-pressed={selectedSymptoms.includes(symptom)}
                      >
                        {symptom.replace(/_/g, " ")}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={goPrev} className="btn-secondary !py-3 !px-5">
                      <ArrowLeft size={18} />
                    </button>
                    <button onClick={goNext} disabled={selectedSymptoms.length === 0} className="btn-primary flex-1 !py-3">
                      Review {selectedSymptoms.length > 0 && `(${selectedSymptoms.length} selected)`} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Review & Submit</h2>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Selected symptoms ({selectedSymptoms.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 text-xs px-3 py-1.5 rounded-full font-medium">
                          {s.replace(/_/g, " ")}
                          <button onClick={() => toggleSymptom(s)} aria-label={`Remove ${s}`}>
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">
                      This AI analysis is for educational purposes only. Always consult a qualified healthcare professional for medical advice.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={goPrev} className="btn-secondary !py-3 !px-5">
                      <ArrowLeft size={18} />
                    </button>
                    <motion.button
                      onClick={handleAnalyze}
                      disabled={loading}
                      whileHover={!loading ? { y: -1 } : {}}
                      className="btn-primary flex-1 !py-3"
                    >
                      {loading ? (
                        <>
                          <div className="spinner !w-4 !h-4" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Brain size={18} />
                          Run AI Analysis
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 3 && result && (
              <motion.div key="result" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <div className="space-y-4">
                  {/* Main Result Card */}
                  <div className="card p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={22} className="text-emerald-500" />
                          <span className="font-bold text-slate-900 text-lg">Analysis Complete</span>
                        </div>
                        <p className="text-slate-500 text-sm">Based on {selectedSymptoms.length} reported symptoms</p>
                      </div>
                      <Badge variant={
                        result.risk_level === "critical" ? "critical" :
                        result.risk_level === "high" ? "danger" :
                        result.risk_level === "moderate" ? "warning" : "success"
                      } dot>
                        {result.risk_level?.toUpperCase()} RISK
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Predicted Condition</p>
                        <p className="text-3xl font-black text-slate-900">{result.predicted_disease}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                        <p className="text-3xl font-black text-sky-600">
                          {(result.confidence_score * 100).toFixed(1)}%
                        </p>
                        <div className="progress-bar mt-2">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence_score * 100}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-start gap-3 p-4 rounded-xl ${getRiskColor(result.risk_level)}`}>
                      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Recommendation</p>
                        <p className="text-sm mt-0.5 opacity-90">{result.recommended_action}</p>
                      </div>
                    </div>
                  </div>

                  {/* SHAP Explanations */}
                  {shapeFeatureData.length > 0 && (
                    <div className="card p-6">
                      <h3 className="font-bold text-slate-900 mb-1">Key Contributing Factors</h3>
                      <p className="text-slate-500 text-sm mb-4">SHAP values — which symptoms influenced the AI most</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={shapeFeatureData} layout="vertical">
                          <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={110} />
                          <Tooltip
                            contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8 }}
                            formatter={(v: number) => [`${v}%`, "Importance"]}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {shapeFeatureData.map((_: any, i: number) => (
                              <Cell key={i} fill={i === 0 ? "#0EA5E9" : i === 1 ? "#6366F1" : "#94A3B8"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button onClick={reset} className="btn-secondary flex-1 !py-3">
                      <RefreshCw size={16} /> Start Over
                    </button>
                    <Link href="/history" className="btn-primary flex-1 !py-3 text-center justify-center inline-flex items-center gap-2">
                      <Save size={16} /> View History
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
