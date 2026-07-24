"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  HeartPulse, Brain, Shield, Activity, ArrowRight,
  Stethoscope, Scan, TrendingUp, ChevronRight, Star,
  Zap, Lock, BarChart3
} from "lucide-react";

// Animated counter hook
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(value, 1800, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black text-sky-400">
        {count}{suffix}
      </div>
      <div className="text-slate-400 text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    color: "bg-sky-500/20 text-sky-400",
    title: "AI Symptom Analysis",
    desc: "Describe symptoms and get instant diagnoses powered by XGBoost and deep learning, trained on millions of clinical cases.",
  },
  {
    icon: Scan,
    color: "bg-violet-500/20 text-violet-400",
    title: "Medical Image AI",
    desc: "Upload chest X-rays and get instant analysis with our MobileNetV2 CNN achieving 87%+ accuracy on pneumonia detection.",
  },
  {
    icon: Shield,
    color: "bg-emerald-500/20 text-emerald-400",
    title: "Explainable AI",
    desc: "Every prediction comes with SHAP explanations so you understand exactly which symptoms drove the diagnosis.",
  },
  {
    icon: Activity,
    color: "bg-amber-500/20 text-amber-400",
    title: "Real-time Analytics",
    desc: "Track your prediction history with interactive charts showing trends, risk levels, and disease distributions.",
  },
  {
    icon: Lock,
    color: "bg-rose-500/20 text-rose-400",
    title: "Secure & Private",
    desc: "All data is encrypted with JWT authentication. Your medical information stays safe and confidential.",
  },
  {
    icon: Zap,
    color: "bg-orange-500/20 text-orange-400",
    title: "Lightning Fast",
    desc: "Get predictions in under 500ms. Our optimized backend ensures you never wait for life-critical information.",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Radiologist",
    text: "MediAI's chest X-ray analysis is remarkably accurate. It helps me cross-reference my diagnoses efficiently.",
    rating: 5,
  },
  {
    name: "James Muller",
    role: "Patient",
    text: "I used the symptom checker when I had concerning symptoms. The AI correctly flagged potential bronchitis.",
    rating: 5,
  },
  {
    name: "Dr. Priya Patel",
    role: "General Practitioner",
    text: "The SHAP explanations are invaluable. My patients love understanding why the AI reached its conclusion.",
    rating: 5,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
              MediAI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Technology", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-sky-400 ${
                  scrolled ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary !py-2 text-sm"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen gradient-hero hero-dots flex items-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-sky-500/30"
              >
                <Zap size={14} className="animate-pulse" />
                AI-Powered Healthcare Platform
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
                Diagnose
                <br />
                <span className="text-gradient">Smarter</span>
                <br />
                with AI
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                Analyze symptoms and medical images with cutting-edge machine learning.
                Get explainable, accurate diagnoses powered by XGBoost and deep neural networks.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn-primary !py-4 !px-8 text-base">
                  <Stethoscope size={20} />
                  Start Free Analysis
                  <ChevronRight size={20} />
                </Link>
                <Link href="/dashboard" className="btn-secondary !py-4 !px-8 text-base bg-white/10 text-white border-white/20 hover:bg-white/20">
                  View Dashboard
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {["Dr. A", "Dr. B", "Dr. C", "Dr. D"].map((d, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      {d[4]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">Trusted by 2,000+ healthcare professionals</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Animated Dashboard Mock */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="flex-1 bg-slate-700 rounded-full h-6 ml-2" />
                  </div>
                  {/* Mock content */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Predictions", value: "2,847", color: "bg-sky-500/20 text-sky-400" },
                        { label: "Accuracy", value: "87.5%", color: "bg-emerald-500/20 text-emerald-400" },
                        { label: "Critical", value: "12", color: "bg-red-500/20 text-red-400" },
                        { label: "Normal", value: "1,204", color: "bg-violet-500/20 text-violet-400" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                          <div className="text-xl font-bold">{s.value}</div>
                          <div className="text-xs opacity-75 mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Mock chart bars */}
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <div className="text-slate-400 text-xs font-medium mb-3">Predictions This Week</div>
                      <div className="flex items-end gap-1.5 h-16">
                        {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-sky-500/30 rounded-t"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Mock prediction row */}
                    <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                        <Brain size={14} className="text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">Bronchitis Detected</div>
                        <div className="text-slate-400 text-xs">Confidence: 91.3%</div>
                      </div>
                      <span className="badge badge-warning text-xs">High</span>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold"
                >
                  ✓ Diagnosis Ready
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -left-6 bg-slate-800 text-sky-400 px-4 py-2 rounded-xl shadow-lg text-sm font-medium border border-slate-600"
                >
                  🔬 Powered by XGBoost + CNN
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={89} suffix="%" label="Diagnosis Accuracy" />
            <StatCounter value={20} suffix="+" label="Conditions Covered" />
            <StatCounter value={5000} suffix="+" label="X-Ray Images Trained" />
            <StatCounter value={500} suffix="ms" label="Avg Response Time" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="badge badge-info mb-4">Features</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2">
              Everything You Need for{" "}
              <span className="text-gradient">Smart Diagnostics</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
              A complete platform combining the latest in machine learning with
              an intuitive medical interface.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="card card-interactive p-6"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge badge-success mb-4">Technology</span>
              <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">
                Built on Proven{" "}
                <span className="text-gradient">ML Foundations</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Our platform combines XGBoost for tabular symptom data with
                PyTorch MobileNetV2 for image classification, all served through
                a high-performance FastAPI backend.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Symptom Classification (XGBoost)", value: 89 },
                  { label: "X-Ray Analysis (MobileNetV2)", value: 87 },
                  { label: "SHAP Explainability Coverage", value: 100 },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="text-sky-600 font-bold">{value}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Brain, label: "XGBoost", sub: "Symptom Classifier", color: "bg-sky-50 text-sky-600 border-sky-200" },
                { icon: Scan, label: "MobileNetV2", sub: "Image CNN", color: "bg-violet-50 text-violet-600 border-violet-200" },
                { icon: BarChart3, label: "SHAP", sub: "Explainability", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                { icon: Zap, label: "FastAPI", sub: "Backend", color: "bg-amber-50 text-amber-600 border-amber-200" },
              ].map(({ icon: Icon, label, sub, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={`card p-6 text-center border ${color}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="font-bold text-slate-900">{label}</div>
                  <div className="text-xs text-slate-500 mt-1">{sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge badge-info mb-4">Testimonials</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2">
              Trusted by Healthcare Professionals
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card card-hover p-6"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center px-6"
        >
          <h2 className="text-5xl font-black text-white mb-4">
            Ready to Transform <br />
            <span className="text-gradient">Healthcare Decisions?</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of healthcare professionals and patients using MediAI
            for smarter, faster, explainable diagnoses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary !py-4 !px-10 text-lg">
              Start Free Today <ArrowRight size={20} />
            </Link>
            <Link href="/symptom-checker" className="btn-secondary !py-4 !px-10 text-lg bg-white/10 text-white border-white/20 hover:bg-white/20">
              Try Symptom Checker
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">MediAI</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered medical diagnosis assistant built with FastAPI, PyTorch, and Next.js.
              </p>
            </div>
            {[
              {
                title: "Platform",
                links: ["Symptom Checker", "Image Analysis", "Dashboard", "History"],
              },
              {
                title: "Technology",
                links: ["XGBoost ML", "MobileNetV2", "SHAP AI", "FastAPI"],
              },
              {
                title: "Account",
                links: ["Sign In", "Register", "Profile", "Settings"],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold text-sm mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 MediAI. Built for educational purposes. Not a substitute for professional medical advice.
            </p>
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
