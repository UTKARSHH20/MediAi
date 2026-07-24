"use client";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getColor(name?: string) {
  if (!name) return "bg-slate-400";
  const colors = [
    "bg-sky-500", "bg-emerald-500", "bg-violet-500",
    "bg-amber-500", "bg-rose-500", "bg-indigo-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Avatar({ src, name, size = "md", online }: AvatarProps) {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-full ${sizeMap[size]} ${!src ? getColor(name) : ""} overflow-hidden flex-shrink-0`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-semibold">{getInitials(name)}</span>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? "bg-emerald-500" : "bg-slate-400"}`}
        />
      )}
    </div>
  );
}
