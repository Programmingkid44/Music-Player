/* =========================================================
   Data
   ========================================================= */
const songData = [
  { id: 1,  name: "Blinding Lights", artist: "The Weeknd",                  img: "images/blinding-lights.jpg", genre: "Pop",       source: "songs/blinding-lights.mp3" },
  { id: 2,  name: "Shape of You",    artist: "Ed Sheeran",                  img: "images/shape-of-you.jpg",    genre: "Pop",       source: "songs/blinding-lights.mp3" },
  { id: 3,  name: "Believer",        artist: "Imagine Dragons",             img: "images/believer.jpg",        genre: "Rock",      source: "songs/blinding-lights.mp3" },
  { id: 4,  name: "Levitating",      artist: "Dua Lipa",                    img: "images/levitating.jpg",      genre: "Disco Pop", source: "songs/blinding-lights.mp3" },
  { id: 5,  name: "Peaches",         artist: "Justin Bieber",               img: "images/peaches.jpg",         genre: "R&B",       source: "songs/blinding-lights.mp3" },
  { id: 6,  name: "On My Way",       artist: "Alan Walker",                 img: "images/on-my-way.jpg",       genre: "Electronic",source: "songs/blinding-lights.mp3" },
  { id: 7,  name: "Faded",           artist: "Alan Walker",                 img: "images/faded.jpg",           genre: "Electronic",source: "songs/blinding-lights.mp3" },
  { id: 8,  name: "Senorita",        artist: "Shawn Mendes & Camila Cabello",img: "images/senorita.jpg",       genre: "Pop",       source: "songs/blinding-lights.mp3" },
  { id: 9,  name: "Counting Stars",  artist: "OneRepublic",                 img: "images/counting-stars.jpg",  genre: "Pop Rock",  source: "songs/blinding-lights.mp3" },
  { id: 10, name: "Closer",          artist: "The Chainsmokers",            img: "images/closer.jpg",          genre: "EDM",       source: "songs/blinding-lights.mp3" },
];

/* =========================================================
   State — the single source of truth.
   The DOM is only ever a picture of this object, never storage.
   playlists: [{ id: string, name: string, songIds: number[] }]
   ========================================================= */
const STORAGE_KEY = "music-player.playlists";
const THEME_KEY = "music-player.theme";

const state = {
  genre: "All",
  currentSongId: null,
  playlists: loadPlaylists(),
  selectedPlaylistId: null,
};

function loadPlaylists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePlaylists() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.playlists));
  } catch {
    /* storage can be unavailable (private mode, quota) — the app still works */
  }
}

/* =========================================================
   Element references
   ========================================================= */
const el = {
  songs:          document.getElementById("songs-container"),
  libraryCount:   document.getElementById("library-count"),
  genreFilter:    document.getElementById("genre-filter"),
  artwork:        document.getElementById("artwork"),
  artworkImg:     document.getElementById("artwork-img"),
  name:           document.getElementById("now-playing-name"),
  artist:         document.getElementById("now-playing-artist"),
  genre:          document.getElementById("now-playing-genre"),
  audio:          document.getElementById("player-audio"),
  status:         document.getElementById("player-status"),
  prev:           document.getElementById("prev-btn"),
  next:           document.getElementById("next-btn"),
  addBtn:         document.getElementById("add-to-playlist-btn"),
  createForm:     document.getElementById("create-playlist-form"),
  playlistName:   document.getElementById("playlist-name"),
  allPlaylists:   document.getElementById("all-playlist-container"),
  currentTitle:   document.getElementById("current-playlist-title"),
  currentSongs:   document.getElementById("current-playlist-container"),
  themeToggle:    document.getElementById("theme-toggle"),
};

/* =========================================================
   Helpers
   ========================================================= */
const getSong = (id) => songData.find((s) => s.id === id) || null;
const getPlaylist = (id) => state.playlists.find((p) => p.id === id) || null;

/** The queue is whatever the listener can currently see, so Next/Previous
    stay inside the genre they filtered to. */
function getQueue() {
  return state.genre === "All"
    ? songData
    : songData.filter((s) => s.genre === state.genre);
}

function setStatus(message = "") {
  el.status.textContent = message;
}

/* =========================================================
   Rendering
   ========================================================= */
