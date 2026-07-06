export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222 47% 11%)",
        primary: {
          DEFAULT: "hsl(217 91% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        success: "hsl(151 55% 42%)",
        warning: "hsl(38 92% 50%)",
        destructive: "hsl(0 84% 60%)",
      },
      boxShadow: {
        soft: "0 12px 36px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
