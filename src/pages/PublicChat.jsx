import { useContext, useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

function PublicChat() {
  const { darkMode } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const bottomRef = useRef();

  // Guest ID for tracking
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    // Generate a unique guest ID when component mounts
    setGuestId("guest_" + Date.now());
  }, []);

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
        senderId: currentUser ? currentUser.uid : guestId,
        senderName: userName.trim() || "Anonymous",
        text: message,
        createdAt: Timestamp.now(),
        userId: currentUser?.uid || null,
        isGuest: !currentUser,
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // Check if the user can delete this message (only their own)
  const canDeleteMessage = (msg) => {
    if (!currentUser) {
      // For guest users, check if the message was sent with the same guest ID
      return msg.senderId === guestId && msg.isGuest === true;
    }
    // For logged-in users, check if they are the author
    return msg.userId === currentUser.uid;
  };

  const handleDeleteMessage = (msgId) => {
    setDeleteMessageId(msgId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteMessageId) return;
    try {
      await deleteDoc(doc(db, "publicMessages", deleteMessageId));
      setDeleteMessageId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.log(error);
      alert("Failed to delete message");
    }
  };

  const handleSelectMessage = (msgId) => {
    setSelectedMessages(prev => {
      if (prev.includes(msgId)) {
        return prev.filter(id => id !== msgId);
      } else {
        return [...prev, msgId];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) return;
    try {
      for (const msgId of selectedMessages) {
        await deleteDoc(doc(db, "publicMessages", msgId));
      }
      setSelectedMessages([]);
      setIsSelectMode(false);
    } catch (error) {
      console.log(error);
      alert("Failed to delete messages");
    }
  };

  // Filter messages by search
  const filteredMessages = messages.filter(msg =>
    msg.text?.toLowerCase().includes(search.toLowerCase()) ||
    msg.senderName?.toLowerCase().includes(search.toLowerCase())
  );

  // Group messages by date
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
        {/* Header - Removed message count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">💬 Public Chat</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Connect with the community in real-time
            </p>
          </div>
          {/* Message count removed */}
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

        {/* Name Input */}
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
          {messages.length > 0 && (
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedMessages([]);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isSelectMode
                  ? darkMode
                    ? "bg-red-500/20 text-red-400"
                    : "bg-red-500/10 text-red-500"
                  : darkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isSelectMode ? "Cancel" : "Select"}
            </button>
          )}
          {isSelectMode && selectedMessages.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
            >
              Delete ({selectedMessages.length})
            </button>
          )}
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
                    const isMine = canDeleteMessage(msg);
                    const isSelected = selectedMessages.includes(msg.id);
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {isSelectMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectMessage(msg.id)}
                            className="mt-2 mr-2 w-4 h-4 rounded border-2 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}
                        <div className={`flex items-start gap-2 ${!isMine ? "flex-row" : "flex-row-reverse"}`}>
                          {!isMine && (
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {msg.senderName?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            </div>
                          )}
                          <div className="relative group max-w-[75%]">
                            <div
                              className={`px-4 py-2.5 rounded-2xl shadow-md transition-all duration-200 ${
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
                            
                            {/* Delete button - ONLY for own messages */}
                            {isMine && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                                  darkMode
                                    ? "bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400"
                                    : "bg-white hover:bg-red-50 text-slate-500 hover:text-red-500"
                                }`}
                                title="Delete message"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl max-w-sm w-full mx-4 ${
            darkMode ? "bg-slate-800 border border-slate-700/50" : "bg-white shadow-2xl"
          }`}>
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                Delete Message?
              </h3>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                This message will be deleted permanently.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteMessageId(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      : "bg-gray-100 hover:bg-gray-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicChat;