import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function MyQuestions() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Fixed: Query questions where authorId matches current user
    const q = query(
      collection(db, "questions"),
      where("authorId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("My Questions:", data); // Debug log
      setQuestions(data);
      setLoading(false);
    }, (error) => {
      console.log("Error fetching my questions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteDoc(doc(db, "questions", questionId));
        alert("Question deleted successfully!");
      } catch (error) {
        console.log(error);
        alert("Failed to delete question");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <div className={`p-10 rounded-3xl shadow-xl text-center ${
          darkMode ? "bg-slate-800" : "bg-white"
        }`}>
          <h1 className="text-3xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-gray-500">Please login to view your questions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
      }`}>
        <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-8 px-4 sm:px-8 ${
      darkMode ? "bg-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              📝 My Questions
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Questions you have asked
            </p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-sm ${
            darkMode ? "bg-slate-800 text-slate-300" : "bg-white shadow-md text-slate-600"
          }`}>
            {questions.length} questions
          </span>
        </div>

        {questions.length === 0 ? (
          <div className={`p-16 rounded-3xl text-center ${
            darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
          }`}>
            <div className="text-6xl mb-4">❓</div>
            <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              No questions asked yet
            </h3>
            <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Start asking questions to help others!
            </p>
            <Link to="/ask" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
              ❓ Ask a Question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`p-6 rounded-2xl transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-800/80 border border-slate-700/50 hover:bg-slate-800"
                    : "bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl border border-white/50 hover:border-indigo-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-slate-700 text-slate-300" : "bg-indigo-50 text-slate-600"}`}>
                        {question.createdAt?.toDate().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                      {/* Removed 💬 0 answers */}
                    </div>
                    <Link to={`/question/${question.id}`}>
                      <h2 className={`text-xl font-bold mb-2 hover:text-indigo-500 transition-colors ${darkMode ? "text-white" : "text-slate-800"}`}>
                        {question.title}
                      </h2>
                    </Link>
                    <p className={`line-clamp-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {question.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      to={`/question/${question.id}`}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyQuestions;