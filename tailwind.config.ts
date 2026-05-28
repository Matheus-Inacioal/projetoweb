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
        // Paleta Premium
        verde_petroleo: "#0F2F2A",
        verde_escuro: "#174C43",
        marfim: "#F5EFE6",
        off_white: "#FFF8EF",
        texto_principal: "#0B1324",
        texto_secundario: "#526173",
        dourado: "#C89B3C",
        bege_borda: "#E4D8C8",
        vinho_escuro: "#7A1F2B",
        // Mapeamento para componentes (backward compatibility)
        fundo: "#FFF8EF",
        painel: "#FFF8EF",
        destaque: "#C89B3C",
        primaria: "#0F2F2A",
        secundaria: "#E4D8C8",
        perigo: "#7A1F2B",
        sucesso: "#174C43"
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "Plus Jakarta Sans", "Segoe UI", "sans-serif"],
        serif: ["Playfair Display", "Cormorant Garamond", "Fraunces", "Georgia", "serif"]
      },
      boxShadow: {
        suave: "0 8px 24px rgba(15, 47, 42, 0.12)",
        premium: "0 12px 32px rgba(15, 47, 42, 0.16)",
        elevado: "0 4px 12px rgba(15, 47, 42, 0.08)"
      },
      borderRadius: {
        xl2: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;

