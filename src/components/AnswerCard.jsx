import { useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import ReplyCard from "./ReplyCard";

function AnswerCard({ answer }) {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "replies"),
      where("answerId", "==", answer.id),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReplies(data);
    });
    return () => unsubscribe();
  }, [answer.id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (!replyText.trim()) return;
    try {
      await addDoc(collection(db, "replies"), {
        answerId: answer.id,
        reply: replyText.trim(),
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
      });
      setReplyText("");
      setShowReplyForm(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (window.confirm("Are you sure you want to delete this reply?")) {
      try {
        await deleteDoc(doc(db, "replies", replyId));
      } catch (error) {
        console.log(error);
        alert("Failed to delete reply");
      }
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 card-hover ${
        darkMode
          ? "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
          : "bg-white shadow-sm hover:shadow-xl border border-slate-100"
      }`}
    >
      {/* Header - Removed Upvote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {answer.author?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div>
            <h3 className={`font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              {answer.author}
            </h3>
            <p className="text-xs text-slate-400">
              {answer.createdAt?.toDate().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {/* Upvote removed */}
      </div>

      {/* Answer */}
      <p className={`mb-6 leading-relaxed ${
        darkMode ? "text-slate-300" : "text-slate-600"
      }`}>
        {answer.answer}
      </p>

      <hr className={`mb-5 ${darkMode ? "border-slate-700" : "border-slate-200"}`} />

      {/* Reply Toggle */}
      <button
        onClick={() => setShowReplyForm(!showReplyForm)}
        className={`text-sm font-medium transition-all duration-300 ${
          darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
        }`}
      >
        {showReplyForm ? "− Hide Reply" : `+ Add Reply (${replies.length})`}
      </button>

      {/* Reply Form */}
      {showReplyForm && (
        <form
          onSubmit={handleReply}
          className="flex flex-col sm:flex-row gap-3 mt-4 mb-6"
        >
          <input
            type="text"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className={`flex-1 p-3 rounded-xl border-2 outline-none transition-all duration-300 ${
              darkMode
                ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                : "border-slate-200 focus:border-indigo-500"
            }`}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105"
          >
            Reply
          </button>
        </form>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <>
          <h4 className={`font-bold mb-4 flex items-center gap-2 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            Replies ({replies.length})
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </h4>
          <div className="space-y-3">
            {replies.map((reply) => (
              <ReplyCard 
                key={reply.id} 
                reply={reply} 
                onDelete={handleDeleteReply}
                currentUser={currentUser}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AnswerCard;