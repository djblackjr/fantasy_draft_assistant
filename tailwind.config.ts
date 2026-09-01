import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pos: {
          QB: "#c084fc",
          RB: "#4ade80",
          WR: "#60a5fa",
          TE: "#fb923c",
          FLEX: "#facc15",
          DST: "#94a3b8",
          K: "#f472b6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
