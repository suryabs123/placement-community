import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ReplyCard({ reply, onDelete, currentUser }) {
  const { darkMode } = useContext(ThemeContext);
  const isAuthor = currentUser && reply.authorId === currentUser.uid;

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      onDelete(reply.id);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl transition-all duration-300 ${
        darkMode
          ? "bg-slate-700/50 border-l-4 border-indigo-500 hover:bg-slate-700"
          : "bg-slate-50 border-l-4 border-indigo-500 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
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
        
        {isAuthor && (
          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            title="Delete reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default ReplyCard;