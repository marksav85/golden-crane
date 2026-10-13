// Loaded synchronously in the head so the first paint uses the selected theme.
(() => {
  "use strict";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;
  try {
    const saved = localStorage.getItem("golden-crane-theme");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch { /* Storage is optional. */ }
  function apply() {
    const theme = preference || (system.matches ? "dark" : "light");
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-choice]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
  }
  apply();
  system.addEventListener("change", () => { if (!preference) apply(); });
  document.addEventListener("DOMContentLoaded", apply);
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-theme-choice]");
    if (!button || !["light", "dark"].includes(button.dataset.themeChoice)) return;
    preference = button.dataset.themeChoice;
    try { localStorage.setItem("golden-crane-theme", preference); } catch { /* Storage is optional. */ }
    apply();
  });
})();
