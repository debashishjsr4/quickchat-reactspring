import React from "react";
import StartChat from "./StartChat";
import UsersList from "./UsersList";
import ConversationsList from "./ConversationsList";

export default function LeftPanel({
  username,
  onLogout,
  onStartChat,
  users,
  conversations,
  activeConversationId,
  onSelectConversation,
}) {
  return (
    <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <b>{username}</b>
        <button onClick={onLogout}>Logout</button>
      </div>

      <StartChat onStart={onStartChat} />

      <h4>Users</h4>
      <UsersList users={users} onClickUser={onStartChat} />

      <h4>Conversations</h4>
      <ConversationsList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={onSelectConversation}
      />
    </div>
  );
}
