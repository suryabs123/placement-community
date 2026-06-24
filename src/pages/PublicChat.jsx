import { useContext, useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function PublicChat() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "publicMessages"),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, "publicMessages"), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        text: message,
        createdAt: Timestamp.now(),
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`min-h-screen pt-24 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#6C63FF]">💬 Public Chat</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Connect with the community in real-time
            </p>
          </div>
          <span className={`text-sm px-4 py-2 rounded-xl ${
            darkMode
              ? "bg-slate-800 text-slate-300"
              : "bg-white shadow-md text-slate-600"
          }`}>
            💬 {messages.length} messages
          </span>
        </div>

        {/* Chat Box */}
        <div
          className={`rounded-3xl h-[500px] overflow-y-auto p-6 mb-6 transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/80 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                No messages yet
              </h3>
              <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Be the first to start a conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = currentUser && msg.senderId === currentUser.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex mb-5 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMine && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {msg.senderName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
                      isMine
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                        : darkMode
                        ? "bg-slate-700 text-white rounded-bl-none"
                        : "bg-white shadow-md text-slate-800 rounded-bl-none border border-slate-100"
                    }`}
                  >
                    {!isMine && (
                      <h4 className={`font-bold text-sm mb-1 ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }`}>
                        {msg.senderName}
                      </h4>
                    )}
                    <p className="break-words leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-xs mt-1.5 text-right ${
                        isMine
                          ? "text-blue-200"
                          : darkMode
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      {msg.createdAt
                        ?.toDate()
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input Section */}
        {currentUser ? (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              className={`flex-1 p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            <button
              onClick={handleSend}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 disabled:opacity-50"
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        ) : (
          <div className={`p-8 rounded-3xl text-center transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/50 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              Login Required
            </h3>
            <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Please login to send messages in the public chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicChat;