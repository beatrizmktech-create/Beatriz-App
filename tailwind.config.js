/** Tailwind 3.4 — gera styles.css a partir de src/estilo.css.
 * Rodar: npm install && npm run css */
module.exports = {
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", sunk: "var(--sunk)", fg: "var(--fg)", muted: "var(--muted)", line: "var(--line)",
        accent: "var(--accent)", "accent-soft": "var(--accent-soft)", "on-accent": "var(--on-accent)",
        done: "var(--done)", "done-soft": "var(--done-soft)", late: "var(--late)", "late-soft": "var(--late-soft)",
        pa: "var(--pa)", "pa-soft": "var(--pa-soft)", pb: "var(--pb)", "pb-soft": "var(--pb-soft)",
      },
      fontFamily: {
        display: ["Lexend", "Trebuchet MS", "system-ui", "sans-serif"],
        body: ["Atkinson Hyperlegible", "Verdana", "system-ui", "sans-serif"],
        mono: ["Atkinson Hyperlegible Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px var(--shadow), 0 10px 30px -14px var(--shadow-strong)",
        float: "0 12px 40px -12px var(--shadow-strong)",
      },
      transitionTimingFunction: { soft: "cubic-bezier(.22,1,.36,1)" },
    },
  },
};
