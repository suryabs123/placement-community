import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import AnswerCard from "../components/AnswerCard";

function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
    
    // ✅ REAL-TIME answers listener using onSnapshot
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
      
      // Update the question's answersCount in real-time
      updateDoc(doc(db, "questions", id), {
        answersCount: data.length,
      }).catch(() => {});
    }, (error) => {
      console.log("Error fetching answers:", error);
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
        answer: answer.trim(),
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        upvotes: 0,
      });
      setAnswer("");
      // ✅ onSnapshot will update automatically - NO RELOAD NEEDED
    } catch (error) {
      console.log(error);
      alert("Failed to post answer");
    }
  };

  const handleDeleteAnswer = (answerId) => {
    setAnswers(prev => prev.filter(a => a.id !== answerId));
  };

  const handleDeleteQuestion = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (question && question.authorId !== currentUser.uid) {
      alert("You can only delete your own questions");
      return;
    }
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
        alert("Question deleted successfully!");
        navigate("/");
      } catch (error) {
        console.log(error);
        alert("Failed to delete question");
      }
    }
  };

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
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Question */}
        {question && (
          <div className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 card-hover mb-10 ${
            darkMode
              ? "bg-slate-800/80 border border-slate-700/50"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">📌 Question</span>
                {question.createdAt?.toDate() > new Date(Date.now() - 24*60*60*1000) && (
                  <span className="badge badge-success">New</span>
                )}
              </div>
              {currentUser && question.authorId === currentUser.uid && (
                <button
                  onClick={handleDeleteQuestion}
                  className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete Question"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
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
            </div>
          </div>
        )}

        {/* Answers Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            Answers
          </h2>
          <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {answers.length === 0 ? "Be the first to answer!" : `${answers.length} answers`}
          </span>
        </div>

        {answers.length === 0 ? (
          <div className={`p-8 sm:p-12 rounded-3xl text-center transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/50 border border-slate-700/50"
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
              <AnswerCard 
                key={ans.id} 
                answer={ans}
                onDeleteAnswer={handleDeleteAnswer}
              />
            ))}
          </div>
        )}

        {/* Write Answer */}
        <div className={`p-6 sm:p-8 rounded-3xl mt-10 transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border border-slate-700/50"
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
                  ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
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