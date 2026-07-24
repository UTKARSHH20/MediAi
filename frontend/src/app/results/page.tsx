"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Activity, CheckCircle, ArrowLeft } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("last_prediction");
    if (data) {
      setResult(JSON.parse(data));
    }
  }, []);

  if (!result) return <div className="p-8 text-center text-slate-500">Loading results...</div>;

  const isHighRisk = result.risk_level === 'high' || result.risk_level === 'critical';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={`p-6 border-b ${isHighRisk ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex items-center gap-4">
            {isHighRisk ? (
              <AlertCircle className={`h-12 w-12 text-rose-600`} />
            ) : (
              <CheckCircle className={`h-12 w-12 text-emerald-600`} />
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analysis Complete</h1>
              <p className={`text-sm font-medium ${isHighRisk ? 'text-rose-700' : 'text-emerald-700'}`}>
                Risk Level: {result.risk_level.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Primary Assessment</h2>
            <p className="text-3xl font-extrabold text-slate-900">{result.predicted_disease}</p>
            <p className="text-slate-500 mt-2">Confidence Score: {(result.confidence_score * 100).toFixed(1)}%</p>
          </div>

          {result.top_features && result.top_features.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Key Contributing Symptoms (SHAP)</h3>
              <div className="space-y-3">
                {result.top_features.map((feat: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-slate-700">{feat.feature.replace(/_/g, ' ')}</span>
                    <div className="w-1/2 bg-slate-100 rounded-full h-2.5">
                      <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.abs(feat.importance) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
