/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "apple-dark": {
          "primary": "#2997ff",
          "primary-content": "#ffffff",
          "secondary": "#333333",
          "accent": "#0071e3",
          "neutral": "#1d1d1f",
          "base-100": "#272729", // Tile 1
          "base-200": "#2a2a2c", // Tile 2
          "base-300": "#252527", // Tile 3
          "base-content": "#ffffff",
          "info": "#2997ff",
          "success": "#32d74b", // Apple standard green
          "warning": "#ffd60a", // Apple standard yellow
          "error": "#ff453a", // Apple standard red
          "--rounded-box": "18px", // Card radius
          "--rounded-btn": "9999px", // Pill buttons
          "--rounded-badge": "9999px",
        },
      },
      "dark", "light"
    ],
  },
}
