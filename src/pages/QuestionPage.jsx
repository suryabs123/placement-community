// pages/QuestionPage.jsx - Enhanced UI
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import AnswerCard from "../components/AnswerCard";

function QuestionPage() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
    const q = query(
      collection(db, "answers"),
      where("questionId", "==", id),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnswers(data);
    });
    return () => unsubscribe();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const docRef = doc(db, "questions", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (!answer.trim()) return;
    try {
      await addDoc(collection(db, "answers"), {
        questionId: id,
        answer,
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        upvotes: 0,
      });
      setAnswer("");
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
      }`}>
        <div className="w-12 h-12 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Question */}
        {question && (
          <div className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 card-hover mb-10 ${
            darkMode
              ? "bg-slate-800/80 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="badge badge-primary">📌 Question</span>
              {question.createdAt?.toDate() > new Date(Date.now() - 24*60*60*1000) && (
                <span className="badge badge-success">New</span>
              )}
            </div>
            <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-slate-800"
            }`}>
              {question.title}
            </h1>
            <p className={`text-base sm:text-lg leading-relaxed mb-6 ${
              darkMode ? "text-slate-300" : "text-slate-600"
            }`}>
              {question.description}
            </p>
            <div className={`flex items-center gap-4 text-sm ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-xs font-bold">
                  {question.author?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span>{question.author}</span>
              </div>
              <span>•</span>
              <span>{question.createdAt?.toDate().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</span>
              <span>•</span>
              <span>👍 {question.upvotes || 0}</span>
            </div>
          </div>
        )}

        {/* Answers Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            Answers ({answers.length})
          </h2>
          <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {answers.length === 0 ? "Be the first to answer!" : `${answers.length} answers`}
          </span>
        </div>

        {answers.length === 0 ? (
          <div className={`p-8 sm:p-12 rounded-3xl text-center transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/50 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}>
            <div className="text-5xl mb-4">💭</div>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              No answers yet
            </h3>
            <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Be the first to help out by providing an answer!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {answers.map((ans) => (
              <AnswerCard key={ans.id} answer={ans} />
            ))}
          </div>
        )}

        {/* Write Answer */}
        <div className={`p-6 sm:p-8 rounded-3xl mt-10 transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
        }`}>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            ✍️ Write Your Answer
          </h2>
          <form onSubmit={handleAnswer} className="space-y-6">
            <textarea
              rows="6"
              placeholder="Share your knowledge and help others..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={`w-full p-5 rounded-2xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "input-modern-dark bg-slate-700/50 border-slate-600 focus:border-[#6C63FF]"
                  : "input-modern border-slate-200 focus:border-[#6C63FF]"
              }`}
            />
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <span>📤</span> Post Answer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;