function renderGenres() {
  const genres = ["All", ...new Set(songData.map((s) => s.genre))];
  el.genreFilter.innerHTML = "";
  for (const genre of genres) {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    el.genreFilter.appendChild(option);
  }
  el.genreFilter.value = state.genre;
}

function renderLibrary() {
  const queue = getQueue();
  el.songs.innerHTML = "";
  el.libraryCount.textContent = `${queue.length} ${queue.length === 1 ? "song" : "songs"}`;

  if (queue.length === 0) {
    el.songs.appendChild(emptyState("No songs in this genre. Try another filter."));
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const song of queue) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "song-item";
    button.dataset.songId = song.id;
    button.classList.toggle("playing", song.id === state.currentSongId);
    button.setAttribute("aria-current", song.id === state.currentSongId ? "true" : "false");
    button.innerHTML = `<span><span class="item-title"></span><span class="item-sub"></span></span>`;
    button.querySelector(".item-title").textContent = song.name;
    button.querySelector(".item-sub").textContent = song.artist;
    li.appendChild(button);
    fragment.appendChild(li);
  }
  el.songs.appendChild(fragment);
}

function renderNowPlaying() {
  const song = getSong(state.currentSongId);
  const hasSong = Boolean(song);

  el.prev.disabled = !hasSong;
  el.next.disabled = !hasSong;
  el.addBtn.disabled = !hasSong;

  if (!hasSong) {
    el.name.textContent = "Nothing playing";
    el.artist.textContent = "Pick a song from the library to start";
    el.genre.hidden = true;
    el.artworkImg.hidden = true;
    el.artwork.dataset.empty = "true";
    return;
  }

  el.name.textContent = song.name;
  el.artist.textContent = song.artist;
  el.genre.textContent = song.genre;
  el.genre.hidden = false;

  // Show the cover only once it actually loads; otherwise keep the fallback.
  el.artwork.dataset.empty = "true";
  el.artworkImg.hidden = true;
  el.artworkImg.alt = `${song.name} cover art`;
  el.artworkImg.src = song.img;
}

function renderPlaylists() {
  el.allPlaylists.innerHTML = "";

  if (state.playlists.length === 0) {
    el.allPlaylists.appendChild(emptyState("No playlists yet. Create one above."));
  } else {
    const fragment = document.createDocumentFragment();
    for (const playlist of state.playlists) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "playlist-item";
      button.dataset.playlistId = playlist.id;
      button.classList.toggle("selected", playlist.id === state.selectedPlaylistId);
      button.setAttribute("aria-pressed", playlist.id === state.selectedPlaylistId ? "true" : "false");

      const title = document.createElement("span");
      title.className = "item-title";
      title.textContent = playlist.name;

      const count = document.createElement("span");
      count.className = "item-count";
      count.textContent = `${playlist.songIds.length} ♪`;

      button.append(title, count);
      li.appendChild(button);
      fragment.appendChild(li);
    }
    el.allPlaylists.appendChild(fragment);
  }

  renderCurrentPlaylist();
}

function renderCurrentPlaylist() {
  const playlist = getPlaylist(state.selectedPlaylistId);
  el.currentSongs.innerHTML = "";

  if (!playlist) {
    el.currentTitle.textContent = "No playlist selected";
    el.currentSongs.appendChild(emptyState("Select a playlist to see its songs."));
    return;
  }

  el.currentTitle.textContent = playlist.name;

  if (playlist.songIds.length === 0) {
    el.currentSongs.appendChild(emptyState("This playlist is empty. Play a song and add it."));
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const songId of playlist.songIds) {
    const song = getSong(songId);
    if (!song) continue; // a song removed from the library is skipped, not crashed on

    const li = document.createElement("li");
    li.className = "playlist-song";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = `${song.name} — ${song.artist}`;
    title.dataset.playSongId = song.id;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-btn";
    remove.dataset.removeSongId = song.id;
    remove.setAttribute("aria-label", `Remove ${song.name} from ${playlist.name}`);
    remove.textContent = "×";

    li.append(title, remove);
    fragment.appendChild(li);
  }
  el.currentSongs.appendChild(fragment);
}

function emptyState(message) {
  const li = document.createElement("li");
  li.className = "empty-state";
  li.textContent = message;
  return li;
}

/* =========================================================
   Playback
   ========================================================= */
