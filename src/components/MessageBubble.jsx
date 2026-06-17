import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function MessageBubble({ message, currentUser }) {
  const { darkMode } = useContext(ThemeContext);

  const isMine =
    message.senderId === currentUser.uid;

  return (
    <div
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
            ? "bg-slate-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        <h4 className="font-bold mb-2">
          {message.senderName}
        </h4>

        <p>{message.text}</p>
      </div>
    </div>
  );
}

export default MessageBubble;