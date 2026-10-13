(() => {
  "use strict";
  const root = new URL("../", document.currentScript.src);
  const cache = new Map();
  const originals = new WeakMap();
  const supported = ["de", "en"];
  let language = "de";
  let requestedLanguage = "de";
  let revision = 0;
  let metadataContext = {};
  try {
    const saved = localStorage.getItem("golden-crane-language");
    if (supported.includes(saved)) requestedLanguage = saved;
  } catch { /* Storage is optional. */ }

  function dictionary(lang) {
    if (!cache.has(lang)) {
      cache.set(lang, fetch(new URL(`data/${lang}.json`, root))
        .then(response => {
          if (!response.ok) throw new Error("Translation request failed");
          return response.json();
        })
        .then(data => data && typeof data === "object" && !Array.isArray(data) ? data : {})
        .catch(() => ({})));
    }
    return cache.get(lang);
  }
  let german = {};
  let active = {};
  function lookup(data, key) {
    const value = key.split(".").reduce((node, part) => node?.[part], data);
    return typeof value === "string" && value.trim() ? value : undefined;
  }
  function localized(value, fallback = "") {
    if (typeof value === "string") return value.trim() ? value : fallback;
    return lookup(value, language) || lookup(value, "de") || fallback;
  }
  function t(key, parameters = {}, fallback = "") {
    const text = lookup(active, key) || lookup(german, key) || fallback;
    return text.replace(/\{(\w+)\}/g, (match, name) => parameters[name] ?? match);
  }
  function original(node, attribute) {
    if (!originals.has(node)) originals.set(node, {});
    const values = originals.get(node);
    if (!(attribute in values)) values[attribute] = attribute === "text" ? node.textContent : node.getAttribute(attribute);
    return values[attribute] || "";
  }
  function apply(scope = document) {
    const parameters = { year: new Date().getFullYear() };
    scope.querySelectorAll("[data-i18n]").forEach(node => {
      node.textContent = t(node.dataset.i18n, parameters, original(node, "text"));
    });
    for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
      scope.querySelectorAll(`[data-i18n-${attribute}]`).forEach(node => {
        node.setAttribute(attribute, t(node.getAttribute(`data-i18n-${attribute}`), parameters, original(node, attribute)));
      });
    }
    document.querySelectorAll("[data-language]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    updateMetadata();
  }
  function updateMetadata() {
    const page = document.documentElement.dataset.page;
    if (!page) return;
    const parameters = Object.fromEntries(Object.entries(metadataContext).map(([key, value]) => [key, localized(value)]));
    // Category templates must wait until menu data supplies the category name.
    if (page === "category" && !parameters.category) return;
    const title = t(`metadata.${page}.title`, parameters);
    const description = t(`metadata.${page}.description`, parameters);
    if (title) document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (description && meta) meta.content = description;
  }
  async function setLanguage(next, persist = true) {
    if (!supported.includes(next)) return;
    const ticket = ++revision;
    const [de, translations] = await Promise.all([dictionary("de"), dictionary(next)]);
    if (ticket !== revision) return;
    const resolved = next === "en" && Object.keys(translations).length ? "en" : "de";
    const changed = language !== resolved;
    german = de;
    active = resolved === "de" ? de : translations;
    language = resolved;
    document.documentElement.lang = language;
    if (persist) {
      try { localStorage.setItem("golden-crane-language", language); } catch { /* Storage is optional. */ }
    }
    apply();
    if (changed) document.dispatchEvent(new CustomEvent("goldencrane:languagechange", { detail: { language } }));
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-language]");
    if (button) setLanguage(button.dataset.language);
  });
  window.GoldenCraneI18n = {
    get language() { return language; },
    t,
    localized,
    apply,
    setLanguage,
    setMetadataContext(context) { metadataContext = context; updateMetadata(); },
    ready: setLanguage(requestedLanguage, false),
  };
})();
