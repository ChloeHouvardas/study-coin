// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Enhanced cyber colors
        "cyber-blue": "#00ffff",
        "neon-green": "#00ff00",
        "electric-pink": "#ff00ff",
        "warning-orange": "#ff8000",
        "deep-purple": "#6600cc",
        "matrix-green": "#00ff41",
        "plasma-blue": "#0080ff",
        "volt-yellow": "#ffff00",

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-cyber": "var(--gradient-cyber)",
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-dark": "var(--gradient-dark)",
        "circuit-pattern": `
          linear-gradient(90deg, #00ffff1a 1px, transparent 1px),
          linear-gradient(0deg, #00ff001a 1px, transparent 1px)
        `,
        "data-stream": `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 10px,
            #00ffff33 10px,
            #00ffff33 20px
          )
        `,
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 40px #00ff00, 0 0 80px #00ff00, 0 0 120px #00ff00",
            transform: "scale(1.02)"
          },
        },
        "text-glow": {
          "0%, 100%": { 
            textShadow: "0 0 10px currentColor, 0 0 20px currentColor"
          },
          "50%": { 
            textShadow: "0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor"
          },
        },
        "border-flow": {
          "0%": { 
            borderColor: "#00ffff",
            boxShadow: "0 0 20px #00ffff33"
          },
          "25%": { 
            borderColor: "#00ff00",
            boxShadow: "0 0 20px #00ff0033"
          },
          "50%": { 
            borderColor: "#ff00ff",
            boxShadow: "0 0 20px #ff00ff33"
          },
          "75%": { 
            borderColor: "#ffff00",
            boxShadow: "0 0 20px #ffff0033"
          },
          "100%": { 
            borderColor: "#00ffff",
            boxShadow: "0 0 20px #00ffff33"
          },
        },
        "data-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scaleX(1)" },
          "50%": { opacity: "1", transform: "scaleX(1.1)" },
        },
        "holographic": {
          "0%, 100%": { 
            transform: "rotateY(0deg)",
            filter: "hue-rotate(0deg)"
          },
          "25%": { 
            transform: "rotateY(5deg)",
            filter: "hue-rotate(90deg)"
          },
          "50%": { 
            transform: "rotateY(0deg)",
            filter: "hue-rotate(180deg)"
          },
          "75%": { 
            transform: "rotateY(-5deg)",
            filter: "hue-rotate(270deg)"
          },
        },
        mining: {
          "0%, 100%": { 
            transform: "scale(1) rotate(0deg)",
            filter: "brightness(1)"
          },
          "25%": { 
            transform: "scale(1.05) rotate(90deg)",
            filter: "brightness(1.2)"
          },
          "50%": { 
            transform: "scale(1.1) rotate(180deg)",
            filter: "brightness(1.5)"
          },
          "75%": { 
            transform: "scale(1.05) rotate(270deg)",
            filter: "brightness(1.2)"
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "scan-lines": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "text-glow": "text-glow 2s ease-in-out infinite",
        "border-flow": "border-flow 3s linear infinite",
        "data-pulse": "data-pulse 1.5s ease-in-out infinite",
        "holographic": "holographic 4s ease-in-out infinite",
        "mining": "mining 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "scan-lines": "scan-lines 2s linear infinite",
      },
      boxShadow: {
        "glow-cyan": "0 0 30px #00ffff, 0 0 60px #00ffff40",
        "glow-green": "0 0 30px #00ff00, 0 0 60px #00ff0040",
        "glow-pink": "0 0 30px #ff00ff, 0 0 60px #ff00ff40",
        "gaming": "0 0 20px rgba(0, 255, 255, 0.5)",
        "cyber-intense": "0 0 50px #00ffff80, 0 0 100px #00ff0040",
        "neon-multi": "0 0 20px #00ffff, 0 0 40px #00ff00, 0 0 60px #ff00ff",
      },
      textShadow: {
        "neon": "0 0 10px currentColor, 0 0 20px currentColor",
        "cyber": "0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add text-shadow utilities
    function({ addUtilities }: any) {
      addUtilities({
        '.text-shadow-neon': {
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor',
        },
        '.text-shadow-cyber': {
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
        },
      });
    },
  ],
} satisfies Config;