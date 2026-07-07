import { useEffect, useState, useContext } from "react";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import ChatWindow from "../components/ChatWindow";
import Avatar from "../components/Avatar";

function ChatPage() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== currentUser?.uid);
      setUsers(data);

      const counts = {};
      for (const user of data) {
        const chatId = currentUser.uid < user.id 
          ? currentUser.uid + user.id 
          : user.id + currentUser.uid;
        
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", chatId),
          where("senderId", "==", user.id),
          where("read", "==", false)
        );
        const snapshot = await getDocs(q);
        counts[user.id] = snapshot.size;
      }
      setUnreadCounts(counts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeAll = users.map((user) => {
      const chatId = currentUser.uid < user.id 
        ? currentUser.uid + user.id 
        : user.id + currentUser.uid;

      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        where("senderId", "==", user.id),
        where("read", "==", false)
      );

      return onSnapshot(q, (snapshot) => {
        setUnreadCounts(prev => ({
          ...prev,
          [user.id]: snapshot.size
        }));
      });
    });

    return () => {
      unsubscribeAll.forEach(unsub => unsub && unsub());
    };
  }, [users, currentUser]);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aUnread = unreadCounts[a.id] || 0;
    const bUnread = unreadCounts[b.id] || 0;
    return bUnread - aUnread;
  });

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
      }`}>
        <div className={`p-10 rounded-3xl text-center ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl"
        }`}>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Login Required
          </h1>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Login to access private chats.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
      }`}>
        <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">🔒 Private Chat</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Chat privately with other members
            </p>
          </div>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 outline-none transition-all duration-300 ${
              darkMode
                ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                : "bg-white/80 border-slate-200 focus:border-indigo-500 shadow-lg"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-1 p-4 rounded-3xl transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/80 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {sortedUsers.length === 0 ? (
                <div className={`text-center py-8 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                sortedUsers.map((user) => {
                  const unreadCount = unreadCounts[user.id] || 0;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedUser?.id === user.id
                          ? darkMode
                            ? "bg-indigo-500/20 border border-indigo-500/30"
                            : "bg-indigo-500/10 border border-indigo-500/20"
                          : darkMode
                          ? "hover:bg-slate-700/50"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      {/* Avatar - Clickable */}
                      <Avatar 
                        user={{ id: user.id, name: user.name }}
                        size="w-11 h-11"
                        textSize="text-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium truncate ${
                            darkMode ? "text-white" : "text-slate-800"
                          }`}>
                            {user.name}
                          </p>
                          {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedUser ? (
              <ChatWindow user={selectedUser} onMessageRead={() => {
                setUnreadCounts(prev => ({
                  ...prev,
                  [selectedUser.id]: 0
                }));
              }} />
            ) : (
              <div className={`h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800/50 border border-white/5"
                  : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
              }`}>
                <div className="text-6xl mb-4">💬</div>
                <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                  Select a conversation
                </h3>
                <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Choose a user from the list to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;