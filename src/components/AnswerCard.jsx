// components/AnswerCard.jsx - Enhanced UI
import { useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  increment,
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
  const [isUpvoted, setIsUpvoted] = useState(false);

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
        reply: replyText,
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

  const handleUpvote = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    try {
      await updateDoc(doc(db, "answers", answer.id), {
        upvotes: increment(1),
      });
      setIsUpvoted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 card-hover ${
        darkMode
          ? "bg-slate-800/50 border border-white/5 hover:bg-slate-800"
          : "bg-white shadow-sm hover:shadow-xl border border-slate-100"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white font-bold text-sm">
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
        <button
          onClick={handleUpvote}
          disabled={isUpvoted}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            isUpvoted
              ? "bg-green-500 text-white"
              : darkMode
              ? "bg-slate-700 hover:bg-[#6C63FF] text-slate-300 hover:text-white"
              : "bg-slate-100 hover:bg-[#6C63FF] text-slate-600 hover:text-white"
          }`}
        >
          👍 {answer.upvotes || 0}
        </button>
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
          darkMode ? "text-[#8B83FF] hover:text-[#6C63FF]" : "text-[#6C63FF] hover:text-[#5A52D5]"
        }`}
      >
        {showReplyForm ? "− Hide Reply" : "+ Add Reply"}
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
                ? "input-modern-dark bg-slate-700/50 border-slate-600 focus:border-[#6C63FF]"
                : "input-modern border-slate-200 focus:border-[#6C63FF]"
            }`}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#6C63FF] text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/25 hover:scale-105"
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
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>
          </h4>
          <div className="space-y-3">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AnswerCard;