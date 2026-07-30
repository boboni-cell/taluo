import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#17130F',
        accent: '#B97843',
        starlight: '#9C7E72',
        cream: '#F0EADF',
        muted: '#918A80',
        dark: '#0B0A08',
        ink: '#0B0A08',
        line: '#2B2722',
        // Tailwind 原有扩展
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
