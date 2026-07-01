"use client";

import React from "react";
import { AsciiStatusDot } from "./AsciiDecorations";

interface AvatarProps {
  name: string;
  image?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "idle" | "dnd" | "offline";
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const colorPairs = [
  { bg: "bg-gradient-to-br from-lava-300 to-lava-400", text: "text-white" },
  { bg: "bg-gradient-to-br from-neon-400 to-neon-500", text: "text-white" },
  { bg: "bg-gradient-to-br from-violet-300 to-violet-400", text: "text-white" },
  { bg: "bg-gradient-to-br from-lava-200 to-violet-300", text: "text-white" },
  { bg: "bg-gradient-to-br from-neon-300 to-violet-300", text: "text-black" },
  { bg: "bg-gradient-to-br from-violet-200 to-lava-200", text: "text-white" },
];

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPairs[Math.abs(hash) % colorPairs.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const Avatar = ({
  name,
  image,
  size = "md",
  status,
  showStatus = true,
  className = "",
  onClick,
}: AvatarProps) => {
  const sizes = {
    xs: "w-6 h-6 text-[8px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
    xl: "w-20 h-20 text-lg",
  };

  const statusPositions = {
    xs: "-bottom-0 -right-0",
    sm: "-bottom-0.5 -right-0.5",
    md: "-bottom-0.5 -right-0.5",
    lg: "-bottom-1 -right-1",
    xl: "-bottom-1 -right-1",
  };

  const color = getColorFromName(name);

  return (
    <div
      className={`relative inline-flex shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sizes[size]} ${color.bg} ${color.text} rounded-2xl shadow-neu-btn flex items-center justify-center font-mono font-bold overflow-hidden`}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="select-none">{getInitials(name)}</span>
        )}
      </div>
      {showStatus && status && (
        <div
          className={`absolute ${statusPositions[size]} bg-surface-100 rounded-full p-[1px] shadow-sm`}
        >
          <AsciiStatusDot status={status} />
        </div>
      )}
    </div>
  );
};

export const AvatarGroup = ({
  users,
  max = 3,
}: {
  users: { name: string; image?: string }[];
  max?: number;
}) => {
  const shown = users.slice(0, max);
  const extra = users.length - max;

  return (
    <div className="flex -space-x-2">
      {shown.map((user, i) => (
        <Avatar
          key={i}
          name={user.name}
          image={user.image}
          size="sm"
          showStatus={false}
          className="ring-2 ring-surface-100"
        />
      ))}
      {extra > 0 && (
        <div className="w-8 h-8 rounded-2xl bg-surface-300 shadow-neu-btn flex items-center justify-center font-mono text-[10px] text-surface-500 ring-2 ring-surface-100">
          +{extra}
        </div>
      )}
    </div>
  );
};
