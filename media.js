// Sorgt dafür, dass immer nur ein Player gleichzeitig läuft:
// Startet ein Video oder Song, werden alle anderen pausiert –
// auch in anderen Fenstern/Tabs der Website (z. B. die Jukebox).
const YCMedia = (function () {
  const me = Math.random().toString(36).slice(2);
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("yc-media") : null;
  const players = new Set();

  function started(player) {
    players.forEach((p) => { if (p !== player) p.pause(); });
    if (channel) channel.postMessage({ type: "play", from: me });
  }

  if (channel) {
    channel.onmessage = (e) => {
      if (e.data && e.data.type === "play" && e.data.from !== me) players.forEach((p) => p.pause());
    };
  }

  // ---- Spotify (iFrame API, wird erst beim ersten Klick geladen) ----
  let spotifyApi;
  function loadSpotify() {
    if (!spotifyApi) {
      spotifyApi = new Promise((resolve) => {
        window.onSpotifyIframeApiReady = resolve;
        const s = document.createElement("script");
        s.src = "https://open.spotify.com/embed/iframe-api/v1";
        s.async = true;
        document.head.appendChild(s);
      });
    }
    return spotifyApi;
  }

  // Ersetzt el durch einen Spotify-Player und spielt ihn ab, sobald er bereit ist.
  async function spotify(el, uri, height, options) {
    const api = await loadSpotify();
    return new Promise((resolve) => {
      api.createController(el, { uri, width: "100%", height }, (ctrl) => {
        const player = {
          kind: "spotify",
          playing: false,
          ctrl,
          pause() { if (player.playing) ctrl.pause(); },
        };
        players.add(player);
        ctrl.addListener("playback_update", (e) => {
          const nowPlaying = !e.data.isPaused;
          if (nowPlaying && !player.playing) {
            player.playing = true;
            started(player);
          } else if (!nowPlaying) {
            player.playing = false;
          }
          if (options && options.onUpdate) options.onUpdate(e.data);
        });
        if (!options || options.autoplay !== false) {
          ctrl.addListener("ready", () => ctrl.play());
        }
        resolve(player);
      });
    });
  }

  // ---- YouTube (postMessage-Schnittstelle des eingebetteten Players) ----
  const ytPlayers = new Map();

  function youtube(iframe) {
    const send = (msg) => iframe.contentWindow && iframe.contentWindow.postMessage(JSON.stringify(msg), "*");
    const player = {
      kind: "youtube",
      playing: false,
      pause() { if (player.playing) send({ event: "command", func: "pauseVideo", args: [] }); },
    };
    players.add(player);
    iframe.addEventListener("load", () => {
      ytPlayers.set(iframe.contentWindow, player);
      // Anmelden, bis der Player antwortet (er ist nicht sofort nach dem Laden bereit)
      let tries = 0;
      const hello = setInterval(() => {
        if (player.connected || ++tries > 20) return clearInterval(hello);
        send({ event: "listening", id: iframe.id || "yt", channel: "widget" });
      }, 250);
    });
    return player;
  }

  window.addEventListener("message", (e) => {
    let host = "";
    try { host = new URL(e.origin).hostname; } catch (err) { return; }
    if (!/youtube(-nocookie)?\.com$/.test(host)) return;
    const player = ytPlayers.get(e.source);
    if (!player) return;
    player.connected = true;
    let data;
    try { data = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    let state;
    if (data.event === "onStateChange") state = data.info;
    if (data.event === "infoDelivery" && data.info && "playerState" in data.info) state = data.info.playerState;
    if (state === undefined) return;
    if (state === 1 && !player.playing) {
      player.playing = true;
      started(player);
    } else if (state !== 1 && state !== 3) {
      player.playing = false;
    }
  });

  return { spotify, youtube };
})();
