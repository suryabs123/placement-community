import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

function MessageBubble({ message, currentUser, onDelete }) {
  const { darkMode } = useContext(ThemeContext);
  const isMine = message.senderId === currentUser.uid;
  const [showOptions, setShowOptions] = useState(false);

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div
      className={`flex mb-1.5 ${isMine ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {!isMine && (
        <div className="flex-shrink-0 mr-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {message.senderName?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      )}
      <div className="relative group max-w-[75%]">
        <div
          className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
            isMine
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
              : darkMode
              ? "bg-slate-700 text-white rounded-bl-sm"
              : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
          }`}
        >
          {!isMine && (
            <h4 className={`font-bold text-xs mb-0.5 ${
              darkMode ? "text-indigo-400" : "text-indigo-600"
            }`}>
              {message.senderName}
            </h4>
          )}
          <div className="flex items-end gap-1.5 flex-wrap">
            <span className="text-sm leading-relaxed break-words">
              {message.text}
            </span>
            <span className={`text-[10px] leading-none whitespace-nowrap ${
              isMine
                ? "text-blue-200"
                : darkMode
                ? "text-slate-400"
                : "text-slate-400"
            }`}>
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        </div>
        
        {/* Delete Option - Only for own messages on hover */}
        {isMine && onDelete && showOptions && (
          <button
            onClick={() => onDelete(message.id)}
            className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-all duration-200 ${
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
  );
}

export default MessageBubble;