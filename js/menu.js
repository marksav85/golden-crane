(() => {
  "use strict";
  const container = document.querySelector("#main-content section[data-category]");
  if (!container) return;
  const siteRoot = new URL("../", document.currentScript.src);
  const i18n = window.GoldenCraneI18n;
  const modernLayout = container.dataset.menuLayout === "cards";
  const fallbacks = {
    "menu.loading": "Speisekarte wird geladen …",
    "menu.error": "Die Speisekarte konnte nicht geladen werden. Bitte lade die Seite neu oder versuche es später noch einmal.",
  };
  let category;
  let failed = false;
  let cards = [];
  function localized(value) {
    return i18n ? i18n.localized(value) : (value?.de || "");
  }
  function translate(key) { return i18n?.t(key, {}, fallbacks[key]) || fallbacks[key]; }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function createCard(item, index) {
    if (modernLayout) return createModernCard(item, index);
    const card = element("div", "menu-item-tile col-md-6");
    card.id = item.id;
    const row = element("div", "row");
    const media = element("div", "col-sm-5");
    const photo = element("div", "menu-item-photo");
    const image = element("img", "img-responsive");
    image.width = 250;
    image.height = 150;
    image.src = new URL(item.image, siteRoot).href;
    photo.append(element("div", "", item.code), image);
    const price = element("div", "menu-item-price");
    media.append(photo, price);
    const description = element("div", "menu-item-description col-sm-7");
    const title = element("h3", "menu-item-title");
    const details = element("p", "menu-item-details");
    description.append(title, details);
    row.append(media, description);
    card.append(row, element("hr", "visible-xs"));
    cards.push({ item, image, price, title, details });
    return card;
  }
  function createModernCard(item, index) {
    const card = element("article", "gc-menu-card");
    card.id = item.id;
    card.setAttribute("aria-labelledby", `${item.id}-title`);
    const photo = element("div", "gc-menu-card__photo");
    const image = element("img", "gc-menu-card__image");
    image.width = 250;
    image.height = 150;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    image.src = new URL(item.image, siteRoot).href;
    photo.append(image, element("span", "gc-menu-card__code", item.code));
    const content = element("div", "gc-menu-card__content");
    const headline = element("div", "gc-menu-card__headline");
    const title = element("h2", "gc-menu-card__title");
    title.id = `${item.id}-title`;
    const price = element("p", "gc-menu-card__price");
    const details = element("p", "gc-menu-card__description");
    headline.append(title, price);
    content.append(headline, details);
    card.append(photo, content);
    cards.push({ item, image, price, title, details });
    return card;
  }
  function showStatus(key) {
    const message = element("p", modernLayout ? "gc-menu-status" : "text-center", translate(key));
    message.setAttribute("role", key === "menu.error" ? "alert" : "status");
    container.replaceChildren(message);
  }
  function updateText() {
    if (failed) { showStatus("menu.error"); return; }
    if (!category) { showStatus("menu.loading"); return; }
    const priceFormatter = new Intl.NumberFormat(i18n?.language === "en" ? "en-IE" : "de-DE", { style: "currency", currency: "EUR" });
    for (const { item, image, price, title, details } of cards) {
      title.textContent = localized(item.name);
      details.textContent = localized(item.description);
      image.alt = localized(item.name);
      price.textContent = priceFormatter.format(item.price);
    }
    const name = localized(category.name);
    const heading = document.querySelector("#menu-categories-title");
    if (heading) heading.textContent = name;
    const introduction = document.querySelector("[data-category-introduction]");
    if (introduction) introduction.textContent = localized(category.introduction);
    const count = document.querySelector("[data-category-count]");
    if (count) count.textContent = i18n?.t("menu.itemCount", { count: category.items.length }, `${category.items.length} Gerichte`) || `${category.items.length} Gerichte`;
    container.setAttribute("aria-label", i18n?.t("accessibility.menuItems", { category: name }, `Gerichte: ${name}`) || `Gerichte: ${name}`);
    i18n?.setMetadataContext({ category: category.name });
  }
  document.addEventListener("goldencrane:languagechange", updateText);
  async function loadMenu() {
    try {
      await i18n?.ready;
      showStatus("menu.loading");
      const response = await fetch(new URL("data/menu.json", siteRoot));
      if (!response.ok) throw new Error("Menu request failed");
      const data = await response.json();
      const selected = data.categories?.find(({ id }) => id === container.dataset.category);
      if (data.currency !== "EUR" || !selected || !Array.isArray(selected.items) || !selected.items.length || !localized(selected.name)) {
        throw new Error("Menu category unavailable");
      }
      for (const item of selected.items) {
        if (![item.id, item.code, item.image].every(value => typeof value === "string" && value.trim()) || !localized(item.name) || !localized(item.description) || !Number.isFinite(item.price) || item.price <= 0) {
          throw new Error("Invalid menu item");
        }
      }
      const fragment = document.createDocumentFragment();
      cards = [];
      selected.items.forEach((item, index) => fragment.append(createCard(item, index)));
      category = selected;
      container.replaceChildren(fragment);
      updateText();
    } catch {
      failed = true;
      showStatus("menu.error");
    } finally {
      container.setAttribute("aria-busy", "false");
    }
  }
  loadMenu();
})();
