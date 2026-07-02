"use client";

import React from "react";

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const NeuInput = ({
  icon,
  rightIcon,
  className = "",
  ...props
}: NeuInputProps) => (
  <div className="relative flex items-center">
    {icon && (
      <div className="absolute left-3 text-surface-400 pointer-events-none">
        {icon}
      </div>
    )}
    <input
      className={`w-full bg-surface-200 shadow-neu-input rounded-xl font-mono text-sm text-surface-500 placeholder:text-surface-400/60 focus:outline-none focus:ring-2 focus:ring-violet-300/30 transition-all ${
        icon ? "pl-10" : "pl-4"
      } ${rightIcon ? "pr-10" : "pr-4"} py-2.5 ${className}`}
      {...props}
    />
    {rightIcon && (
      <div className="absolute right-3 text-surface-400">{rightIcon}</div>
    )}
  </div>
);

export const NeuTextarea = ({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`w-full bg-surface-200 shadow-neu-input rounded-xl font-mono text-sm text-surface-500 placeholder:text-surface-400/60 focus:outline-none focus:ring-2 focus:ring-violet-300/30 transition-all px-4 py-2.5 resize-none ${className}`}
    {...props}
  />
);
