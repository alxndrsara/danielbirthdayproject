document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     DATA
  ========================== */

  // 1) MESSAGES: urutan tetap sesuai array ini
  // text 1 kalimat, audio mp3/m4a
  const MESSAGES = [
    { side: "left",  name: "Oriana", text: "Happy birthday Danil!", audio: "audio/1-oriana.mp3" },
    { side: "left",  name: "Viarosita", text: "WOYYYY NILLL",     audio: "audio/2-via.mp3" },
    { side: "right", name: "Sara",     text: "Happy birthday dari kita semuaaa<3" },
	{ side: "left",  name: "Deshinta", text: "Selamat ulang tahun ke-25 daniel!",     audio: "audio/3-deshinta.mp3" },
	{ side: "left",  name: "Faris", text: "Happy birthday Bang Daniel!",     audio: "audio/4-faris.mp3" },
	{ side: "right", name: "Sara",     text: "IYA ITU FARIS AKU PAKSA WKWKWKW" },
	{ side: "right", name: "Sara",     text: "Tunggu yaaa masih ada lagii" },
	{ side: "left",  name: "Danilo", text: "EYYYY ada yang ulang tahun nii",     audio: "audio/5-danilo.mp3" },
	{ side: "left",  name: "Abdiel", text: "HEPI BERTDEY BRADER",     audio: "audio/6-abdiel.mp3" },
	{ side: "right", name: "Sara",     text: "WKWKWKWKWKWKW" },
	{ side: "left",  name: "Fitri", text: "happy birthday bang daniel!:D",     audio: "audio/7-fitri.mp3" },
	{ side: "left",  name: "Anet", text: "BUEN CUMPLEANOS DANIEL",     audio: "audio/8-anet.mp3" },
	{ side: "right", name: "Sara",     text: "....ya intinya dia bilang selamat ulang tahun WKWKWK" },
	{ side: "right", name: "Sara",     text: "masih ada lagiii wait" },
	{ side: "left",  name: "Septi", text: "buat bonji aka bonge aka danil",     audio: "audio/9-septi.mp3" },
	{ side: "left",  name: "Kezia", text: "I don't say happy birthday, but I pray for you",     audio: "audio/10-kezia.mp3" },
	{ side: "right", name: "Sara",     text: "Kamu disayang nil, ga cuma sama aku aja, tapi orang orang disekitar kamu juga :D" },
	{ side: "left",  name: "Paksi", text: "Halo assalamualaikum WKWKWKWK",     audio: "audio/11-paksi.mp3" },  
    // ... sampai 17 nanti
  ];

  // 2) GALLERY
  const GALLERY = [
    { src: "images/image1.jpg", title: "Momen 1", desc: "Tulis deskripsi foto di sini." },
    { src: "assets/images/foto2.jpg", title: "Momen 2", desc: "Tulis deskripsi foto di sini." },
    { src: "assets/images/foto3.jpg", title: "Momen 3", desc: "Tulis deskripsi foto di sini." },
  ];

  // 3) NOTES
  const NOTES = [
    {
      title: "Hari ini",
      date: "24 Desember 2025",
      content:
`Hari ini kamu nambah umur.
Jujur, aku seneng dunia ini punya kamu lebih lama.

Hari ini kamu dirayain, 
bukan karena apa yang kamu capai,
tapi karena kamu ada.
`
    },
    {
      title: "Disclaimer",
      date: "16 Desember 2025",
      content:
`Aku sebenernya pengen beliin kamu kado,
yang bisa kamu pegang, yang bisa kamu pamerin.

Tapi duitku dah habis WKWKWKW, 
jadi aku bikin ini,
karena yang aku punya sekarang cuma waktu. 

aku buat ini bukan karena aku jago ngoding dan kreatif (meskipun emang iya),
tapi ini karena aku gamau hari ulang tahun kamu lewat biasa aja.

Kalau aku bisa ngasih kamu satu hal, apa aja, aku pengen kamu tau kalau
kamu penting.
`
    },
	{
      title: "1 lagi deh janji",
      date: "16 Desember 2025",
      content:
`Selamat ulang tahun iyah danil.

Kamu keren.
aku bangga.
sisanya nanti aja, males ngetik,
kamu juga males baca kan.
`
    },  
  ];

  /* =========================
     NAVIGASI SCREEN
  ========================== */
  const screens = ["home", "messages", "gallery", "notes"];
  const screenEls = new Map(screens.map(id => [id, document.getElementById(id)]));

  let messagesAnimatedOnce = false;   // sanimasi cuma sekali per sesi
  let messagesAnimToken = 0;          // cancel token 

  function openScreen(id){
    screens.forEach(s => {
      const el = screenEls.get(s);
      if (!el) return;
      el.classList.toggle("active", s === id);
    });

    if (id === "messages") {
      if (!messagesAnimatedOnce) {
        messagesAnimatedOnce = true;
        runMessagesIntroAnimation();
      } else {
        renderChatInstant();
      }
    }

    if (id === "gallery") {
      renderGallery(); // dipanggil berulang
    }

    if (id === "notes") {
      renderNotesList(); // balik ke list setiap buka Notes
    }
  }

  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openScreen(btn.dataset.open));
  });
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => openScreen("home"));
  });

  /* =========================
     HOME CLOCK realtime
  ========================== */
  const homeTime = document.getElementById("homeTime");
  const homeDate = document.getElementById("homeDate");

  const pad2 = (n) => String(n).padStart(2, "0");
  function renderClock(){
    const now = new Date();
    if (homeTime) homeTime.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    if (homeDate) {
      const dateStr = new Intl.DateTimeFormat("id-ID", {
        weekday: "long", day: "numeric", month: "long"
      }).format(now);
      homeDate.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
  }
  renderClock();
  setInterval(renderClock, 1000);

  /* =========================
     MESSAGES: render + audio player
  ========================== */
  const chatEl = document.getElementById("chat");
  const hintEl = document.getElementById("messagesHint");

  const player = document.getElementById("player");

  // active UI refs (1 global audio player controlling one message at a time)
  let active = {
    msgId: null,
    btn: null,
    range: null,
    cur: null,
    dur: null,
  };

  function formatTime(sec){
    if (!Number.isFinite(sec)) return "--:--";
    sec = Math.max(0, sec);
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function setRangeProgress(range){
    if (!range) return;
    const max = Number(range.max || 0);
    const val = Number(range.value || 0);
    const p = max > 0 ? (val / max) * 100 : 0;
    range.style.setProperty("--p", `${p}%`);
  }

  function resetActiveUI(){
    if (active.btn) active.btn.textContent = "▶";
  }

  // Player events
  if (player) {
    player.addEventListener("loadedmetadata", () => {
      if (!active.range) return;
      active.range.max = String(player.duration || 0);
      if (active.dur) active.dur.textContent = formatTime(player.duration);
      setRangeProgress(active.range);
    });

    player.addEventListener("timeupdate", () => {
      if (!active.range) return;
      active.range.value = String(player.currentTime || 0);
      if (active.cur) active.cur.textContent = formatTime(player.currentTime);
      setRangeProgress(active.range);
    });

    player.addEventListener("ended", () => {
      if (active.btn) active.btn.textContent = "▶";
    });
  }

  function createMessageNode(m, idx){
    const msgId = `m${idx}`;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${m.side}`;
    bubble.dataset.msgid = msgId;

    const meta = document.createElement("div");
meta.className = "meta";

// avatar inisial
const avatar = document.createElement("span");
avatar.className = "avatar";
avatar.textContent = initialFromName(m.name);
avatar.style.background = colorFromName(m.name);

// nama
const nameSpan = document.createElement("span");
nameSpan.textContent = m.name || "";

meta.appendChild(avatar);
meta.appendChild(nameSpan);

bubble.appendChild(meta);

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = m.text || "";
    bubble.appendChild(text);

    if (m.audio){
      // container player
      const wrap = document.createElement("div");
      wrap.className = "audio-player";

      const row = document.createElement("div");
      row.className = "audio-row";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "audio-btn";
      btn.textContent = "▶";
      btn.dataset.audio = m.audio;
      btn.dataset.msgid = msgId;

      const range = document.createElement("input");
      range.type = "range";
      range.className = "wave";
      range.min = "0";
      range.max = "0";
      range.value = "0";
      range.dataset.msgid = msgId;

      row.appendChild(btn);
      row.appendChild(range);

      const meta2 = document.createElement("div");
      meta2.className = "audio-meta";

      const cur = document.createElement("span");
      cur.className = "time current";
      cur.textContent = "0:00";

      const dur = document.createElement("span");
      dur.className = "time duration";
      dur.textContent = "--:--";

      meta2.appendChild(cur);
      meta2.appendChild(dur);

      wrap.appendChild(row);
      wrap.appendChild(meta2);

      // simpan refs ke elemen (biar gampang bind)
      wrap._controls = { msgId, btn, range, cur, dur };

      bubble.appendChild(wrap);
    }

    return bubble;
  }

  function renderChatInstant(){
    if (!chatEl) return;
    chatEl.innerHTML = "";
    MESSAGES.forEach((m, idx) => chatEl.appendChild(createMessageNode(m, idx)));
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  // "ding" notif (tanpa file tambahan)
  let audioCtx = null;

function ensureAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  // resume kalau suspended
  if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
  return audioCtx;
}

// Ding untuk chat masuk (lebih tinggi & pendek)
function chatDing(){
  try{
    const ctx = ensureAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.06);

    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.20);
  } catch {}
}

// Ding untuk toast notif (lebih rendah lebih lama dikit)
function toastDing(){
  try{
    const ctx = ensureAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "triangle";
    o.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    o.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.10); // E5

    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.13, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.30);
  } catch {}
}



  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  async function runMessagesIntroAnimation(){
    if (!chatEl) return;

    const token = ++messagesAnimToken;
    chatEl.innerHTML = "";
    if (hintEl) hintEl.style.display = "block";

    for (let i = 0; i < MESSAGES.length; i++){
      if (token !== messagesAnimToken) return;

      await sleep(rand(420, 1200));
      if (token !== messagesAnimToken) return;

      const node = createMessageNode(MESSAGES[i], i);
      node.classList.add("appear");
      chatEl.appendChild(node);
      chatEl.scrollTop = chatEl.scrollHeight;

      chatDing();
    }
  }

  // Seekbar drag (input event)
  document.addEventListener("input", (e) => {
    const range = e.target.closest(".wave");
    if (!range || !player) return;

    // update progress visual always
    setRangeProgress(range);

    // kalau range yang aktif, set currentTime
    const msgId = range.dataset.msgid;
    if (msgId && msgId === active.msgId) {
      player.currentTime = Number(range.value || 0);
    }
  });

  // Play/pause click
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".audio-btn");
    if (!btn || !player) return;

    const audioSrc = btn.dataset.audio;
    const msgId = btn.dataset.msgid;
    if (!audioSrc || !msgId) return;

    const bubble = btn.closest(".bubble");
    const wrap = bubble?.querySelector(".audio-player");
    const c = wrap?._controls;
    if (!c) return;

    // pindah active message
    if (active.msgId && active.msgId !== msgId) resetActiveUI();

    active = { msgId, btn: c.btn, range: c.range, cur: c.cur, dur: c.dur };

    const abs = new URL(audioSrc, location.href).href;
    const sameSrc = (player.src === abs);

    try {
      // toggle pause jika lagi play dan src sama
      if (sameSrc && !player.paused) {
        player.pause();
        btn.textContent = "▶";
        return;
      }

      // set src kalau beda
      if (!sameSrc) {
        player.src = audioSrc;
        // reset UI for new source
        c.range.value = "0";
        c.range.max = "0";
        c.cur.textContent = "0:00";
        c.dur.textContent = "--:--";
        setRangeProgress(c.range);
      }

      // sebelum play: kalau sudah drag seekbar di message ini, mulai dari situ
      const desiredStart = Number(c.range.value || 0);
      if (Number.isFinite(desiredStart) && desiredStart > 0) {
        player.currentTime = desiredStart;
      }

      await player.play();
      btn.textContent = "⏸";

      // kalau metadata sudah kebaca cepat, set duration
      if (Number.isFinite(player.duration) && player.duration > 0) {
        c.range.max = String(player.duration);
        c.dur.textContent = formatTime(player.duration);
        setRangeProgress(c.range);
      }
    } catch (err) {
      alert("Audio tidak bisa diputar. Pastikan format MP3/M4A.");
      console.error(err);
    }
  });

  /* =========================
     GALLERY: grid + modal (scrollable)
  ========================== */
  const galleryGrid = document.getElementById("galleryGrid");
  const modal = document.getElementById("galleryModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalClose = document.getElementById("modalClose");

  let galleryRenderedOnce = false;

  function renderGallery(){
    if (!galleryGrid) return;
    if (galleryRenderedOnce) return;
    galleryRenderedOnce = true;

    galleryGrid.innerHTML = "";
    for (const item of GALLERY){
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title || "Photo";
      img.loading = "lazy";

      img.addEventListener("click", () => {
        if (!modal) return;
        if (modalImg) modalImg.src = item.src;
        if (modalTitle) modalTitle.textContent = item.title || "Photo";
        if (modalDesc) modalDesc.textContent = item.desc || "";
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
      });

      galleryGrid.appendChild(img);
    }
  }

  function closeModal(){
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (modalImg) modalImg.src = "";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  /* =========================
     NOTES: multi notes (list -> detail)
  ========================== */
  const notesContainer = document.querySelector("#notes .notes");

  function renderNotesList(){
    if (!notesContainer) return;

    notesContainer.innerHTML = `
      <div class="notes-list">
        ${NOTES.map((n, i) => `
          <button class="note-card" type="button" data-note-index="${i}">
            <div class="note-card-title">${escapeHtml(n.title)}</div>
            <div class="note-card-date">${escapeHtml(n.date || "")}</div>
            <div class="note-card-preview">${escapeHtml(previewText(n.content, 90))}</div>
          </button>
        `).join("")}
      </div>
    `;
  }

  function openNoteDetail(index){
    const n = NOTES[index];
    if (!n || !notesContainer) return;

    notesContainer.innerHTML = `
      <div class="note-detail">
        <button class="note-inner-back" type="button" data-notes-list>← Notes</button>
        <div class="note note-app">
          <div class="note-top">
            <div class="note-title">${escapeHtml(n.title)}</div>
            <div class="note-date">${escapeHtml(n.date || "")}</div>
          </div>
          <div class="note-content">${escapeHtml(n.content)}</div>
        </div>
      </div>
    `;
  }

  // notes click handlers (delegation)
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-note-index]");
    if (card) {
      const idx = Number(card.dataset.noteIndex);
      openNoteDetail(idx);
      return;
    }

    const back = e.target.closest("[data-notes-list]");
    if (back) {
      renderNotesList();
      return;
    }
  });

  function previewText(s, n){
    const t = (s || "").replace(/\s+/g, " ").trim();
    return t.length > n ? (t.slice(0, n) + "…") : t;
  }

  function escapeHtml(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  /* =========================
     INIT (biar halaman awal rapi)
  ========================== */
  // render notes list siap-siap (tidak langsung tampil kalau masih di home)
  renderNotesList();
  // gallery akan dirender saat buka gallery pertama kali

/* =========================
   HOME WIDGETS: Calendar realtime
========================= */
const calMonthEl = document.getElementById("calMonth");
const calTodayTextEl = document.getElementById("calTodayText");
const calGridEl = document.getElementById("calGrid");

function renderCalendar(date = new Date()){
  if (!calGridEl) return;

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const today = date.getDate();

  const monthName = new Intl.DateTimeFormat("id-ID", { month:"long", year:"numeric" }).format(date);
  if (calMonthEl) calMonthEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const todayText = new Intl.DateTimeFormat("id-ID", { weekday:"long", day:"numeric" }).format(date);
  if (calTodayTextEl) calTodayTextEl.textContent = todayText.charAt(0).toUpperCase() + todayText.slice(1);

  // hitung hari pertama bulan ini (Senin sebagai kolom 1)
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // JS: getDay() -> Minggu=0 ... Sabtu=6
  // kita mau Senin=0 ... Minggu=6
  const startIndex = (firstDay.getDay() + 6) % 7;

  calGridEl.innerHTML = "";

  // total cell: 42 (6 minggu)
  const totalCells = 42;
  for (let i = 0; i < totalCells; i++){
    const cell = document.createElement("div");
    cell.className = "cal-cell";

    const dayNum = i - startIndex + 1;
    if (dayNum < 1 || dayNum > daysInMonth){
      cell.classList.add("muted");
      cell.textContent = "";
    } else {
      cell.textContent = String(dayNum);
      if (dayNum === today) cell.classList.add("today");
    }
    calGridEl.appendChild(cell);
  }
}

renderCalendar();
// Update tiap menit (buat ganti hari pas tengah malam pun aman)
setInterval(() => renderCalendar(new Date()), 60 * 1000);

/* =========================
   HOME NOTIF
========================= */
const toastEl = document.getElementById("toast");
const badgeEl = document.getElementById("messagesBadge");

let unreadCount = 3;
let stopHomeNotifs = false;
let notifIntervalId = null;
let audioUnlocked = false;

function setBadge(n){
  if (!badgeEl) return;
  if (n <= 0){
    badgeEl.style.display = "none";
  } else {
    badgeEl.style.display = "grid";
    badgeEl.textContent = String(n);
  }
}
setBadge(unreadCount);

function isHomeActive(){
  const home = screenEls.get("home");
  return !!home && home.classList.contains("active");
}

function showToast(){
  if (!toastEl) return;
  toastEl.classList.remove("show");
  void toastEl.offsetWidth; // restart anim
  toastEl.classList.add("show");
  toastEl.setAttribute("aria-hidden", "false");
}

function startHomeNotifs(){
  if (notifIntervalId) return;

  // Muncul langsung saat app dibuka (kalau sedang di Home)
  if (!stopHomeNotifs && isHomeActive()){
    showToast();
    // sound hanya kalau sudah unlock
    if (audioUnlocked) toastDing();
  }

  notifIntervalId = setInterval(() => {
    if (stopHomeNotifs) return;
    if (!isHomeActive()) return; // cuma tampil di Home

    showToast();
    if (audioUnlocked) toastDing();

    unreadCount += 1;
    setBadge(unreadCount);
  }, 5000);
}

function stopHomeNotifsForeverThisSession(){
  stopHomeNotifs = true;
  if (notifIntervalId){
    clearInterval(notifIntervalId);
    notifIntervalId = null;
  }
  if (toastEl) toastEl.classList.remove("show");
}

// Mulai interval, tapi sound/toast baru aktif setelah audioUnlocked = true
startHomeNotifs();

// Unlock audio saat user pertama kali tap di mana saja
window.addEventListener("pointerdown", () => {
  try {
    ensureAudio();
    audioUnlocked = true;
  } catch {}
}, { once: true });

// Stop notif + clear badge saat user buka Messages pertama kali
document.querySelectorAll('[data-open="messages"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    stopHomeNotifsForeverThisSession();
    unreadCount = 0;
    setBadge(unreadCount);
  }, { once: true });
});

function initialFromName(name){
  const t = String(name || "").trim();
  if (!t) return "?";
  return t[0].toUpperCase();
}

// warna pastel “satu tone” (pilih dari palette)
const AVATAR_COLORS = ["#b7d5ec", "#cfe5f6", "#f3dbe0", "#f1d7dd", "#d9e9d6", "#f5e7c8"];

function colorFromName(name){
  const s = String(name || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

});


