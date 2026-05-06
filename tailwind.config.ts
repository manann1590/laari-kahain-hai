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

          // ── Brand palette (FoodRadar) ────────────────────────────
          orange: "#FF5722",   // FoodRadar Red-Orange — primary CTA
          yellow: "#FF8C00",   // Radar Amber          — highlights
          red:    "#E53935",   // Pin Red              — urgency
          brown:  "#1A0A00",   // Deep Dark
          leaf:   "#00C853",   // Radar Green          — live / active
          hover:  "#FF7043",   // Hover accent

          // ── Functional ───────────────────────────────────────────
          success: "#00C853",
          error:   "#EF4444",
          warning: "#FF8C00",
          info:    "#00C853",

          // ── Legacy aliases ────────────────────────────────────────
          soft:   "#FDF8F2",
          amber:  "#FF5722",
          green:  "#00C853",
          teal:   "#00C853",
          blue:   "#818CF8",
        },
      },
      boxShadow: {
        soft:        "0 8px 32px rgba(43, 27, 18, 0.10)",
        card:        "0 2px 12px rgba(43, 27, 18, 0.08)",
        glow:        "0 0 28px rgba(255, 87, 34, 0.25)",
        "glow-gold": "0 0 28px rgba(255, 140, 0, 0.24)",
        "glow-green":"0 0 28px rgba(0, 200, 83, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
