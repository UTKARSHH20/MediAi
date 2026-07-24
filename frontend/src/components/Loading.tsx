"use client";

interface LoadingProps {
  variant?: "spinner" | "skeleton" | "pulse" | "page";
  size?: "sm" | "md" | "lg";
  lines?: number;
}

export default function Loading({ variant = "spinner", size = "md", lines = 3 }: LoadingProps) {
  const spinnerSize = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];

  if (variant === "page") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className={`spinner ${spinnerSize}`} />
          <p className="text-slate-500 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4 rounded"
            style={{ width: `${80 + Math.random() * 20}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`spinner ${spinnerSize}`} />
    </div>
  );
}
