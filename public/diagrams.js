/* ============================================================
   CREMEN Smart Water — Mermaid diagram bootstrap
   Loads Mermaid v10 from CDN, applies a site-matched dark theme,
   and renders the two architecture diagrams declared in index.html.
   ============================================================ */

import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
  theme: "base",
  themeVariables: {
    fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
    primaryColor: "#15293a",
    primaryBorderColor: "#2da8e0",
    primaryTextColor: "#e8f1f8",
    lineColor: "#5b86a3",
    secondaryColor: "#1c354a",
    tertiaryColor: "#11212f",
    clusterBkg: "rgba(28,53,74,.45)",
    clusterBorder: "#234157",
    edgeLabelBackground: "#0c1620",
    fontSize: "15px",
  },
  flowchart: { curve: "basis", htmlLabels: true, padding: 12 },
});

/* Mermaid auto-renders any <pre class="mermaid"> on load (startOnLoad).
   The graph definitions live inline in index.html so the page degrades
   gracefully (the source text is visible) if the CDN is unreachable. */
