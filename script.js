(function () {
  const LANGS = ["de", "en", "fr"];
  // Release: 14.12.2026, 00:00 Uhr Berliner Zeit
  const RELEASE = new Date("2026-12-14T00:00:00+01:00");

  // Menü: Dateiname der Seite → Text-Schlüssel in i18n.js
  const NAV = [
    ["musik", "nav.music"],
    ["ueber-uns", "nav.about"],
    ["geschichte", "nav.history"],
    ["termine", "nav.dates"],
    ["videos", "nav.videos"],
  ];

  const page = document.body.dataset.page || "index";
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

  function renderLayout() {
    const links = NAV.map(([slug, key]) =>
      `<a href="${slug}.html" data-nav data-i18n="${key}"${slug === page ? ' aria-current="page"' : ""}></a>`).join("");

    document.getElementById("site-header").outerHTML = `
      <header class="site-header">
        <a class="logo" href="index.html" data-nav>Yalta Club</a>
        <nav class="nav">${links}</nav>
        <div class="lang" role="group" aria-label="Sprache / Language / Langue">
          ${LANGS.map((l) => `<button type="button" data-lang="${l}">${l.toUpperCase()}</button>`).join("")}
        </div>
      </header>`;

    document.getElementById("site-footer").outerHTML = `
      <footer class="site-footer">
        <p class="footer-band">Yalta Club</p>
        <p data-i18n="footer.welcome"></p>
        <p class="footer-links">
          <a href="impressum.html" data-nav data-i18n="legal.imprint"></a>
          <a href="datenschutz.html" data-nav data-i18n="legal.privacy"></a>
        </p>
        <p class="small">© ${new Date().getFullYear()} Yalta Club</p>
      </footer>`;

    document.querySelectorAll(".lang button").forEach((b) =>
      b.addEventListener("click", () => setLang(b.dataset.lang)));
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

    // Sprache in internen Links mitgeben, damit sie beim Seitenwechsel erhalten bleibt
    document.querySelectorAll("a[data-nav]").forEach((a) => {
      const file = a.getAttribute("href").split("?")[0];
      a.setAttribute("href", `${file}?lang=${lang}`);
    });

    const note = document.querySelector(".legal-note");
    if (note) note.hidden = !t["legal.note"];

    const bio = document.getElementById("bio");
    if (bio) bio.innerHTML = t.bio.join("");

    const timeline = document.getElementById("timeline");
    if (timeline) {
      timeline.innerHTML = t.timeline
        .map(([year, title, text]) =>
          `<li><span class="tl-year">${year}</span><div><h3>${title}</h3><p>${text}</p></div></li>`)
        .join("");
    }

    if (document.getElementById("dates")) renderDates();

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

  renderLayout();
  setLang(pickLang());

  if (document.getElementById("countdown") && tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }
})();
