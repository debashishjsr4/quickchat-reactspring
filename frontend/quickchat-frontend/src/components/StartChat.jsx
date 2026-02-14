import React, { useState } from "react";

export default function StartChat({ onStart }) {
  const [value, setValue] = useState("");

  return (
    <div style={{ marginTop: 12 }}>
      <input
        placeholder="Start chat with username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />
      <button
        style={{ marginTop: 8 }}
        onClick={() => {
          onStart(value);
          setValue("");
        }}
      >
        Start chat
      </button>
    </div>
  );
}
