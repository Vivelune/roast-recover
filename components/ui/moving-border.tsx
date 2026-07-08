"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorderButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-12 overflow-hidden rounded-md p-[1.5px] disabled:opacity-60",
        className
      )}
    >
      <span className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite] [background:conic-gradient(from_90deg_at_50%_50%,#B5481F_0%,#F2EDE6_50%,#B5481F_100%)]" />
      <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-[7px] bg-ember px-6 text-sm font-medium text-white backdrop-blur-3xl">
        {children}
      </span>
    </button>
  );
}