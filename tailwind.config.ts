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
          bg:     "#FDF8F2",   // main page — warm beige
          card:   "#FFFDF8",   // card / panel surface
          line:   "#E7D7C9",   // border — light sand
          ink:    "#2B1B12",   // dark brown (header, footer, deep accents)

          // ── Text ─────────────────────────────────────────────────
          text:   "#2D2A26",   // primary — charcoal brown
          muted:  "#6B5E55",   // secondary — warm muted brown

          // ── Brand palette (from logo) ─────────────────────────────
          orange: "#F97316",   // Indian Laari Orange — primary CTA
          yellow: "#F7B500",   // Street Food Yellow  — highlights
          red:    "#D62828",   // Cart Accent Red      — urgency / trending
          brown:  "#2B1B12",   // Outline / Depth
          leaf:   "#2E7D32",   // Leaf Green           — trust / freshness
          hover:  "#FFB703",   // Bright Mango         — hover accent

          // ── Functional ───────────────────────────────────────────
          success: "#22C55E",
          error:   "#EF4444",
          warning: "#F59E0B",
          info:    "#38BDF8",

          // ── Legacy aliases (keep compiling) ──────────────────────
          soft:   "#FDF8F2",   // ← same as bg; used in bg-civic-soft/*
          amber:  "#F97316",   // ← same as orange; many refs use civic-amber
          green:  "#22C55E",   // ← success green
          teal:   "#38BDF8",   // ← info blue
          blue:   "#818CF8",   // soft indigo
        },
      },
      boxShadow: {
        soft:        "0 8px 32px rgba(43, 27, 18, 0.10)",
        card:        "0 2px 12px rgba(43, 27, 18, 0.08)",
        glow:        "0 0 28px rgba(249, 115, 22, 0.20)",
        "glow-gold": "0 0 28px rgba(247, 181, 0, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
