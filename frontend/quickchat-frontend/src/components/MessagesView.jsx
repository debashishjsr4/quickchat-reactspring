import React, { useEffect, useRef } from "react";

export default function MessagesView({ messages, me }) {
  const boxRef = useRef(null);

  useEffect(() => {
    // mimic your scroll-to-bottom
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  if (!messages || messages.length === 0) {
    return <div style={{ fontSize: 12, opacity: 0.7 }}>No messages yet.</div>;
  }

  return (
    <div ref={boxRef} style={{ flex: 1, overflow: "auto" }}>
      {[...messages]
        .slice()
        .reverse()
        .map((m) => {
          const mine =
            (m.senderName || "").toLowerCase() === (me || "").toLowerCase();
          return (
            <div
              key={m.id}
              style={{ marginBottom: 10, textAlign: mine ? "right" : "left" }}
            >
              {!mine && (
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  {m.senderName || "unknown"}
                </div>
              )}
              <div
                style={{
                  display: "inline-block",
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 12,
                }}
              >
                {m.body}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
    </div>
  );
}