function selectSong(songId, { autoplay = true } = {}) {
  const song = getSong(songId);
  if (!song) return;

  state.currentSongId = song.id;
  el.audio.src = song.source;
  setStatus("");

  renderNowPlaying();
  renderLibrary();

  if (!autoplay) return;
  const played = el.audio.play();
  if (played && typeof played.catch === "function") {
    // Autoplay can be blocked by the browser, or the file may be missing.
    played.catch(() => setStatus("Press play to start this track."));
  }
}

function step(offset) {
  const queue = getQueue();
  if (queue.length === 0) return;
  const index = queue.findIndex((s) => s.id === state.currentSongId);
  // (index + offset + length) % length wraps in both directions.
  const nextIndex = index === -1 ? 0 : (index + offset + queue.length) % queue.length;
  selectSong(queue[nextIndex].id);
}

/* =========================================================
   Events
   ========================================================= */
el.genreFilter.addEventListener("change", () => {
  state.genre = el.genreFilter.value;
  renderLibrary();
});

// One listener on the container handles every song row, now and in future.
el.songs.addEventListener("click", (event) => {
  const button = event.target.closest(".song-item");
  if (button) selectSong(Number(button.dataset.songId));
});

el.prev.addEventListener("click", () => step(-1));
el.next.addEventListener("click", () => step(1));
el.audio.addEventListener("ended", () => step(1));

el.audio.addEventListener("error", () => {
  if (el.audio.getAttribute("src")) {
    setStatus("This track could not be loaded. Check the file path.");
  }
});

el.artworkImg.addEventListener("load", () => {
  el.artworkImg.hidden = false;
  el.artwork.dataset.empty = "false";
});
el.artworkImg.addEventListener("error", () => {
  el.artworkImg.hidden = true;
  el.artwork.dataset.empty = "true";
});

el.createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = el.playlistName.value.trim();
  if (!name) return;

  if (state.playlists.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    el.playlistName.value = "";
    setStatus(`A playlist named "${name}" already exists.`);
    return;
  }

  const playlist = {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    songIds: [],
  };
  state.playlists.push(playlist);
  state.selectedPlaylistId = playlist.id;
  el.playlistName.value = "";
  savePlaylists();
  renderPlaylists();
});

el.allPlaylists.addEventListener("click", (event) => {
  const button = event.target.closest(".playlist-item");
  if (!button) return;
  const id = button.dataset.playlistId;
  // Clicking the selected playlist again deselects it.
  state.selectedPlaylistId = state.selectedPlaylistId === id ? null : id;
  renderPlaylists();
});

el.addBtn.addEventListener("click", () => {
  const playlist = getPlaylist(state.selectedPlaylistId);
  if (!playlist) {
    setStatus("Select a playlist first, then add the song.");
    return;
  }
  const song = getSong(state.currentSongId);
  if (!song) return;

  if (playlist.songIds.includes(song.id)) {
    setStatus(`"${song.name}" is already in ${playlist.name}.`);
    return;
  }

  playlist.songIds.push(song.id);
  savePlaylists();
  renderPlaylists();
  setStatus(`Added "${song.name}" to ${playlist.name}.`);
});

el.currentSongs.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-song-id]");
  if (remove) {
    const playlist = getPlaylist(state.selectedPlaylistId);
    if (!playlist) return;
    const songId = Number(remove.dataset.removeSongId);
    playlist.songIds = playlist.songIds.filter((id) => id !== songId);
    savePlaylists();
    renderPlaylists();
    return;
  }

  const play = event.target.closest("[data-play-song-id]");
  if (play) selectSong(Number(play.dataset.playSongId));
});

/* =========================================================
   Theme
   ========================================================= */
function applyTheme(theme) {
  const dark = theme === "dark";
  document.body.classList.toggle("dark", dark);
  el.themeToggle.setAttribute("aria-pressed", String(dark));
  el.themeToggle.querySelector(".theme-toggle-icon").textContent = dark ? "☀️" : "🌙";
  el.themeToggle.querySelector(".theme-toggle-label").textContent = dark ? "Light mode" : "Dark mode";
}

el.themeToggle.addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
});

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

/* =========================================================
   Start
   ========================================================= */
initTheme();
renderGenres();
renderLibrary();
renderNowPlaying();
renderPlaylists();
