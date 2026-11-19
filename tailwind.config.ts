import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {
    colors: { ink: "#191919", paper: "#F7F5F0", muted: "#77736D", line: "#E8E4DC", accent: "#D5F36A" },
    boxShadow: { soft: "0 18px 60px rgba(25, 25, 25, 0.08)" }
  }},
  plugins: []
};
export default config;
