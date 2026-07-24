"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "@/lib/api";
import {
  HeartPulse, Eye, EyeOff, User, Mail, Lock, CheckCircle,
  ArrowRight, ArrowLeft, Stethoscope, Heart
} from "lucide-react";

const steps = ["Account", "Profile", "Confirm"];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors = ["bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 font-medium ${strength < 2 ? "text-red-500" : strength < 4 ? "text-amber-500" : "text-emerald-500"}`}>
        {password && labels[strength - 1]}
      </p>
    </div>
  );
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "patient",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => {
    if (step === 0 && (!form.email || !form.password)) {
      setError("Please fill in all fields.");
      return;
    }
    if (step === 0 && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (step === 0 && form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError("");
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!form.full_name) {
      setError("Please enter your full name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authAPI.register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      const res = await authAPI.login({ email: form.email, password: form.password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-14 h-14 text-emerald-500" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900">Welcome to MediAI!</h2>
          <p className="text-slate-500 mt-2">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex flex-col justify-center w-5/12 gradient-hero p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full hero-dots opacity-50" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">MediAI</span>
          </Link>
          <h1 className="text-5xl font-black text-white mb-4">
            Join 2,000+<br />
            <span className="text-gradient">Healthcare Heroes</span>
          </h1>
          <p className="text-slate-300 leading-relaxed mb-10">
            Create your account in 3 simple steps and start getting AI-powered health insights today.
          </p>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s} className={`flex items-center gap-4 transition-all ${i <= step ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-sky-500 text-white ring-4 ring-sky-500/30" : "bg-white/10 text-white"}`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className={`font-medium text-sm ${i === step ? "text-white" : "text-slate-400"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
              <span>Step {step + 1} of {steps.length}</span>
              <span>{steps[step]}</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Account */}
            {step === 0 && (
              <motion.div
                key="step0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 mb-8">Set up your login credentials</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field pl-10" placeholder="doctor@hospital.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} className="input-field pl-10 pr-10" placeholder="Min 6 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="confirm">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input id="confirm" type="password" value={form.confirm_password} onChange={(e) => update("confirm_password", e.target.value)} className={`input-field pl-10 ${form.confirm_password && form.password !== form.confirm_password ? "error" : ""}`} placeholder="••••••••" required />
                    </div>
                    {form.confirm_password && form.password !== form.confirm_password && (
                      <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
                    )}
                  </div>
                  <button onClick={nextStep} className="btn-primary w-full !py-3.5">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-2">Your Profile</h2>
                <p className="text-slate-500 mb-8">Tell us about yourself</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="fullname">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input id="fullname" type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className="input-field pl-10" placeholder="Dr. John Doe" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "patient", icon: Heart, label: "Patient", desc: "Managing my health" },
                        { value: "doctor", icon: Stethoscope, label: "Doctor", desc: "Clinical professional" },
                      ].map(({ value, icon: Icon, label, desc }) => (
                        <motion.button
                          key={value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => update("role", value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${form.role === value ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300"}`}
                          aria-pressed={form.role === value}
                        >
                          <Icon size={24} className={form.role === value ? "text-sky-500" : "text-slate-400"} />
                          <div className="font-semibold text-slate-900 mt-2 text-sm">{label}</div>
                          <div className="text-slate-500 text-xs">{desc}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={prevStep} className="btn-secondary flex-1 !py-3.5">
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button onClick={nextStep} className="btn-primary flex-1 !py-3.5">
                      Review <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-2">Confirm & Create</h2>
                <p className="text-slate-500 mb-8">Review your information</p>
                <div className="card p-5 mb-6 space-y-3">
                  {[
                    { label: "Name", value: form.full_name },
                    { label: "Email", value: form.email },
                    { label: "Role", value: form.role.charAt(0).toUpperCase() + form.role.slice(1) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{label}</span>
                      <span className="font-semibold text-slate-900 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 mb-6">
                  <input id="terms" type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300" />
                  <label htmlFor="terms" className="text-sm text-slate-600">
                    I agree to the{" "}
                    <a href="#" className="text-sky-500 font-medium hover:underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-sky-500 font-medium hover:underline">Privacy Policy</a>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button onClick={prevStep} className="btn-secondary !py-3.5 !px-5">
                    <ArrowLeft size={18} />
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={loading}
                    whileHover={!loading ? { y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="btn-primary flex-1 !py-3.5"
                  >
                    {loading ? <div className="spinner !w-5 !h-5" /> : <>Create Account <CheckCircle size={18} /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-500 font-semibold hover:text-sky-600">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
