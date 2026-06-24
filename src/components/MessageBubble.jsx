// components/MessageBubble.jsx - Enhanced UI
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function MessageBubble({ message, currentUser }) {
  const { darkMode } = useContext(ThemeContext);
  const isMine = message.senderId === currentUser.uid;

  return (
    <div
      className={`flex mb-4 animate-slide-up ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {!isMine && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-xs font-bold">
            {message.senderName?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      )}
      <div
        className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
          isMine
            ? "bg-gradient-to-r from-[#6C63FF] to-[#5A52D5] text-white rounded-br-none"
            : darkMode
            ? "bg-slate-700 text-white rounded-bl-none"
            : "bg-white shadow-md text-slate-800 rounded-bl-none border border-slate-100"
        }`}
      >
        {!isMine && (
          <h4 className={`font-bold text-sm mb-1 ${
            darkMode ? "text-[#8B83FF]" : "text-[#6C63FF]"
          }`}>
            {message.senderName}
          </h4>
        )}
        <p className="break-words leading-relaxed">{message.text}</p>
        <div
          className={`text-xs mt-1.5 text-right ${
            isMine
              ? "text-blue-200"
              : darkMode
              ? "text-slate-400"
              : "text-slate-400"
          }`}
        >
          {message.createdAt
            ?.toDate()
            .toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;