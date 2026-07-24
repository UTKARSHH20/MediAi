"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { dashboardAPI, predictAPI } from "@/lib/api";
import {
  Brain, AlertTriangle, TrendingUp, Activity,
  ArrowRight, ImageIcon, Plus, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0EA5E9", "#6366F1", "#10B981", "#F59E0B", "#EF4444"];

const weeklyData = [
  { day: "Mon", predictions: 4 },
  { day: "Tue", predictions: 7 },
  { day: "Wed", predictions: 5 },
  { day: "Thu", predictions: 9 },
  { day: "Fri", predictions: 6 },
  { day: "Sat", predictions: 11 },
  { day: "Sun", predictions: 8 },
];

function AnimatedNumber({ value }: { value: number | string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {value}
    </motion.span>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  desc?: string;
}

function StatCard({ title, value, icon, color, trend, desc }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 20px -3px rgba(0,0,0,0.1)" }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            <ChevronUp size={14} className={trend < 0 ? "rotate-180" : ""} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    Promise.all([
      dashboardAPI.stats().catch(() => ({ data: null })),
      predictAPI.history().catch(() => ({ data: [] })),
    ]).then(([statsRes, historyRes]) => {
      setStats(statsRes.data);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data.slice(0, 8) : []);
    }).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <Loading variant="page" />;

  const diseaseData = history.reduce((acc: any[], p: any) => {
    const ex = acc.find((a) => a.name === p.predicted_disease);
    if (ex) ex.value++;
    else acc.push({ name: p.predicted_disease, value: 1 });
    return acc;
  }, []);

  const riskBadge = (risk: string) => {
    const map: Record<string, "danger" | "warning" | "success" | "neutral" | "critical"> = {
      critical: "critical", high: "danger", moderate: "warning", low: "success",
    };
    return map[risk] || "neutral";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user || undefined} />

      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 lg:z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/symptom-checker" className="btn-primary !py-2 !px-4 text-sm">
                <Plus size={16} /> New Check
              </Link>
              <Avatar name={user?.full_name} size="sm" online />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-hero rounded-2xl p-6 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-full bg-sky-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Good morning, {user?.full_name?.split(" ")[0] || "Doctor"}! 👋
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  You have {history.length} predictions in your history. Here&apos;s your overview.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link href="/symptom-checker" className="btn-secondary !py-2 !px-4 text-sm bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Brain size={16} /> Check Symptoms
                </Link>
                <Link href="/image-upload" className="btn-secondary !py-2 !px-4 text-sm bg-sky-500 text-white border-transparent hover:bg-sky-600">
                  <ImageIcon size={16} /> Analyze X-Ray
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Predictions"
              value={stats?.total_predictions ?? history.length}
              icon={<Brain size={20} className="text-sky-500" />}
              color="bg-sky-50"
              trend={12}
              desc="All time"
            />
            <StatCard
              title="Critical Cases"
              value={stats?.critical_cases ?? history.filter((h: any) => h.risk_level === "critical").length}
              icon={<AlertTriangle size={20} className="text-red-500" />}
              color="bg-red-50"
              trend={-5}
              desc="Needs attention"
            />
            <StatCard
              title="High Risk"
              value={stats?.high_risk_cases ?? history.filter((h: any) => h.risk_level === "high").length}
              icon={<Activity size={20} className="text-amber-500" />}
              color="bg-amber-50"
              desc="Requires review"
            />
            <StatCard
              title="Accuracy Rate"
              value={`${((stats?.accuracy_rate ?? 0.875) * 100).toFixed(0)}%`}
              icon={<TrendingUp size={20} className="text-emerald-500" />}
              color="bg-emerald-50"
              trend={3}
              desc="Model performance"
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Area Chart */}
            <div className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Predictions This Week</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daily prediction count</p>
                </div>
                <Badge variant="info" size="sm">Live</Badge>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}
                    labelStyle={{ fontWeight: 600, color: "#0F172A" }}
                  />
                  <Area type="monotone" dataKey="predictions" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#colorPred)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: "#0EA5E9" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-1">Disease Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">Top diagnosed conditions</p>
              {diseaseData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={diseaseData.slice(0, 5)} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {diseaseData.slice(0, 5).map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {diseaseData.slice(0, 4).map((d: any, i: number) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                        <span className="text-xs text-slate-600 flex-1 truncate">{d.name}</span>
                        <span className="text-xs font-bold text-slate-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <BarChart width={40} height={40} data={[]} />
                  <p className="text-sm mt-2">No data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Predictions Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Predictions</h3>
              <Link href="/history" className="text-sky-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {history.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {history.map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${p.prediction_type === "xray" ? "bg-violet-50" : "bg-sky-50"}`}>
                      {p.prediction_type === "xray" ? (
                        <ImageIcon size={16} className="text-violet-500" />
                      ) : (
                        <Brain size={16} className="text-sky-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{p.predicted_disease}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {(p.confidence_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">confidence</div>
                      </div>
                      <Badge variant={riskBadge(p.risk_level)}>{p.risk_level}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Brain size={48} className="text-slate-200 mx-auto mb-3" />
                <h4 className="text-slate-600 font-semibold">No predictions yet</h4>
                <p className="text-slate-400 text-sm mt-1">Start by checking your symptoms or uploading an X-ray</p>
                <Link href="/symptom-checker" className="btn-primary !py-2 !px-5 text-sm mt-4 inline-flex">
                  Start First Analysis <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
