
import { useEffect, useState, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

import ChatWindow from "../components/ChatWindow";

function ChatPage() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "users")
      );

      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (user) => user.id !== currentUser?.uid
        );

      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🔒 Private Chat
        </h1>

        {!currentUser ? (
          <div
            className={`p-8 rounded-3xl shadow-xl text-center ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">
              🔒 Login Required
            </h2>

            <p className="text-gray-500">
              Login to access private chats.
            </p>
          </div>
        ) : (
          <>
            {/* User List */}
            <div
              className={`p-8 rounded-3xl shadow-xl mb-10 ${
                darkMode
                  ? "bg-slate-800"
                  : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">
                Users
              </h2>

              {/* Search */}
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  w-full
                  p-4
                  rounded-2xl
                  border
                  outline-none
                  text-black
                  mb-6
                "
              />

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() =>
                      setSelectedUser(user)
                    }
                    className={`cursor-pointer flex items-center justify-between p-5 rounded-2xl transition ${
                      selectedUser?.id === user.id
                        ? "bg-blue-200"
                        : darkMode
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-gray-100 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">

                      <div
                        className="
                          w-14 h-14 rounded-full
                          bg-blue-600 text-white
                          flex items-center justify-center
                          text-xl font-bold
                        "
                      >
                        {user.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-bold">
                          {user.name}
                        </h3>

                        <p className="text-gray-500 text-sm">
                          {user.email}
                        </p>
                      </div>

                    </div>

                    <button
                      className="
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        px-5 py-2
                        rounded-xl
                      "
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            {selectedUser && (
              <ChatWindow user={selectedUser} />
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default ChatPage;

