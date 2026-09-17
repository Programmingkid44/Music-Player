const songData = [
  {
    id: 1,
    name: "Blinding Lights",
    artist: "The Weeknd",
    img: "images/blinding-lights.jpg",
    genre: "Pop",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 2,
    name: "Shape of You",
    artist: "Ed Sheeran",
    img: "images/shape-of-you.jpg",
    genre: "Pop",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 3,
    name: "Believer",
    artist: "Imagine Dragons",
    img: "images/believer.jpg",
    genre: "Rock",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 4,
    name: "Levitating",
    artist: "Dua Lipa",
    img: "images/levitating.jpg",
    genre: "Disco Pop",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 5,
    name: "Peaches",
    artist: "Justin Bieber",
    img: "images/peaches.jpg",
    genre: "R&B",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 6,
    name: "On My Way",
    artist: "Alan Walker",
    img: "images/on-my-way.jpg",
    genre: "Electronic",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 7,
    name: "Faded",
    artist: "Alan Walker",
    img: "images/faded.jpg",
    genre: "Electronic",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 8,
    name: "Senorita",
    artist: "Shawn Mendes & Camila Cabello",
    img: "images/senorita.jpg",
    genre: "Pop",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 9,
    name: "Counting Stars",
    artist: "OneRepublic",
    img: "images/counting-stars.jpg",
    genre: "Pop Rock",
    source: "songs/blinding-lights.mp3",
  },
  {
    id: 10,
    name: "Closer",
    artist: "The Chainsmokers",
    img: "images/closer.jpg",
    genre: "EDM",
    source: "songs/blinding-lights.mp3",
  },
];

// const sampleData = [
//   {
//     id: 123,
//     name: "Demo Playlist",
//     songIds: [1, 3, 5]
//   }
// ]; Solution for dynamic values in playlist can be implemented using above data structure where songIds will hold the ids of songs added to that playlist. This way we can easily manage playlists and their associated songs without relying on DOM elements for storage. We can create functions to add/remove songs from playlists and render the playlist based on the songIds array. This approach will also allow us to persist playlists across sessions if we choose to implement local storage or a backend in the future.

const songslist = document.querySelector(".songs-container");
const filter = document.getElementById("genre-filter");
const songImg = document.querySelector(".song-img");
const songName = document.querySelector(".song-name");
const songArtist = document.querySelector(".song-artist");
const audioElement = document.querySelector(".player-audio");
const listLength = songData.length;
const allPlaylist = document.querySelector(".all-playlist-container");
const playlistitems = [];
let selected_count = 0;
const songNodes = songData.map((song) => {
  const songrender = document.createElement("div");
  songrender.classList.add("song-item");
  songrender.textContent = `${song.name} - ${song.artist}`;
  songrender.id = song.id;
  songrender.source = song.source;
  songrender.addEventListener("click", () => selectSong(song.id));
  return songrender;
});

const songgenre = [...new Set(songData.map((song) => song.genre))];
songgenre.unshift("All");
for (let genre of songgenre) {
  const option = document.createElement("option");
  option.value = genre;
  option.textContent = genre;
  filter.appendChild(option);
}

function showSongs() {
  songslist.innerHTML = "";
  const nodesToShow =
    filter.value === "All"
      ? songNodes
      : songNodes.filter((node) => {
          const song = songData.find((s) => s.id === Number(node.id));
          return song && song.genre === filter.value;
        });
  songslist.append(...nodesToShow);
}

function selectSong(songId) {
  const song = songData.find((item) => item.id === songId);
  const songIndex = songData.findIndex((item) => item.id === songId);
  if (!song) return;

  songImg.src = song.img;
  songImg.alt = song.name;
  songName.textContent = song.name;
  songArtist.textContent = song.artist;
  audioElement.id = song.id;
  audioElement.src = song.source;
  audioElement.volume = 0;
  audioElement.play();
}

audioElement.addEventListener("ended", () => {
  const currentSource = audioElement.id;
  const currentIndex = songData.findIndex((song) => song.id === currentSource);
  if (currentIndex < listLength - 1) {
    selectSong(songData[currentIndex + 1].id);
  } else {
    selectSong(songData[0].id);
  }
});

function createPlaylist(name) {
  const playlist = document.createElement("div");
  playlist.classList.add("playlist-item");
  playlist.id = playlistitems.length + 1;
  playlist.textContent = name;
  playlist.songIds = [];
  playlistitems.push(playlist);
  playlist.addEventListener("click", () => selectPlaylist(playlist));
  allPlaylist.append(...playlistitems);
}

document.getElementById("create-playlist-btn").addEventListener("click", () => {
  const playlistName = document.getElementById("playlist-name").value;
  if (playlistName) {
    createPlaylist(playlistName);
    document.getElementById("playlist-name").value = "";
  }
});

document.querySelector(".Next").addEventListener("click", () => {
  let currentSong = songData.find((node) => {
    // console.log(node, audioElement);
    return node.id.toString() === audioElement.id;
  });
  // console.log({ currentSong, id:audioElement.id});
  const currentIndex = songData.findIndex((song) => {
    // console.log(song,currentSong?.id)
    return song.id === currentSong.id;
  });
  // console.log(song.source);
  // console.log(currentSource);
  // console.log(currentIndex);
  if (currentIndex < listLength - 1) {
    selectSong(songData[currentIndex + 1].id);
  } else {
    selectSong(songData[0].id);
  }
});

document.querySelector(".Previous").addEventListener("click", () => {
  let currentSong = songData.find((node) => {
    // console.log(node, audioElement);
    return node.id.toString() === audioElement.id;
  });
  // console.log({ currentSong, id:audioElement.id});
  const currentIndex = songData.findIndex((song) => {
    // console.log(song,currentSong?.id)
    return song.id === currentSong.id;
  });
  // console.log(song.source);
  // console.log(currentSource);
  // console.log(currentIndex);
  if (currentIndex > 0) {
    selectSong(songData[currentIndex - 1].id);
  } else {
    selectSong(songData[listLength - 1].id);
  }
});
filter.addEventListener("change", showSongs);
showSongs();

document.getElementById("create-playlist-btn").addEventListener("click", () => {
  const playlistName = document.getElementById("playlist-name").value;
  if (playlistName) {
    createPlaylist(playlistName);
    document.getElementById("playlist-name").value = "";
  }
});

function selectPlaylist() {
  if (selected_count == 1) {
    allPlaylist
      .querySelector(".playlist-item.selected")
      .classList.remove("selected");
    selected_count--;
    // console.log(selected_count);
    // collectplaylistinfo();
    playlist.classList.add("selected");
    selected_count++;
  } else {
    playlist.classList.add("selected");
    selected_count++;
    // console.log(selected_count);
  }
  playlistRender();
}

function addToPlaylist() {
  const selectedPlaylist = document.querySelector(
    ".playlist-item.selected",
  );
  const currentPlaylist = document.querySelector(".current-playlist-container");
  if (selectedPlaylist) {
    const currentSongId = audioElement.id;
    const song = songData.find((s) => {
      // console.log(s.id);
      // console.log(currentSongId);
      return s.id.toString() === currentSongId;
    });
    if (song) {
      const playlistSongItem = document.createElement("div");
      playlistSongItem.textContent = `${song.name} - ${song.artist}`;
      // playlistSongItem.id = selectedPlaylist.id;
      playlistSongItem.songId = audioElement.id;
      // playlistSongItem.classList.add("id-" + selectedPlaylist.id);
      // console.log(playlistSongItem);
      // console.log(playlistSongItem.songId);
      currentPlaylist.appendChild(playlistSongItem);
      collectplaylistinfo();
    }
    else {
      alert("No song is currently playing.");
    }
  } else {
    alert("Please select a playlist to add the song.");
  }
}

function playlistRender() {
  const selectedPlaylist = document.querySelector(
    ".playlist-item.selected",
  );
  const currentPlaylist = document.querySelector(".current-playlist-container");
  if (selectedPlaylist) {
    currentPlaylist.innerHTML = "";
    // const playlistSongs = document.querySelectorAll(
    //   `.id-${selectedPlaylist.id}`
    // );
    const index = playlistitems.findIndex((item) => item.id === selectedPlaylist.id);
    if (index !== -1) {
      const tempPlaylist = playlistitems[index];
      const songIds = tempPlaylist.songIds || [];
      const playlistSongs = songIds.map((songId) => {
        const song = songData.find((s) => { 
          console.log(s.id, songId);
          return s.id === Number(songId); });
          console.log(song);
        const playlistSongItem = document.createElement("div");
        playlistSongItem.textContent = `${song.name} - ${song.artist}`;
        playlistSongItem.songId = song.id;
        return playlistSongItem;
      });
  currentPlaylist.append(...playlistSongs);
  }
}
}

function collectplaylistinfo() {
  const currentPlaylist = document.querySelector(".current-playlist-container");
  const selectedPlaylist = document.querySelector(
    ".playlist-item.selected",
  );
  const playlistSongs = currentPlaylist.querySelectorAll("div");
  const songIds = Array.from(playlistSongs).map((song) => song.songId);
  const index = playlistitems.findIndex((item) => item.id === selectedPlaylist.id);
  if (index !== -1) {
    const tempPlaylist = playlistitems[index];
    // tempPlaylist.innerHTML = "";
    // tempPlaylist.append(...playlistSongs);
    tempPlaylist.songIds = songIds;
    playlistitems[index] = tempPlaylist;
  } 
}
document.querySelector(".add-to-playlist").addEventListener("click", addToPlaylist);

// Dark theme toggle functionality
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});
