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
        // 塔罗占卜屋自定义配色
        primary: '#2C1810',    // 深棕 - 主色调
        accent: '#C4994C',     // 金色 - 强调色
        cream: '#F5F0E8',      // 米白 - 浅色背景
        dark: '#1A0F0A',       // 深色背景
        // Tailwind 原有扩展
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
