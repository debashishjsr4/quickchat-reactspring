import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { listUsers } from "../api/usersApi";
import { listConversations, startOrReuseDirect } from "../api/conversationsApi";
import { listMessages, sendMessage as sendMsg } from "../api/messagesApi";

const POLL_MS = 2000;

export default function AppPage() {
  const { username, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeTitle, setActiveTitle] = useState("No conversation selected");
  const [messages, setMessages] = useState([]);
  const [err, setErr] = useState("");

  const [chatWith, setChatWith] = useState("");
  const [text, setText] = useState("");

  const pollInFlight = useRef(false);
  const msgsRef = useRef(null);

  const otherUsers = useMemo(() => {
    const me = (username || "").toLowerCase();
    return (users || []).filter((u) => (u || "").toLowerCase() !== me);
  }, [users, username]);

  const loadUsersFn = async () => {
    const res = await listUsers();
    if (res.status === 401) return logout();
    if (res.ok) setUsers(res.data || []);
  };

  const loadConversationsFn = async () => {
    setErr("");
    setActiveConversationId(null);
    setActiveTitle("No conversation selected");
    setMessages([]);

    const res = await listConversations();
    if (res.status === 401) return logout();
    if (!res.ok)
      return setErr(res.data?.message || "Failed to load conversations");

    setConversations(res.data || []);
  };

  const loadMessagesFn = async (cid) => {
    if (!cid) return;
    const res = await listMessages(cid);
    if (res.status === 401) return logout();
    if (!res.ok) return setErr(res.data?.message || "Failed to load messages");

    setMessages(res.data || []);
  };

  const onSelectConversation = async (id, title) => {
    setErr("");
    setActiveConversationId(id);
    setActiveTitle(title || "Untitled");
    await loadMessagesFn(id);
  };

  const onStartChat = async (maybeUsername) => {
    const other = (maybeUsername ?? chatWith ?? "").trim().toLowerCase();
    if (!other) return;

    if (other === (username || "").toLowerCase()) {
      setErr("You cannot chat with yourself.");
      return;
    }

    setErr("");
    const res = await startOrReuseDirect(other);
    if (res.status === 401) return logout();
    if (!res.ok) return setErr(res.data?.message || "Failed to start chat");

    setChatWith("");
    await loadConversationsFn();
    await loadUsersFn();
  };

  const onSend = async () => {
    const body = text.trim();
    if (!body || !activeConversationId) return;

    setErr("");
    const res = await sendMsg(activeConversationId, body);
    if (res.status === 401) return logout();
    if (!res.ok) return setErr(res.data?.message || "Failed to send");

    setText("");
    await loadMessagesFn(activeConversationId);
  };

  // initial load (like your boot)
  useEffect(() => {
    loadUsersFn();
    loadConversationsFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // polling (like your startPolling/stopPolling)
  useEffect(() => {
    if (!activeConversationId) return;

    const timer = setInterval(async () => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;
      try {
        await loadMessagesFn(activeConversationId);
      } finally {
        pollInFlight.current = false;
      }
    }, POLL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // scroll to bottom when messages change
  useEffect(() => {
    if (msgsRef.current)
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="app">
      {/* LEFT */}
      <div className="left">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <b>User:</b> <span>{username}</span>
          </div>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="sectionTitle">Start chat</div>
        <div className="row">
          <input
            value={chatWith}
            onChange={(e) => setChatWith(e.target.value)}
            placeholder="type username (e.g., subu)"
          />
          <button onClick={() => onStartChat()}>Chat</button>
        </div>

        <div className="small" style={{ marginTop: 6 }}>
          Tip: If the user doesn't exist yet, they will be created
          automatically.
        </div>

        <div className="sectionTitle">All users</div>
        <div className="list">
          {otherUsers.length === 0 ? (
            <div className="small">No other users yet.</div>
          ) : (
            otherUsers.map((u) => (
              <div key={u} className="item" onClick={() => onStartChat(u)}>
                <b>{u}</b>
              </div>
            ))
          )}
        </div>

        <div className="sectionTitle">Your conversations</div>
        <div className="list">
          {conversations.length === 0 ? (
            <div className="small" style={{ marginTop: 8 }}>
              No conversations yet.
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={
                  "item" + (c.id === activeConversationId ? " active" : "")
                }
                onClick={() => onSelectConversation(c.id, c.title)}
              >
                <b>{c.title || "Untitled"}</b>
              </div>
            ))
          )}
        </div>

        {err && <div className="error">{err}</div>}
      </div>

      {/* RIGHT */}
      <div className="right">
        <div className="top">
          <div>
            <b id="chatTitle">{activeTitle}</b>
            <br />
            <span className="small"></span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => loadMessagesFn(activeConversationId)}
              disabled={!activeConversationId}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="msgs" ref={msgsRef}>
          {!activeConversationId ? (
            <div className="small">Select a conversation from the left.</div>
          ) : messages.length === 0 ? (
            <div className="small">No messages yet.</div>
          ) : (
            [...messages]
              .slice()
              .reverse()
              .map((m) => {
                const mine =
                  (m.senderName || "").toLowerCase() ===
                  (username || "").toLowerCase();

                return (
                  <div
                    key={m.id}
                    className={"bubble " + (mine ? "me" : "other")}
                  >
                    {!mine && (
                      <div className="sender">{m.senderName || "unknown"}</div>
                    )}
                    <div>{m.body || ""}</div>
                    <div className="small">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div className="composer">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            disabled={!activeConversationId}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <button onClick={onSend} disabled={!activeConversationId}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
