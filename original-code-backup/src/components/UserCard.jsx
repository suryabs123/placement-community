function UserCard({ user, onStartChat }) {
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "15px",
        marginBottom: "10px",
      }}
    >
      <h2>{user.name}</h2>

      <p>{user.email}</p>

      <button
        onClick={() => onStartChat(user)}
      >
        Open Chat
      </button>
    </div>
  );
}

export default UserCard;