import React, { useState } from "react";

export default function Composer({ disabled, onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
        placeholder={disabled ? "Select a conversation..." : "Type a message"}
        style={{ flex: 1, padding: 10 }}
      />
      <button disabled={disabled} onClick={send}>
        Send
      </button>
    </div>
  );
}
