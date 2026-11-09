const STORAGE_KEY = "music-request-demo-v2";
const adminList = document.getElementById("adminList");
const emptyState = document.getElementById("emptyState");
const count = document.getElementById("requestCount");

function getSongs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}
function statusLabel(status) {
  if (status === "done") return ["✓ เพิ่มแล้ว", "done"];
  if (status === "rejected") return ["✕ ไม่รับ", "rejected"];
  return ["◷ รอคิว", "pending"];
}
function updateStatus(id, status) {
  const songs = getSongs().map(song =>
    song.id === id ? { ...song, status } : song
  );
  saveSongs(songs);
  render();
}
function deleteSong(id) {
  const song = getSongs().find(item => item.id === id);
  if (!song) return;
  const confirmed = window.confirm(`ต้องการลบคำขอเพลง “${song.title}” ใช่หรือไม่?`);
  if (!confirmed) return;
  saveSongs(getSongs().filter(item => item.id !== id));
  render();
}

function render() {
  const songs = getSongs();
  adminList.replaceChildren();
  count.textContent = `${songs.length} รายการ`;
  emptyState.hidden = songs.length !== 0;

  songs.forEach((song, index) => {
    const row = document.createElement("div");
    row.className = "admin-row";

    const number = document.createElement("span");
    number.textContent = index + 1;

    const info = document.createElement("div");
    info.className = "admin-song";
    info.append(document.createTextNode(song.title));
    const artist = document.createElement("small");
    artist.textContent = song.artist;
    const requester = document.createElement("small");
    requester.className = "requester-name";
    requester.textContent = `ผู้ขอ: ${song.username || "ไม่ระบุ"}`;
    info.append(artist, requester);

    const badge = document.createElement("span");
    const [text, cls] = statusLabel(song.status);
    badge.className = `status ${cls}`;
    badge.textContent = text;

    const actions = document.createElement("div");
    actions.className = "admin-actions";
    const yes = document.createElement("button");
    yes.className = "approve";
    yes.textContent = "✓";
    yes.title = "ยืนยันว่าเพิ่มเพลงแล้ว";
    yes.addEventListener("click", () => updateStatus(song.id, "done"));

    const no = document.createElement("button");
    no.className = "reject";
    no.textContent = "×";
    no.title = "ปฏิเสธคำขอ";
    no.setAttribute("aria-label", `ปฏิเสธ ${song.title}`);
    no.addEventListener("click", () => updateStatus(song.id, "rejected"));

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "🗑";
    del.title = "ลบคำขอนี้ออกจากรายการ";
    del.setAttribute("aria-label", `ลบ ${song.title}`);
    del.addEventListener("click", () => deleteSong(song.id));

    actions.append(yes, no, del);
    row.append(number, info, badge, actions);
    adminList.appendChild(row);
  });
}
window.addEventListener("storage", render);
render();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Peetkung";

(() => {
    if (document.getElementById("admin-login-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "admin-login-overlay";
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #dff3ff, #ffe4f1);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
    `;

    overlay.innerHTML = `
        <form id="admin-login-form" style="
            background: white;
            padding: 30px;
            border-radius: 20px;
            width: 340px;
            max-width: 100%;
            box-sizing: border-box;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0,0,0,.12);
        ">
            <h2>🔐 Admin Login</h2>
            <p>กรุณาเข้าสู่ระบบแอดมิน</p>

            <label for="admin-login-username"
                style="display:block;text-align:left;margin-top:12px;">
                ชื่อผู้ใช้แอดมิน
            </label>
            <input id="admin-login-username" type="text"
                autocomplete="username" required placeholder="ชื่อผู้ใช้"
                style="display:block;width:100%;box-sizing:border-box;
                padding:12px;margin:8px 0;border:1px solid #cbd5e1;
                border-radius:10px;">

            <label for="admin-login-password"
                style="display:block;text-align:left;margin-top:12px;">
                รหัสผ่าน
            </label>

            <div style="position:relative;width:100%;">
                <input id="admin-login-password" type="password"
                    autocomplete="current-password" required
                    placeholder="รหัสผ่าน"
                    style="display:block;width:100%;box-sizing:border-box;
                    padding:12px 48px 12px 12px;
                    border:1px solid #cbd5e1;border-radius:10px;">

                <button id="admin-toggle-password" type="button"
                    aria-label="แสดงรหัสผ่าน"
                    title="แสดง/ซ่อนรหัสผ่าน"
                    style="position:absolute;right:8px;top:50%;
                    transform:translateY(-50%);border:0;background:transparent;
                    cursor:pointer;font-size:20px;padding:5px;">
                    👁️
                </button>
            </div>

            <button type="submit" style="
                width:100%;padding:12px;margin-top:18px;border:0;
                border-radius:10px;background:#8dcfff;
                color:#17324d;font-weight:bold;cursor:pointer;">
                เข้าสู่ระบบ
            </button>

            <p id="admin-login-error" role="alert"
                style="color:#dc2626;min-height:20px;"></p>
        </form>
    `;

    document.body.appendChild(overlay);

    const form = document.getElementById("admin-login-form");
    const usernameInput = document.getElementById("admin-login-username");
    const passwordInput = document.getElementById("admin-login-password");
    const toggleButton = document.getElementById("admin-toggle-password");
    const error = document.getElementById("admin-login-error");

    // ปุ่มรูปตา: สลับระหว่างซ่อนและแสดงรหัสผ่าน
    toggleButton.addEventListener("click", () => {
        const willShow = passwordInput.type === "password";
        passwordInput.type = willShow ? "text" : "password";
        toggleButton.textContent = willShow ? "🙈" : "👁️";
        toggleButton.setAttribute(
            "aria-label",
            willShow ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
        );
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (
            usernameInput.value.trim() === ADMIN_USERNAME &&
            passwordInput.value === ADMIN_PASSWORD
        ) {
            overlay.remove();
        } else {
            error.textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
            passwordInput.value = "";
            passwordInput.type = "password";
            toggleButton.textContent = "👁️";
            passwordInput.focus();
        }
    });
})();
