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
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🌎 Public Chat Room
        </h1>

        {/* Chat Box */}
        <div
          className={`rounded-3xl shadow-xl h-[600px] overflow-y-auto p-6 mb-8 ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}
        >
          {messages.map((msg) => {
            const isMine =
              currentUser &&
              msg.senderId === currentUser.uid;

            return (
              <div
                key={msg.id}
                className={`flex mb-5 ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md p-4 rounded-3xl shadow-lg ${
                    isMine
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "bg-slate-700 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <h4 className="font-bold mb-2">
                    {msg.senderName}
                  </h4>

                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef}></div>
        </div>

        {/* Input Section */}
        {currentUser ? (
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              className="flex-1 p-4 rounded-2xl border outline-none text-black"
            />

            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl"
            >
              Send
            </button>
          </div>
        ) : (
          <div
            className={`p-6 rounded-2xl shadow-xl text-center ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-3">
              🔒 Login Required
            </h2>

            <p className="text-gray-500">
              Login to send messages.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default PublicChat;