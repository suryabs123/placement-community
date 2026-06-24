function ProfileCard({ user }) {
  return (
    <div>
      <h2>{user?.displayName || "No Name"}</h2>

      <p>{user?.email}</p>

      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt="profile"
          width="150"
        />
      ) : (
        <p>No Profile Picture</p>
      )}
    </div>
  );
}

export default ProfileCard;