"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { predictAPI } from "@/lib/api";
import {
  History, Brain, ImageIcon, ArrowLeft, Search,
  Filter, Download, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    predictAPI.history()
      .then((res) => setPredictions(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPredictions([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <Loading variant="page" />;

  const filtered = predictions.filter((p) => {
    const matchSearch = !search || p.predicted_disease?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || p.risk_level === riskFilter;
    const matchType = typeFilter === "all" || p.prediction_type === typeFilter;
    return matchSearch && matchRisk && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const riskBadge = (risk: string): "critical" | "danger" | "warning" | "success" | "neutral" => {
    const map: Record<string, any> = { critical: "critical", high: "danger", moderate: "warning", low: "success" };
    return map[risk] || "neutral";
  };

  const exportCSV = () => {
    const header = "Date,Disease,Type,Confidence,Risk\n";
    const rows = filtered.map((p) =>
      `${new Date(p.created_at).toLocaleDateString()},${p.predicted_disease},${p.prediction_type},${(p.confidence_score * 100).toFixed(1)}%,${p.risk_level}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mediai-history.csv"; a.click();
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

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <History size={22} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Prediction History</h1>
                <p className="text-slate-500 text-sm">{filtered.length} total predictions</p>
              </div>
            </div>
            <button onClick={exportCSV} className="btn-secondary !py-2 !px-4 text-sm">
              <Download size={16} /> Export CSV
            </button>
          </motion.div>

          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by disease..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field pl-9 !py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400 hidden sm:block" />
                <select
                  value={riskFilter}
                  onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                  className="input-field !py-2 !w-auto"
                  aria-label="Filter by risk level"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="input-field !py-2 !w-auto"
                  aria-label="Filter by prediction type"
                >
                  <option value="all">All Types</option>
                  <option value="symptom">Symptom</option>
                  <option value="xray">X-Ray</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {paginated.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full" role="table">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Confidence</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginated.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                            {new Date(p.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.prediction_type === "xray" ? "bg-violet-50" : "bg-sky-50"}`}>
                                {p.prediction_type === "xray" ? (
                                  <ImageIcon size={14} className="text-violet-500" />
                                ) : (
                                  <Brain size={14} className="text-sky-500" />
                                )}
                              </div>
                              <span className="font-semibold text-slate-900 text-sm">{p.predicted_disease}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 px-2 py-1 rounded-full">
                              {p.prediction_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-20 progress-bar">
                                <div className="progress-fill" style={{ width: `${p.confidence_score * 100}%` }} />
                              </div>
                              <span className="text-sm font-bold text-slate-900">{(p.confidence_score * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={riskBadge(p.risk_level)} size="sm" dot>{p.risk_level}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              aria-label={`Delete prediction for ${p.predicted_disease}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-medium text-slate-700">Page {page} of {totalPages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <History size={48} className="text-slate-200 mx-auto mb-3" />
                <h4 className="text-slate-600 font-semibold">
                  {predictions.length > 0 ? "No matching results" : "No predictions yet"}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  {predictions.length > 0 ? "Try adjusting your filters" : "Start by checking symptoms or uploading an X-ray"}
                </p>
                {predictions.length === 0 && (
                  <Link href="/symptom-checker" className="btn-primary !py-2 !px-5 text-sm mt-4 inline-flex">
                    Start Analysis
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
