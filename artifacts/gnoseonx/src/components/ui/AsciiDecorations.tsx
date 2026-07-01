"use client";

import React from "react";

export const AsciiLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "text-[8px] leading-[10px]",
    md: "text-[10px] leading-[12px]",
    lg: "text-[14px] leading-[16px]",
  };

  return (
    <pre
      className={`font-mono ${sizes[size]} text-violet-300 select-none whitespace-pre`}
    >
      {`╔═══════════════╗
║  ◈ GnoseonX ◈ ║
╚═══════════════╝`}
    </pre>
  );
};

export const AsciiDivider = ({
  variant = "simple",
  color = "text-surface-400",
}: {
  variant?: "simple" | "fancy" | "dots" | "arrow";
  color?: string;
}) => {
  const dividers = {
    simple: "─────────────────────────────────────",
    fancy: "═══════════════════════════════════",
    dots: "· · · · · · · · · · · · · · · · · · ·",
    arrow: "▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸ ▸",
  };
  return (
    <div
      className={`font-mono text-[10px] ${color} opacity-40 select-none overflow-hidden whitespace-nowrap`}
    >
      {dividers[variant]}
    </div>
  );
};

export const AsciiCorner = ({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) => {
  const corners = { tl: "╔═", tr: "═╗", bl: "╚═", br: "═╝" };
  return (
    <span className="font-mono text-[10px] text-violet-300/30 select-none">
      {corners[position]}
    </span>
  );
};

export const AsciiBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative ${className}`}>
    <div className="absolute top-0 left-0">
      <AsciiCorner position="tl" />
    </div>
    <div className="absolute top-0 right-0">
      <AsciiCorner position="tr" />
    </div>
    <div className="absolute bottom-0 left-0">
      <AsciiCorner position="bl" />
    </div>
    <div className="absolute bottom-0 right-0">
      <AsciiCorner position="br" />
    </div>
    {children}
  </div>
);

export const AsciiSpinner = () => (
  <div className="inline-block font-mono text-neon-300 animate-spin">◈</div>
);

export const AsciiStatusDot = ({
  status,
}: {
  status: "online" | "idle" | "dnd" | "offline";
}) => {
  const colors = {
    online: "text-neon-300",
    idle: "text-yellow-400",
    dnd: "text-lava-300",
    offline: "text-surface-400",
  };
  const chars = { online: "●", idle: "◐", dnd: "⊘", offline: "○" };
  return (
    <span className={`font-mono text-xs ${colors[status]}`}>
      {chars[status]}
    </span>
  );
};

export const AsciiBadge = ({
  count,
  variant = "lava",
}: {
  count: number;
  variant?: "lava" | "neon" | "violet";
}) => {
  if (count <= 0) return null;
  const colors = {
    lava: "bg-lava-400 text-white",
    neon: "bg-neon-400 text-black",
    violet: "bg-violet-400 text-white",
  };
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold ${colors[variant]}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export const AsciiPattern = ({
  className = "",
}: {
  className?: string;
}) => (
  <div
    className={`font-mono text-[8px] leading-[10px] text-violet-300/10 select-none pointer-events-none whitespace-pre overflow-hidden ${className}`}
  >
    {`░░▒▒▓▓██▓▓▒▒░░░░▒▒▓▓██▓▓▒▒░░░░▒▒▓▓██▓▓▒▒░░
▒▒░░▒▒▓▓██▓▓▒▒░░▒▒░░▒▒▓▓██▓▓▒▒░░▒▒░░▒▒▓▓██
▓▓▒▒░░▒▒▓▓██▓▓▒▒▓▓▒▒░░▒▒▓▓██▓▓▒▒▓▓▒▒░░▒▒▓▓
██▓▓▒▒░░▒▒▓▓████▓▓▒▒░░▒▒▓▓████▓▓▒▒░░▒▒▓▓██
▓▓██▓▓▒▒░░▒▒▓▓▓▓██▓▓▒▒░░▒▒▓▓▓▓██▓▓▒▒░░▒▒▓▓`}
  </div>
);
