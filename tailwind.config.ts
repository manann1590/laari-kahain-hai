import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          // ── Backgrounds ──────────────────────────────────────────
          bg:     "#F8FAFC",
          card:   "#FFFFFF",
          line:   "#D8E0EA",
          ink:    "#1F2937",

          // ── Text ─────────────────────────────────────────────────
          text:   "#1F2937",
          muted:  "#5E6B7A",

          // ── Product palette ──────────────────────────────────────
          orange: "#FF4D3D",
          yellow: "#F59E0B",
          red:    "#DC2626",
          brown:  "#1F2937",
          leaf:   "#22C55E",
          hover:  "#E63B2F",

          // ── Functional ───────────────────────────────────────────
          success: "#16A34A",
          error:   "#DC2626",
          warning: "#F59E0B",
          info:    "#2563EB",

          // ── Legacy aliases ────────────────────────────────────────
          soft:   "#F8FAFC",
          amber:  "#F59E0B",
          green:  "#22C55E",
          teal:   "#FF4D3D",
          blue:   "#2563EB",
        },
      },
      boxShadow: {
        soft:        "0 18px 50px rgba(15, 23, 42, 0.10)",
        card:        "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
        glow:        "0 14px 30px rgba(255, 77, 61, 0.18)",
        "glow-gold": "0 12px 24px rgba(245, 158, 11, 0.18)",
        "glow-green":"0 12px 24px rgba(34, 197, 94, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
