"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type CardVariant = "default" | "hover" | "interactive";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  onClick?: () => void;
  padding?: string;
}

export default function Card({
  children,
  className = "",
  variant = "default",
  onClick,
  padding = "p-6",
}: CardProps) {
  const variantClass =
    variant === "hover"
      ? "card card-hover"
      : variant === "interactive"
      ? "card card-interactive"
      : "card";

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className={`${variantClass} ${padding} ${className} cursor-pointer`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${variantClass} ${padding} ${className}`}>{children}</div>
  );
}
