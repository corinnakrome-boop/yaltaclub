# Yalta Club

Website der Band Yalta Club, auf Deutsch, Englisch und Französisch.
Reines HTML/CSS/JavaScript, kein Build nötig.

## Seiten

`index.html` (Start mit Countdown), `musik.html`, `ueber-uns.html`, `geschichte.html`,
`termine.html`, `videos.html`, `impressum.html`, `datenschutz.html`.
Menü und Fußzeile kommen für alle Seiten aus `script.js`.

## Inhalte ändern

- **Texte, Bio, Geschichte:** `i18n.js` (je Sprache `de`, `en`, `fr`)
- **Releases, Cover, Hörproben:** `RELEASES` oben in `i18n.js` (Spotify-ID aus der Spotify-Adresse)
- **Kontakt-E-Mail:** `CONTACT_EMAIL` oben in `i18n.js`
- **Videos:** `VIDEOS` in `i18n.js` (YouTube-ID, Datum, Titel)
- **Jukebox:** `jukebox.html` / `jukebox.js`, Songs kommen aus `RELEASES`
- **Konzerttermine:** oben in `i18n.js` unter `CONCERTS` eintragen, z. B.
  `{ date: "2026-12-14", city: "Berlin", venue: "Wiesenburg", ticket: "https://..." }`.
  Vergangene Termine werden automatisch ausgeblendet.
- **Release-Datum für den Countdown:** `RELEASE` in `script.js`
- **Bilder:** Ordner `assets/`
- **Impressum / Datenschutz:** die rot markierten Platzhalter `[...]` in `impressum.html` und `datenschutz.html` ausfüllen
- **Schriften** liegen lokal in `assets/fonts/` (keine Verbindung zu Google Fonts)

## Lokal ansehen

```
python3 -m http.server
```

dann http://localhost:8000 öffnen. Sprache per `?lang=de|en|fr`.

## Online stellen

GitHub → Settings → Pages → Source: „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
