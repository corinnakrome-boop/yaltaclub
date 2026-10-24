// Die Jukebox: wählt Releases aus RELEASES (i18n.js) und spielt sie über den Spotify-Player.
(function () {
  const songs = RELEASES.filter((r) => r.spotify);
  const cards = document.getElementById("jb-cards");
  const record = document.getElementById("jb-record");
  const label = document.getElementById("jb-label");
  const nowTitle = document.getElementById("jb-now-title");
  const playBtn = document.getElementById("jb-play");

  let current = -1;
  let player = null;
  let loading = null;
  let playing = false;

  const uri = (r) => `spotify:${r.spotify[0]}:${r.spotify[1]}`;
  const code = (i) => "AB"[Math.floor(i / 4)] + ((i % 4) + 1);

  cards.innerHTML = songs.map((r, i) => `
    <li><button type="button" class="jb-card" data-i="${i}">
      <span class="jb-code">${code(i)}</span>
      <span class="jb-title">${r.title}</span>
      <span class="jb-year">${r.year}</span>
    </button></li>`).join("");

  function setPlaying(on) {
    playing = on;
    record.classList.toggle("is-spinning", on);
    playBtn.textContent = on ? "⏸" : "▶";
    document.body.classList.toggle("jb-on", on);
  }

  // Erster Klick lädt den Spotify-Player (Einwilligung), danach wird nur noch der Song gewechselt.
  async function ensurePlayer(r) {
    if (player) return player;
    if (!loading) {
      document.getElementById("jb-coin").hidden = true;
      document.getElementById("jb-player").hidden = false;
      loading = YCMedia.spotify(document.getElementById("jb-embed"), uri(r), 80, {
        onUpdate: (d) => setPlaying(!d.isPaused),
      });
    }
    player = await loading;
    return player;
  }

  async function select(i) {
    current = (i + songs.length) % songs.length;
    const r = songs[current];
    cards.querySelectorAll(".jb-card").forEach((b) =>
      b.classList.toggle("is-active", Number(b.dataset.i) === current));
    label.src = r.cover;
    nowTitle.removeAttribute("data-i18n");
    nowTitle.textContent = `${code(current)} · ${r.title} (${r.year})`;

    const fresh = !player;
    const p = await ensurePlayer(r);
    if (!fresh) {
      p.ctrl.loadUri(uri(r));
      p.ctrl.play();
    }
  }

  cards.addEventListener("click", (e) => {
    const b = e.target.closest(".jb-card");
    if (b) select(Number(b.dataset.i));
  });
  document.getElementById("jb-insert").addEventListener("click", () => select(Math.max(current, 0)));
  document.getElementById("jb-next").addEventListener("click", () => select(current + 1));
  document.getElementById("jb-prev").addEventListener("click", () => select(current - 1));
  playBtn.addEventListener("click", () => {
    if (!player) return select(Math.max(current, 0));
    player.ctrl.togglePlay();
  });
})();
