import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/componentes/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        fundo: "#f5efe5",
        painel: "#fffaf3",
        destaque: "#a35f2b",
        primaria: "#173a35",
        secundaria: "#d7c3ab",
        perigo: "#9f2d2d",
        sucesso: "#1f6a4e"
      },
      boxShadow: {
        suave: "0 20px 45px -24px rgba(23, 58, 53, 0.28)"
      },
      borderRadius: {
        xl2: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;

