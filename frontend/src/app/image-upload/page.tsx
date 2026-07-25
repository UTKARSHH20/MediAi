"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { predictAPI } from "@/lib/api";
import {
  Upload, ImageIcon, Scan, AlertTriangle,
  ArrowLeft, CheckCircle, RefreshCw, ZoomIn, ZoomOut
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Badge from "@/components/Badge";

export default function ImageUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else router.push("/login");
  }, []);

  const processFile = (selected: File) => {
    if (selected.size > 10 * 1024 * 1024) {
      setError("File must be less than 10MB");
      return;
    }
    setFile(selected);
    setResult(null);
    setError("");
    setZoom(1);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) processFile(dropped);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setScanProgress(0);

    // Simulate scan progress animation
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await predictAPI.xray(formData);
      clearInterval(interval);
      setScanProgress(100);
      setTimeout(() => setResult(res.data), 400);
    } catch (err: unknown) {
      clearInterval(interval);
      setScanProgress(0);
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setScanProgress(0);
    setZoom(1);
  };

  const riskBadgeVariant = (risk: string): "critical" | "danger" | "warning" | "success" => {
    switch (risk) {
      case "critical": return "critical";
      case "high": return "danger";
      case "moderate": return "warning";
      default: return "success";
    }
  };

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
          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-violet-100 rounded-xl">
                <Scan size={22} className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Medical Image Analysis</h1>
                <p className="text-slate-500 text-sm">Upload a chest X-ray for AI-powered pneumonia detection</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              {/* Drop Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                  dragging
                    ? "border-sky-500 bg-sky-50 scale-102"
                    : preview
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-300 hover:border-sky-400 hover:bg-sky-50/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="image-upload"
                  aria-label="Upload medical image"
                />
                <div className="p-8 text-center pointer-events-none">
                  <motion.div
                    animate={dragging ? { scale: 1.2 } : { scale: 1 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      preview ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                  >
                    {preview ? (
                      <CheckCircle size={30} className="text-emerald-500" />
                    ) : (
                      <Upload size={30} className={dragging ? "text-sky-500" : "text-slate-400"} />
                    )}
                  </motion.div>
                  {preview ? (
                    <div>
                      <p className="font-bold text-emerald-700 text-lg">Image loaded!</p>
                      <p className="text-slate-500 text-sm mt-1">{file?.name}</p>
                      <p className="text-sky-500 text-xs mt-1">Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-slate-700 text-lg">Drop your X-ray here</p>
                      <p className="text-slate-500 text-sm mt-1">or click to browse files</p>
                      <p className="text-slate-400 text-xs mt-2">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Instructions */}
              <div className="card p-4">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <ImageIcon size={16} className="text-slate-500" />
                  Supported Images
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: "🫁", text: "Chest X-rays (PA & AP view)", note: "Best results" },
                    { icon: "📷", text: "JPEG, PNG, WebP formats", note: "Any quality" },
                    { icon: "📏", text: "Minimum 224×224 pixels", note: "Recommended" },
                  ].map(({ icon, text, note }) => (
                    <div key={text} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>{icon}</span>
                        {text}
                      </div>
                      <span className="text-xs text-slate-400">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test images hint */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-700">
                <p className="font-semibold mb-1">💡 Try it now</p>
                <p className="text-xs">
                  Use test images from your dataset:<br />
                  <code className="bg-sky-100 px-1 rounded text-xs">data/chest_xray/test/PNEUMONIA/</code>
                </p>
              </div>
            </div>

            {/* Preview + Result Section */}
            <div className="space-y-4">
              {preview && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card overflow-hidden">
                  {/* Image with scan overlay */}
                  <div className={`relative ${loading ? "scan-animation" : ""} overflow-hidden`} style={{ background: "#000" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Medical image preview"
                      className="w-full object-contain transition-transform duration-200"
                      style={{ maxHeight: 280, transform: `scale(${zoom})` }}
                    />
                    {/* Scanning overlay */}
                    <AnimatePresence>
                      {loading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-sky-500/10 flex items-center justify-center"
                        >
                          <div className="text-center text-white">
                            <div className="spinner !w-10 !h-10 mx-auto mb-2 !border-white/30 !border-t-white" />
                            <p className="text-sm font-medium">Analyzing...</p>
                            <p className="text-xs opacity-75">{scanProgress}%</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Zoom + actions */}
                  <div className="p-3 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-1.5 hover:bg-slate-100 rounded-lg transition" aria-label="Zoom out">
                        <ZoomOut size={16} className="text-slate-500" />
                      </button>
                      <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                      <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-1.5 hover:bg-slate-100 rounded-lg transition" aria-label="Zoom in">
                        <ZoomIn size={16} className="text-slate-500" />
                      </button>
                    </div>
                    <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition">
                      <RefreshCw size={12} /> Reset
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Scan progress bar */}
              {loading && scanProgress > 0 && (
                <div className="card p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Analyzing image...</span>
                    <span className="text-sky-600 font-bold">{scanProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div className="progress-fill" animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Running MobileNetV2 inference...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 border-l-4 border-red-500 bg-red-50">
                  <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-emerald-500" />
                        <h3 className="font-bold text-slate-900">Analysis Result</h3>
                      </div>
                      <Badge variant={riskBadgeVariant(result.risk_level)} dot>
                        {result.risk_level?.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-semibold mb-1">DETECTED</p>
                        <p className="text-xl font-black text-slate-900">{result.predicted_disease}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 font-semibold mb-1">CONFIDENCE</p>
                        <p className="text-xl font-black text-sky-600">
                          {(result.confidence_score * 100).toFixed(1)}%
                        </p>
                        <div className="progress-bar mt-1.5">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence_score * 100}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-start gap-3 p-4 rounded-xl ${
                      result.risk_level === "low" ? "bg-emerald-50 text-emerald-700" :
                      result.risk_level === "moderate" ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{result.recommended_action}</p>
                    </div>

                    <button onClick={reset} className="btn-secondary w-full !py-2.5 text-sm">
                      <RefreshCw size={16} /> Analyze Another Image
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze Button */}
              {!result && preview && (
                <motion.button
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                  whileHover={!loading ? { y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="btn-primary w-full !py-4 text-base"
                >
                  {loading ? (
                    <><div className="spinner !w-5 !h-5" /> Scanning with AI...</>
                  ) : (
                    <><Scan size={20} /> Run Analysis</>
                  )}
                </motion.button>
              )}

              {!preview && (
                <div className="card p-8 text-center text-slate-400">
                  <Scan size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Upload an image to begin analysis</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
