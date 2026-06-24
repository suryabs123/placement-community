import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function MessageBubble({ message, currentUser }) {
  const { darkMode } = useContext(ThemeContext);

  const isMine =
    message.senderId === currentUser.uid;

  return (
    <div
      className={`flex mb-4 ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-md px-5 py-3 rounded-3xl shadow-lg ${
          isMine
            ? "bg-blue-600 text-white"
            : darkMode
            ? "bg-slate-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {!isMine && (
          <h4 className="font-bold text-sm mb-1">
            {message.senderName}
          </h4>
        )}

        <p className="break-words">
          {message.text}
        </p>

        <div
          className={`text-xs mt-2 text-right ${
            isMine
              ? "text-blue-100"
              : "text-gray-400"
          }`}
        >
          {message.createdAt
            ?.toDate()
            .toLocaleDateString()}{" "}
          •{" "}
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