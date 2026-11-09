const STORAGE_KEY = "music-request-demo-v2";
const queueList = document.getElementById("queueList");
const emptyState = document.getElementById("emptyState");
const count = document.getElementById("requestCount");
const notice = document.getElementById("notice");

function getSongs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}
function label(status) {
  if (status === "done") return ["✓ เพิ่มแล้ว", "done"];
  if (status === "rejected") return ["✕ ไม่รับ", "rejected"];
  return ["◷ รอคิว", "pending"];
}
function renderQueue() {
  const songs = getSongs();
  queueList.replaceChildren();
  count.textContent = `${songs.length} รายการ`;
  emptyState.hidden = songs.length !== 0;

  songs.forEach((song, index) => {
    const row = document.createElement("div");
    row.className = "queue-item";
    const num = document.createElement("span");
    num.className = "number";
    num.textContent = index + 1;
    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "song-name";
    name.textContent = song.title;
    const artist = document.createElement("div");
    artist.className = "artist-name";
    artist.textContent = song.artist;
    const requester = document.createElement("div");
    requester.className = "requester-name";
    requester.textContent = `ผู้ขอ: ${song.username || "ไม่ระบุ"}`;
    info.append(name, artist, requester);
    const badge = document.createElement("span");
    const [text, cls] = label(song.status);
    badge.className = `status ${cls}`;
    badge.textContent = text;
    row.append(num, info, badge);
    queueList.appendChild(row);
  });
}

document.getElementById("requestForm").addEventListener("submit", event => {
  event.preventDefault();
  const userInput = document.getElementById("userInput");
  const titleInput = document.getElementById("songInput");
  const artistInput = document.getElementById("artistInput");
  const username = userInput.value.trim();
  const title = titleInput.value.trim();
  const artist = artistInput.value.trim();
  if (!username || !title || !artist) return;

  const songs = getSongs();
  songs.push({ id: Date.now(), username, title, artist, status: "pending" });
  saveSongs(songs);
  renderQueue();
  event.target.reset();
  notice.textContent = "ส่งคำขอเพลงแล้ว 🎵";
});

window.addEventListener("storage", renderQueue);
renderQueue();
