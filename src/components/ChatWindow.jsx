// components/ChatWindow.jsx - Enhanced UI
import { useState, useEffect, useContext, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import MessageBubble from "./MessageBubble";

function ChatWindow({ user }) {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef();
  const [isTyping, setIsTyping] = useState(false);

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
    });
    return () => unsubscribe();
  }, [chatId]);

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
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`rounded-3xl transition-all duration-300 card-hover ${
        darkMode
          ? "bg-slate-800/80 border border-white/5"
          : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-4 p-6 border-b ${
        darkMode ? "border-slate-700" : "border-slate-200"
      }`}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-lg font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></div>
        </div>
        <div>
          <h2 className={`font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
            {user.name}
          </h2>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {user.email}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`h-[400px] overflow-y-auto p-6 ${
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
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={currentUser}
            />
          ))
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className={`p-6 border-t ${
        darkMode ? "border-slate-700" : "border-slate-200"
      }`}>
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
            className={`flex-1 p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
              darkMode
                ? "input-modern-dark bg-slate-700/50 border-slate-600 focus:border-[#6C63FF]"
                : "input-modern border-slate-200 focus:border-[#6C63FF]"
            }`}
          />
          <button
            onClick={handleSend}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#3F3D9E] text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/25 hover:scale-105 disabled:opacity-50"
            disabled={!message.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;