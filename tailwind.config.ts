import type { Config } from "tailwindcss";

// Hardcoded values from branding config to avoid build-time import issues
// NOTE: These values should match brandingCore.colors in client/src/config/branding-core.ts
// We can't import brandingCore here because Tailwind config runs at build time and may have module resolution issues
const CJD_GREEN = "#00a844";      // brandingCore.colors.primary
const CJD_GREEN_DARK = "#008835"; // brandingCore.colors.primaryDark
const CJD_GREEN_LIGHT = "#e8f5e8"; // Derived from brandingCore.colors.primaryLight or successLight
const PRIMARY_FONT = "Lato";       // brandingCore.fonts.primary

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      'xs': '475px',
      ...require('tailwindcss/defaultTheme').screens,
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        'cjd-green': {
          DEFAULT: CJD_GREEN,
          dark: CJD_GREEN_DARK,
          light: CJD_GREEN_LIGHT,
        },
        'success': {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          dark: "var(--success-dark)",
          light: "var(--success-light)",
        },
        'warning': {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          dark: "var(--warning-dark)",
          light: "var(--warning-light)",
        },
        'error': {
          DEFAULT: "var(--error)",
          foreground: "var(--error-foreground)",
          dark: "var(--error-dark)",
          light: "var(--error-light)",
        },
        'info': {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
          dark: "var(--info-dark)",
          light: "var(--info-light)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        lato: [PRIMARY_FONT, 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
