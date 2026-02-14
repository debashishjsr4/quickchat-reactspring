import React from "react";

export default function UsersList({ users, onClickUser }) {
  if (!users || users.length === 0) {
    return (
      <div style={{ fontSize: 12, opacity: 0.7 }}>No other users yet.</div>
    );
  }

  return users.map((u) => (
    <div
      key={u}
      style={{ padding: 8, cursor: "pointer" }}
      onClick={() => onClickUser(u)}
    >
      <b>{u}</b>
    </div>
  ));
}
