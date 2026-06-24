// components/ReplyCard.jsx - Enhanced UI
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ReplyCard({ reply }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`p-5 rounded-2xl transition-all duration-300 ${
        darkMode
          ? "bg-slate-700/50 border-l-4 border-[#6C63FF] hover:bg-slate-700"
          : "bg-slate-50 border-l-4 border-[#6C63FF] hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-xs font-bold">
          {reply.author?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h4 className={`font-semibold text-sm ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            {reply.author}
          </h4>
          <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
            replied
          </span>
        </div>
      </div>
      <p className={`text-sm ml-11 ${
        darkMode ? "text-slate-300" : "text-slate-600"
      }`}>
        {reply.reply}
      </p>
    </div>
  );
}

export default ReplyCard;