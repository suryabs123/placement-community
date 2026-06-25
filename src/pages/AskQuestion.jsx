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
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const popularTopics = [
    { name: "DSA", icon: "📊", color: "from-blue-500 to-blue-600" },
    { name: "Web Development", icon: "🌐", color: "from-purple-500 to-purple-600" },
    { name: "Aptitude", icon: "🧮", color: "from-green-500 to-green-600" },
    { name: "Interview Prep", icon: "🎯", color: "from-red-500 to-red-600" },
    { name: "Coding", icon: "💻", color: "from-yellow-500 to-orange-500" },
    { name: "Placements", icon: "🏢", color: "from-pink-500 to-rose-500" },
    { name: "Resume", icon: "📄", color: "from-cyan-500 to-blue-500" },
    { name: "Projects", icon: "🚀", color: "from-indigo-500 to-purple-500" },
  ];

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
        topics: selectedTopics, // Save selected topics
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        upvotes: 0,
        answersCount: 0,
      });
      setTitle("");
      setDescription("");
      setSelectedTopics([]);
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/25">
              ❓
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#6C63FF]">
                Ask a Question
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Get help from the community
              </p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3">
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
                    ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                    : "border-slate-200 focus:border-indigo-500"
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
                    ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                    : "border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>

            {/* Topic Selection */}
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Select Topics (Max 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic) => (
                  <button
                    key={topic.name}
                    type="button"
                    onClick={() => {
                      if (selectedTopics.includes(topic.name)) {
                        setSelectedTopics(selectedTopics.filter(t => t !== topic.name));
                      } else if (selectedTopics.length < 3) {
                        setSelectedTopics([...selectedTopics, topic.name]);
                      } else {
                        alert("You can select up to 3 topics only");
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedTopics.includes(topic.name)
                        ? `bg-gradient-to-r ${topic.color} text-white shadow-lg scale-105`
                        : darkMode
                        ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.name}</span>
                    {selectedTopics.includes(topic.name) && (
                      <span className="text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className={`text-xs mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Selected: {selectedTopics.length || 0}/3 topics
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2"
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