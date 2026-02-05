// ------------------- Screen + login state -------------------
const loginScreenEl = document.getElementById("loginScreen");
const appScreenEl = document.getElementById("appScreen");
const loginUserEl = document.getElementById("loginUser");
const loginErrEl = document.getElementById("loginErr");
const currentUserLabelEl = document.getElementById("currentUserLabel");

let loggedInUser = null;

// ------------------- App DOM -------------------
const convListEl = document.getElementById("convList");
const userListEl = document.getElementById("userList");
const msgsEl = document.getElementById("msgs");
const errEl = document.getElementById("err");
const chatTitleEl = document.getElementById("chatTitle");
const chatSubEl = document.getElementById("chatSub");

// ------------------- App state -------------------
let activeConversationId = null;
let conversations = [];
let users = [];

// polling
let pollTimer = null;
let pollInFlight = false;
const POLL_MS = 2000;

// ------------------- Helpers -------------------
function setLoginError(msg) {
  loginErrEl.textContent = msg || "";
}

function setError(msg) {
  errEl.textContent = msg || "";
}

function currentUser() {
  return loggedInUser;
}

function escape(s) {
  return (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function api(url, options = {}) {
  options.headers = options.headers || {};
  if (!currentUser()) throw new Error("Not logged in");

  options.headers["X-User"] = currentUser();

  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) throw new Error(json && json.message ? json.message : text);
  return json;
}

// ------------------- Screen switching -------------------
function showLogin() {
  stopPolling();
  loggedInUser = null;
  localStorage.removeItem("qc_user");

  setLoginError("");
  setError("");

  if (loginUserEl) loginUserEl.value = "";

  loginScreenEl.classList.add("show");
  appScreenEl.classList.remove("show");
}

function showApp(username) {
  loggedInUser = username;
  localStorage.setItem("qc_user", username);

  currentUserLabelEl.textContent = username;

  loginScreenEl.classList.remove("show");
  appScreenEl.classList.add("show");

  // load initial data
  loadUsers();
  loadConversations();
}

// ------------------- Polling -------------------
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  pollInFlight = false;
}

function startPolling() {
  stopPolling();
  if (!activeConversationId) return;

  pollTimer = setInterval(async () => {
    if (pollInFlight) return;
    pollInFlight = true;
    try {
      await loadMessages();
    } finally {
      pollInFlight = false;
    }
  }, POLL_MS);
}

// ------------------- Users list -------------------
async function loadUsers() {
  // optional feature - don't block app if it fails
  try {
    users = await api("/api/users");
    renderUsers();
  } catch {
    // ignore
  }
}

function renderUsers() {
  if (!userListEl) return;

  userListEl.innerHTML = "";
  const me = (currentUser() || "").toLowerCase();

  const filtered = (users || []).filter((u) => (u || "").toLowerCase() !== me);

  if (filtered.length === 0) {
    userListEl.innerHTML = "<div class='small'>No other users yet.</div>";
    return;
  }

  filtered.forEach((u) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<b>${escape(u)}</b>`;
    div.onclick = () => startDirectChat(u);
    userListEl.appendChild(div);
  });
}

// ------------------- Conversations -------------------
async function loadConversations() {
  setError("");
  stopPolling();

  activeConversationId = null;
  msgsEl.innerHTML =
    "<div class='small'>Select a conversation from the left.</div>";
  chatTitleEl.textContent = "No conversation selected";
  chatSubEl.textContent = "";

  try {
    conversations = await api("/api/conversations");
    renderConversations();
  } catch (e) {
    setError(e.message);
  }
}

function renderConversations() {
  convListEl.innerHTML = "";

  if (!conversations || conversations.length === 0) {
    convListEl.innerHTML =
      "<div class='small' style='margin-top:8px;'>No conversations yet.</div>";
    return;
  }

  conversations.forEach((c) => {
    const div = document.createElement("div");
    div.className = "item" + (c.id === activeConversationId ? " active" : "");
    div.innerHTML = `<b>${escape(c.title || "Untitled")}</b>`;
    div.onclick = () => selectConversation(c.id, c.title);
    convListEl.appendChild(div);
  });
}

function selectConversation(id, title) {
  activeConversationId = id;
  chatTitleEl.textContent = title || "Untitled";
  chatSubEl.textContent = "";
  renderConversations();
  loadMessages();
  startPolling();
}

// ------------------- Start direct chat -------------------
async function startDirectChat(otherUsername) {
  const other = (
    otherUsername ??
    document.getElementById("chatWith")?.value ??
    ""
  )
    .trim()
    .toLowerCase();

  if (!other) return;

  if (other === (currentUser() || "").toLowerCase()) {
    return setError("You cannot chat with yourself.");
  }

  setError("");
  try {
    await api("/api/conversations/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUsername: other }),
    });

    const input = document.getElementById("chatWith");
    if (input) input.value = "";

    await loadConversations();
    await loadUsers();
  } catch (e) {
    setError(e.message);
  }
}

// ------------------- Messages -------------------
async function loadMessages() {
  if (!activeConversationId) return;
  setError("");

  try {
    const list = await api(
      `/api/conversations/${activeConversationId}/messages`,
    );
    renderMessages(list);
  } catch (e) {
    setError(e.message);
  }
}

function renderMessages(list) {
  msgsEl.innerHTML = "";

  if (!list || list.length === 0) {
    msgsEl.innerHTML = "<div class='small'>No messages yet.</div>";
    return;
  }

  list
    .slice()
    .reverse()
    .forEach((m) => {
      const div = document.createElement("div");
      const mine =
        (m.senderName || "").toLowerCase() ===
        (currentUser() || "").toLowerCase();

      div.className = "bubble " + (mine ? "me" : "other");
      div.innerHTML = `
        ${!mine ? `<div class="sender">${escape(m.senderName || "unknown")}</div>` : ""}
        <div>${escape(m.body || "")}</div>
        <div class="small">${new Date(m.createdAt).toLocaleTimeString()}</div>
      `;

      msgsEl.appendChild(div);
    });

  msgsEl.scrollTop = msgsEl.scrollHeight;
}

async function sendMessage() {
  const body = document.getElementById("text").value.trim();
  if (!body || !activeConversationId) return;

  setError("");
  try {
    await api(`/api/conversations/${activeConversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    document.getElementById("text").value = "";
    await loadMessages();
  } catch (e) {
    setError(e.message);
  }
}

// ------------------- Wiring -------------------

// login
document.getElementById("btnLogin").addEventListener("click", () => {
  const u = (loginUserEl.value || "").trim().toLowerCase();
  if (!u) return setLoginError("Username is required.");
  setLoginError("");
  showApp(u);
});

loginUserEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btnLogin").click();
});

document.getElementById("btnLogout").addEventListener("click", () => {
  showLogin();
});

// app buttons
document.getElementById("btnStartChat").addEventListener("click", () => {
  startDirectChat();
});

document.getElementById("btnRefresh").addEventListener("click", loadMessages);
document.getElementById("btnSend").addEventListener("click", sendMessage);

document.getElementById("text").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// boot
const saved = localStorage.getItem("qc_user");
if (saved) showApp(saved);
else showLogin();
