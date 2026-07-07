import { useState, useEffect, useContext, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import MessageBubble from "./MessageBubble";

function ChatWindow({ user, onMessageRead }) {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const bottomRef = useRef();

  const chatId =
    currentUser.uid < user.id
      ? currentUser.uid + user.id
      : user.id + currentUser.uid;

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
      markMessagesAsRead(data);
    });
    return () => unsubscribe();
  }, [chatId]);

  const markMessagesAsRead = async (msgList) => {
    if (!currentUser) return;
    
    const unreadMessages = msgList.filter(
      msg => msg.senderId === user.id && msg.read === false
    );

    for (const msg of unreadMessages) {
      try {
        await updateDoc(doc(db, "messages", msg.id), {
          read: true,
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (unreadMessages.length > 0 && onMessageRead) {
      onMessageRead();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!currentUser) return;
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        text: message,
        createdAt: Timestamp.now(),
        read: false,
      });
      setMessage("");
      setIsSelectMode(false);
      setSelectedMessages([]);
    } catch (error) {
      console.log(error);
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
    setShowDeleteModal(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      for (const msgId of selectedMessages) {
        await deleteDoc(doc(db, "messages", msgId));
      }
      setSelectedMessages([]);
      setIsSelectMode(false);
      setShowDeleteModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteMessage = (msgId) => {
    setDeleteMessageId(msgId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSingle = async () => {
    if (!deleteMessageId) return;
    try {
      await deleteDoc(doc(db, "messages", deleteMessageId));
      setDeleteMessageId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getMessageGroups = () => {
    const groups = {};
    messages.forEach(msg => {
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

  return (
    <>
      <div
        className={`rounded-3xl transition-all duration-300 card-hover flex flex-col h-[600px] ${
          darkMode
            ? "bg-slate-800/80 border border-slate-700/50"
            : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? "border-slate-700" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className={`font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                {user.name}
              </h2>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) setSelectedMessages([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
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
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
              >
                Delete ({selectedMessages.length})
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-4 ${
            darkMode ? "bg-slate-900/50" : "bg-slate-50/50"
          }`}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
                No messages yet
              </p>
              <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Start a conversation with {user.name}
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
                    const isMine = msg.senderId === currentUser.uid;
                    const isSelected = selectedMessages.includes(msg.id);
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {isSelectMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectMessage(msg.id)}
                            className="mt-1 w-4 h-4 rounded border-2 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}
                        <MessageBubble
                          message={msg}
                          currentUser={currentUser}
                          onDelete={isMine ? handleDeleteMessage : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={`Message ${user.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              className={`flex-1 p-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 disabled:opacity-50"
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl max-w-sm w-full mx-4 ${
            darkMode ? "bg-slate-800 border border-slate-700/50" : "bg-white shadow-2xl"
          }`}>
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                Delete {deleteMessageId ? "Message" : "Messages"}?
              </h3>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {deleteMessageId 
                  ? "This message will be deleted permanently."
                  : `You are about to delete ${selectedMessages.length} message(s). This action cannot be undone.`
                }
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
                  onClick={deleteMessageId ? confirmDeleteSingle : confirmDeleteSelected}
                  className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWindow;