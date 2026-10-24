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

    // Direktlink zu YouTube unter jedem Video, falls der eingebettete Player nicht lädt
    document.querySelectorAll(".video").forEach((fig) => {
      let a = fig.querySelector(".yt-link");
      if (!a) {
        a = document.createElement("a");
        a.className = "yt-link";
        a.target = "_blank";
        a.rel = "noopener";
        a.href = `https://www.youtube.com/watch?v=${fig.dataset.yt}`;
        fig.querySelector("figcaption").append(" · ", a);
      }
      a.textContent = t["videos.onYoutube"];
    });

    const note = document.querySelector(".legal-note");
    if (note) note.hidden = !t["legal.note"];

    const bio = document.getElementById("bio");
    if (bio) bio.innerHTML = t.bio.join("");

    const timeline = document.getElementById("timeline");
    if (timeline) {
      timeline.innerHTML = t.timeline
        .map(([year, title, text, ids]) => {
          const covers = (ids || []).map((id) => {
            const r = RELEASES.find((x) => x.id === id);
            return `<a class="tl-cover" href="musik.html?lang=${lang}#${id}" title="${r.title} – ${t["history.toMusic"]}">
              <img src="${r.cover}" alt="${r.title}" loading="lazy"><span>${r.title}</span></a>`;
          }).join("");
          const more = covers
            ? `<div class="tl-covers">${covers}</div><a class="tl-link" href="musik.html?lang=${lang}#${ids[0]}">${t["history.toMusic"]} →</a>`
            : "";
          return `<li><span class="tl-year">${year}</span><div><h3>${title}</h3><p>${text}</p>${more}</div></li>`;
        })
        .join("");
    }

    const records = document.getElementById("records");
    if (records) renderRecords(records, t);

    if (document.getElementById("dates")) renderDates();

    document.querySelectorAll(".lang button").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));

    try { localStorage.setItem("yc-lang", lang); } catch (e) {}
  }

  function renderRecords(el, t) {
    el.innerHTML = RELEASES.map((r) => {
      const meta = [r.year, t["type." + r.type], r.label].filter(Boolean).join(" · ");
      let actions = "";
      if (r.spotify) {
        const [kind, sid] = r.spotify;
        actions = `
          <button type="button" class="btn embed-consent embed-consent--inline" data-embed="https://open.spotify.com/embed/${kind}/${sid}?theme=0" data-height="152" data-title="${r.title}">▶ ${t["music.preview"]}</button>
          <a class="btn btn--spotify" href="https://open.spotify.com/${kind}/${sid}" target="_blank" rel="noopener">${t["music.onSpotify"]}</a>`;
      } else if (r.link) {
        actions = `<a class="btn" href="${r.link}" target="_blank" rel="noopener">${r.linkName}</a>`;
      } else {
        actions = `<p class="record-date">${t["rel.soon"]}</p>`;
      }
      return `<article class="record${r.id === "ltp" ? " record--new" : ""}" id="${r.id}">
        <img src="${r.cover}" alt="${r.title}" loading="lazy">
        <div class="record-body">
          <p class="record-meta">${meta}</p>
          <h3>${r.title}</h3>
          <p>${t["rel." + r.id]}</p>
          <div class="record-actions">${actions}</div>
          ${r.spotify ? `<p class="record-note">${t["music.spotifyNote"]}</p>` : ""}
        </div>
      </article>`;
    }).join("");
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
      iframe.title = fig.querySelector("figcaption").firstChild.textContent.trim();
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      fig.querySelector(".video-consent").replaceWith(iframe);
    });
  });

  // Spotify-Player wird erst nach Klick geladen (Datenschutz)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".embed-consent");
    if (!btn) return;
    const iframe = document.createElement("iframe");
    iframe.src = btn.dataset.embed;
    iframe.title = btn.dataset.title || "Spotify";
    iframe.height = btn.dataset.height;
    iframe.className = "embed";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    const actions = btn.closest(".record-actions");
    if (actions) {
      // Player unter den Buttons einfügen, Spotify-Link bleibt daneben sichtbar
      btn.remove();
      actions.after(iframe);
    } else {
      btn.replaceWith(iframe);
    }
  });

  renderLayout();
  setLang(pickLang());

  // Sprung zu einem Release (z. B. aus der Geschichte), nachdem die Liste gerendert ist
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }

  if (document.getElementById("countdown") && tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }
})();
