# Yalta Club

Website der Band Yalta Club, auf Deutsch, Englisch und Französisch.
Reines HTML/CSS/JavaScript, kein Build nötig.

## Inhalte ändern

- **Texte, Bio, Geschichte:** `i18n.js` (je Sprache `de`, `en`, `fr`)
- **Konzerttermine:** oben in `i18n.js` unter `CONCERTS` eintragen, z. B.
  `{ date: "2026-12-14", city: "Berlin", venue: "Wiesenburg", ticket: "https://..." }`.
  Vergangene Termine werden automatisch ausgeblendet.
- **Release-Datum für den Countdown:** `RELEASE` in `script.js`
- **Bilder:** Ordner `assets/`

## Lokal ansehen

```
python3 -m http.server
```

dann http://localhost:8000 öffnen. Sprache per `?lang=de|en|fr`.

## Online stellen

GitHub → Settings → Pages → Source: „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
