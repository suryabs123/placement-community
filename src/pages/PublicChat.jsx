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
import { ThemeContext } from "../context/ThemeContext";

function PublicChat() {
  const { darkMode } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
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
    if (!message.trim()) return;
    if (!userName.trim()) {
      alert("Please enter your name to chat");
      return;
    }
    try {
      await addDoc(collection(db, "publicMessages"), {
        senderId: "guest_" + Date.now(),
        senderName: userName.trim() || "Anonymous",
        text: message,
        createdAt: Timestamp.now(),
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // Filter messages by search
  const filteredMessages = messages.filter(msg =>
    msg.text?.toLowerCase().includes(search.toLowerCase()) ||
    msg.senderName?.toLowerCase().includes(search.toLowerCase())
  );

  // Group messages by date (like private chat)
  const getMessageGroups = () => {
    const groups = {};
    filteredMessages.forEach(msg => {
      const date = msg.createdAt?.toDate();
      if (!date) return;
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const messageGroups = getMessageGroups();

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className={`min-h-screen pt-24 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">💬 Public Chat</h1>
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

        {/* Search Bar */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search messages or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 outline-none transition-all duration-300 ${
              darkMode
                ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                : "bg-white/80 border-slate-200 focus:border-indigo-500 shadow-lg"
            }`}
          />
        </div>

        {/* Name Input - Removed "(optional)" */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={`flex-1 p-3 rounded-xl border-2 outline-none transition-all duration-300 ${
              darkMode
                ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                : "border-slate-200 focus:border-indigo-500"
            }`}
          />
        </div>

        {/* Chat Box */}
        <div
          className={`rounded-3xl h-[450px] overflow-y-auto p-6 mb-6 transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/80 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                {search ? "No messages found" : "No messages yet"}
              </h3>
              <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {search ? "Try a different search term" : "Be the first to start a conversation!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(messageGroups).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-3">
                    <div className={`px-4 py-1 rounded-full text-xs ${
                      darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500"
                    }`}>
                      {new Date(dateKey).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                  {msgs.map((msg) => {
                    const isMine = msg.senderId?.startsWith("guest_");
                    return (
                      <div
                        key={msg.id}
                        className={`flex mb-4 ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMine && (
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {msg.senderName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-md transition-all duration-200 ${
                            isMine
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                              : darkMode
                              ? "bg-slate-700 text-white rounded-bl-sm"
                              : "bg-white shadow-md text-slate-800 rounded-bl-sm border border-slate-100"
                          }`}
                        >
                          {!isMine && (
                            <h4 className={`font-bold text-xs mb-0.5 ${
                              darkMode ? "text-indigo-400" : "text-indigo-600"
                            }`}>
                              {msg.senderName || "Anonymous"}
                            </h4>
                          )}
                          <div className="flex items-end gap-1.5 flex-wrap">
                            <span className="text-sm leading-relaxed break-words">
                              {msg.text}
                            </span>
                            <span className={`text-[10px] leading-none whitespace-nowrap ${
                              isMine
                                ? "text-blue-200"
                                : darkMode
                                ? "text-slate-400"
                                : "text-slate-400"
                            }`}>
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Section */}
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
      </div>
    </div>
  );
}

export default PublicChat;