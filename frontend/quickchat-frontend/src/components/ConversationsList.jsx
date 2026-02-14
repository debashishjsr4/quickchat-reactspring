import React from "react";

export default function ConversationsList({
  conversations,
  activeId,
  onSelect,
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        No conversations yet.
      </div>
    );
  }

  return conversations.map((c) => (
    <div
      key={c.id}
      onClick={() => onSelect(c.id, c.title)}
      style={{
        padding: 8,
        cursor: "pointer",
        fontWeight: c.id === activeId ? "700" : "400",
      }}
    >
      {c.title || "Untitled"}
    </div>
  ));
}
