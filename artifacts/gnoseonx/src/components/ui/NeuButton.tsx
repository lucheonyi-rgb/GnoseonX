"use client";

import React from "react";

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "lava" | "neon" | "violet" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  active?: boolean;
  children: React.ReactNode;
}

export const NeuButton = ({
  variant = "default",
  size = "md",
  active = false,
  children,
  className = "",
  ...props
}: NeuButtonProps) => {
  const baseClasses =
    "relative font-mono transition-all duration-200 select-none flex items-center justify-center gap-2 rounded-xl active:scale-[0.97]";

  const variants = {
    default: active
      ? "bg-surface-200 shadow-neu-pressed text-violet-400"
      : "bg-surface-100 shadow-neu-btn hover:shadow-neu-btn-hover text-surface-500 hover:text-violet-400",
    lava: active
      ? "bg-lava-100 shadow-neu-pressed text-lava-400"
      : "bg-surface-100 shadow-neu-btn hover:shadow-neu-glow-lava text-lava-400 hover:text-lava-300",
    neon: active
      ? "bg-neon-100 shadow-neu-pressed text-neon-500"
      : "bg-surface-100 shadow-neu-btn hover:shadow-neu-glow-neon text-neon-500 hover:text-neon-400",
    violet: active
      ? "bg-violet-100 shadow-neu-pressed text-violet-400"
      : "bg-surface-100 shadow-neu-btn hover:shadow-neu-glow-violet text-violet-400 hover:text-violet-300",
    ghost:
      "bg-transparent hover:bg-surface-200/50 text-surface-500 hover:text-violet-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2.5",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const NeuIconButton = ({
  variant = "default",
  active = false,
  children,
  className = "",
  tooltip,
  ...props
}: NeuButtonProps & { tooltip?: string }) => (
  <div className="relative group">
    <NeuButton
      variant={variant}
      size="icon"
      active={active}
      className={`rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </NeuButton>
    {tooltip && (
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-surface-400 text-snow-50 text-[10px] font-mono px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {tooltip}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-400" />
      </div>
    )}
  </div>
);
