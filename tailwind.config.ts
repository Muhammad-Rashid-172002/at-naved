import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand tokens — mustard + tamarind, with ketchup red reserved for actions.
        mustard: { DEFAULT: "#FFC21A", light: "#FFE79E", soft: "#FFF6D9", dark: "#E5A800" },
        tamarind: { DEFAULT: "#3B1611", soft: "#5B2A21", muted: "#8A6A60" },
        ketchup: { DEFAULT: "#E0301E", dark: "#BF2414", light: "#FDE8E4" },
        paper: { DEFAULT: "#FFFDF8", warm: "#FAF4E8" },
        mint: { DEFAULT: "#22784A", light: "#E2F3E8" },
        line: "#EDE3D3",
        // Premium dark surfaces for the customer site (cinematic sections, nav, footer).
        char: { DEFAULT: "#0E0A08", 2: "#16100C", 3: "#211812", 4: "#2C211A", line: "#3A2D24" },
        cream: { DEFAULT: "#F7EFE3", soft: "#FBF7F0" },
        flame: { DEFAULT: "#FF5B1F", dark: "#E2430B" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Manrope Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(59,22,17,.06), 0 10px 28px -18px rgba(59,22,17,.35)",
        lift: "0 22px 44px -22px rgba(59,22,17,.45)",
        cta: "0 10px 24px -10px rgba(224,48,30,.7)",
        sticker: "4px 4px 0 0 #3B1611",
        premium: "0 1px 0 rgba(255,255,255,.04) inset, 0 30px 60px -30px rgba(0,0,0,.65)",
        glow: "0 0 0 1px rgba(255,194,26,.25), 0 18px 50px -12px rgba(255,91,31,.45)",
        float: "0 40px 80px -30px rgba(14,10,8,.55), 0 12px 24px -12px rgba(14,10,8,.25)",
      },
      keyframes: {
        "hero-in": { from: { opacity: "0", transform: "translateY(24px) rotate(-4deg) scale(.96)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "none" } },
        bump: { "0%,100%": { transform: "scale(1)" }, "40%": { transform: "scale(1.3)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "none" } },
        "pop-check": { "0%": { transform: "scale(0)" }, "70%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
        "ping-slow": { "75%,100%": { transform: "scale(2.2)", opacity: "0" } },
        float: { "0%,100%": { transform: "translate3d(0,0,0) rotate(var(--r,0deg))" }, "50%": { transform: "translate3d(0,-14px,0) rotate(calc(var(--r,0deg) + 3deg))" } },
        "float-slow": { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-22px,0)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "rise-in": { from: { opacity: "0", transform: "translate3d(0,28px,0)" }, to: { opacity: "1", transform: "none" } },
        "blur-in": { from: { opacity: "0", filter: "blur(12px)", transform: "scale(1.04)" }, to: { opacity: "1", filter: "blur(0)", transform: "none" } },
        marquee: { to: { transform: "translateX(-50%)" } },
        "page-in": { from: { opacity: "0", transform: "translate3d(0,14px,0)" }, to: { opacity: "1", transform: "none" } },
        "glow-pulse": { "0%,100%": { opacity: ".55" }, "50%": { opacity: ".9" } },
      },
      animation: {
        "hero-in": "hero-in .9s cubic-bezier(.2,.8,.2,1) both",
        "fade-in": "fade-in .35s ease-out both",
        "scale-in": "scale-in .22s ease-out both",
        bump: "bump .45s ease-out",
        shimmer: "shimmer 1.4s infinite",
        "slide-in-right": "slide-in-right .3s cubic-bezier(.2,.8,.2,1)",
        "slide-up": "slide-up .3s cubic-bezier(.2,.8,.2,1)",
        "pop-check": "pop-check .5s cubic-bezier(.2,.8,.2,1) both",
        "ping-slow": "ping-slow 1.8s cubic-bezier(0,0,.2,1) infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        "rise-in": "rise-in .8s cubic-bezier(.2,.8,.2,1) both",
        "blur-in": "blur-in 1.1s cubic-bezier(.2,.8,.2,1) both",
        marquee: "marquee 38s linear infinite",
        "page-in": "page-in .55s cubic-bezier(.2,.8,.2,1) both",
        "glow-pulse": "glow-pulse 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
