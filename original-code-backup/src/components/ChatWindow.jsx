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
        senderName:
          currentUser.displayName ||
          currentUser.email,
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
      className={`rounded-3xl shadow-xl p-6 mt-10 ${
        darkMode
          ? "bg-slate-800 text-white"
          : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="
          w-14 h-14 rounded-full
          bg-blue-600 text-white
          flex items-center justify-center
          text-2xl font-bold
        "
        >
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {user.name}
          </h2>

          <p className="text-gray-500">
            {user.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`h-[500px] overflow-y-auto rounded-2xl p-5 mb-6 ${
          darkMode
            ? "bg-slate-700"
            : "bg-gray-100"
        }`}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={currentUser}
          />
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="
          flex-1
          p-4
          rounded-2xl
          border
          outline-none
          text-black
        "
        />

        <button
          onClick={handleSend}
          className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-8
          rounded-2xl
        "
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;