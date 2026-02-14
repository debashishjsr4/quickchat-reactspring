import React from "react";
import MessagesView from "./MessagesView";
import Composer from "./Composer";

export default function RightPanel({
  title,
  error,
  me,
  activeConversationId,
  messages,
  onSend,
}) {
  return (
    <div
      style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column" }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

      <div style={{ flex: 1, overflow: "auto", marginTop: 12 }}>
        {!activeConversationId ? (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Select a conversation from the left.
          </div>
        ) : (
          <MessagesView messages={messages} me={me} />
        )}
      </div>

      <Composer disabled={!activeConversationId} onSend={onSend} />
    </div>
  );
}
