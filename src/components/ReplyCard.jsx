import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ReplyCard({ reply }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`ml-8 mt-4 p-5 rounded-2xl border-l-4 shadow-md ${
        darkMode
          ? "bg-slate-700 border-blue-500 text-white"
          : "bg-gray-100 border-blue-500 text-black"
      }`}
    >
      <div className="flex items-center gap-4 mb-3">

        {/* Avatar */}
        <div
          className="
            w-12 h-12
            rounded-full
            bg-blue-600
            text-white
            flex items-center
            justify-center
            text-xl
            font-bold
          "
        >
          {reply.author?.charAt(0).toUpperCase()}
        </div>

        {/* Author */}
        <div>
          <h4 className="font-bold">
            {reply.author}
          </h4>

          <small className="text-gray-400">
            Reply
          </small>
        </div>

      </div>

      {/* Reply Text */}
      <p className="text-gray-400">
        {reply.reply}
      </p>
    </div>
  );
}

export default ReplyCard;