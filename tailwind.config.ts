import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#1a1625",
          2: "#211c30",
          3: "#271f38",
        },
        surface: {
          DEFAULT: "#2a2040",
          2: "#312548",
          3: "#3a2d55",
          4: "#453568",
        },
        violet: {
          50:  "#f5f0ff",
          100: "#ede0ff",
          200: "#d8c0ff",
          300: "#c080ff",
          400: "#a040ff",
          DEFAULT: "#9b30ff",
          500: "#9b30ff",
          600: "#7b00e0",
          700: "#5c00b0",
          800: "#400090",
          900: "#280060",
        },
        neon: {
          DEFAULT: "#39ff14",
          300: "#80ff60",
          400: "#39ff14",
          500: "#20d000",
        },
        lava: {
          DEFAULT: "#ff4040",
          300: "#ff8080",
          400: "#ff4040",
          500: "#d02020",
        },
        gold: {
          DEFAULT: "#ffd700",
          400: "#ffd700",
          500: "#d4b000",
        },
        text: {
          primary: "#e8e0f0",
          secondary: "#a090c0",
          muted: "#6a5a8a",
        },
      },
      boxShadow: {
        "neu-flat":    "6px 6px 14px rgba(0,0,0,0.45), -4px -4px 10px rgba(255,255,255,0.04)",
        "neu-pressed": "inset 4px 4px 10px rgba(0,0,0,0.5), inset -3px -3px 7px rgba(255,255,255,0.04)",
        "neu-card":    "5px 5px 15px rgba(0,0,0,0.4), -3px -3px 8px rgba(255,255,255,0.03)",
        "neu-btn":     "4px 4px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(255,255,255,0.04)",
        "neu-btn-active": "inset 3px 3px 6px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(255,255,255,0.03)",
        "neu-input":   "inset 3px 3px 7px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.03)",
        "glow-v":      "0 0 20px rgba(155,48,255,0.4)",
        "glow-n":      "0 0 20px rgba(57,255,20,0.4)",
        "glow-l":      "0 0 20px rgba(255,64,64,0.4)",
        "glow-g":      "0 0 20px rgba(255,215,0,0.4)",
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:  ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        pixel: ['"Press Start 2P"', "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "slide-up":   "slide-up 0.25s ease-out",
        "slide-in":   "slide-in-left 0.2s ease-out",
        "fade-in":    "fade-in 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "ring-ring":  "ring-ring 1s ease-in-out infinite",
        "spin-slow":  "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
