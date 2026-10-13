(() => {
  "use strict";
  document.querySelectorAll("[data-gc-header]").forEach(header => {
    const toggle = header.querySelector("[data-navigation-toggle]");
    const navigation = header.querySelector("[data-navigation]");
    if (!toggle || !navigation) return;
    const desktop = window.matchMedia("(min-width: 960px)");
    let open = false;
    function update() {
      navigation.hidden = !desktop.matches && !open;
      toggle.hidden = desktop.matches;
      toggle.setAttribute("aria-expanded", String(open));
      const key = open ? "accessibility.closeNavigation" : "accessibility.openNavigation";
      toggle.setAttribute("data-i18n-aria-label", key);
      toggle.setAttribute("aria-label", window.GoldenCraneI18n?.t(key, {}, open ? "Hauptnavigation schließen" : "Hauptnavigation öffnen") || (open ? "Hauptnavigation schließen" : "Hauptnavigation öffnen"));
    }
    toggle.addEventListener("click", () => { open = !open; update(); });
    header.addEventListener("keydown", event => {
      if (event.key === "Escape" && open && !desktop.matches) {
        open = false;
        update();
        toggle.focus();
      }
    });
    navigation.addEventListener("click", event => {
      if (event.target.closest("a") && !desktop.matches) { open = false; update(); }
    });
    desktop.addEventListener("change", () => {
      const focusWasInNavigation = navigation.contains(document.activeElement);
      open = false;
      update();
      if (!desktop.matches && focusWasInNavigation) toggle.focus();
    });
    update();
  });
})();
