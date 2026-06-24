// pages/AskQuestion.jsx - Enhanced UI
import { useState, useContext } from "react";
import {
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function AskQuestion() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await addDoc(collection(db, "questions"), {
        title,
        description,
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        upvotes: 0,
      });
      setTitle("");
      setDescription("");
      setSuccess("✅ Question posted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
      }`}>
        <div className={`p-10 rounded-3xl text-center ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl"
        }`}>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Login Required
          </h1>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Please login to ask a question.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className={`p-8 sm:p-10 rounded-3xl transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#6C63FF]/25">
              ❓
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
                Ask a Question
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Get help from the community
              </p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3 animate-slide-up">
              <span className="text-xl">✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Question Title
              </label>
              <input
                type="text"
                placeholder="What would you like to know?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                  darkMode
                    ? "input-modern-dark bg-slate-700/50 border-slate-600 focus:border-[#6C63FF]"
                    : "input-modern border-slate-200 focus:border-[#6C63FF]"
                }`}
              />
            </div>

            <div>
              <label className={`text-sm font-medium block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Question Description
              </label>
              <textarea
                rows="8"
                placeholder="Describe your question in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                  darkMode
                    ? "input-modern-dark bg-slate-700/50 border-slate-600 focus:border-[#6C63FF]"
                    : "input-modern border-slate-200 focus:border-[#6C63FF]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 w-full justify-center py-4"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Posting...
                </>
              ) : (
                <>
                  <span>📤</span> Post Question
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AskQuestion;