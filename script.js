(function () {
  const LANGS = ["de", "en", "fr"];
  // Release: 14.12.2026, 00:00 Uhr Berliner Zeit
  const RELEASE = new Date("2026-12-14T00:00:00+01:00");

  let lang = "de";

  function pickLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    try {
      const saved = localStorage.getItem("yc-lang");
      if (LANGS.includes(saved)) return saved;
    } catch (e) {}
    const nav = (navigator.language || "de").slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : "en";
  }

  function setLang(next) {
    lang = next;
    const t = I18N[lang];
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (t[key] !== undefined) el.alt = t[key];
    });

    document.getElementById("bio").innerHTML = t.bio.join("");

    document.getElementById("timeline").innerHTML = t.timeline
      .map(([year, title, text]) =>
        `<li><span class="tl-year">${year}</span><div><h3>${title}</h3><p>${text}</p></div></li>`)
      .join("");

    renderDates();

    document.querySelectorAll(".lang button").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));

    try { localStorage.setItem("yc-lang", lang); } catch (e) {}
  }

  function renderDates() {
    const list = document.getElementById("dates");
    const empty = document.getElementById("dates-empty");
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = CONCERTS.filter((c) => c.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    const locale = { de: "de-DE", en: "en-GB", fr: "fr-FR" }[lang];

    empty.hidden = upcoming.length > 0;
    list.innerHTML = upcoming
      .map((c) => {
        const d = new Date(c.date + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
        const ticket = c.ticket
          ? `<a class="btn btn--small" href="${c.ticket}" target="_blank" rel="noopener">${I18N[lang]["dates.tickets"]}</a>`
          : "";
        return `<li><span class="date">${d}</span><span class="city">${c.city}</span><span class="venue">${c.venue || ""}</span>${ticket}</li>`;
      })
      .join("");
  }

  function tick() {
    const diff = RELEASE - new Date();
    if (diff <= 0) {
      document.getElementById("countdown").hidden = true;
      document.getElementById("released").hidden = false;
      return false;
    }
    const s = Math.floor(diff / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    document.getElementById("cd-days").textContent = Math.floor(s / 86400);
    document.getElementById("cd-hours").textContent = pad(Math.floor((s % 86400) / 3600));
    document.getElementById("cd-minutes").textContent = pad(Math.floor((s % 3600) / 60));
    document.getElementById("cd-seconds").textContent = pad(s % 60);
    return true;
  }

  // YouTube wird erst nach Klick geladen (Datenschutz)
  document.querySelectorAll(".video").forEach((fig) => {
    fig.querySelector(".video-consent").addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${fig.dataset.yt}?autoplay=1`;
      iframe.title = fig.querySelector("figcaption").textContent;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      fig.querySelector(".video-consent").replaceWith(iframe);
    });
  });

  document.querySelectorAll(".lang button").forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.lang)));

  document.getElementById("year").textContent = new Date().getFullYear();

  setLang(pickLang());
  if (tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }
})();
