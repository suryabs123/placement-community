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

function AnswerCard({ answer, onDeleteAnswer }) {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showReportReplyModal, setShowReportReplyModal] = useState(false);
  const [reportReplyId, setReportReplyId] = useState(null);
  const [reportReplyReason, setReportReplyReason] = useState("");

  const isAnswerAuthor = currentUser && answer.authorId === currentUser.uid;

  // Real-time replies listener - INSTANT UPDATE
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
      alert("Failed to add reply");
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

  const handleDeleteAnswer = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }
    if (window.confirm("Are you sure you want to delete this answer?")) {
      try {
        await deleteDoc(doc(db, "answers", answer.id));
        onDeleteAnswer(answer.id);
      } catch (error) {
        console.log(error);
        alert("Failed to delete answer");
      }
    }
  };

  const handleReportAnswer = async () => {
    if (!currentUser) {
      alert("Please login to report");
      return;
    }
    if (!reportReason.trim()) {
      alert("Please provide a reason");
      return;
    }
    try {
      await addDoc(collection(db, "reports"), {
        answerId: answer.id,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || currentUser.email,
        reason: reportReason,
        createdAt: Timestamp.now(),
        status: "pending",
        type: "answer",
      });
      alert("Report submitted successfully!");
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      console.log(error);
      alert("Failed to submit report");
    }
  };

  const handleReportReply = async () => {
    if (!currentUser) {
      alert("Please login to report");
      return;
    }
    if (!reportReplyReason.trim()) {
      alert("Please provide a reason");
      return;
    }
    try {
      await addDoc(collection(db, "reports"), {
        replyId: reportReplyId,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || currentUser.email,
        reason: reportReplyReason,
        createdAt: Timestamp.now(),
        status: "pending",
        type: "reply",
      });
      alert("Report submitted successfully!");
      setShowReportReplyModal(false);
      setReportReplyReason("");
      setReportReplyId(null);
    } catch (error) {
      console.log(error);
      alert("Failed to submit report");
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
      {/* Header */}
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
        <div className="flex items-center gap-2">
          {/* Report Answer Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            ⚠️ Report
          </button>
          {/* Delete Answer Button - Only for author */}
          {isAnswerAuthor && (
            <button
              onClick={handleDeleteAnswer}
              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete Answer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Answer */}
      <p className={`mb-6 leading-relaxed ${
        darkMode ? "text-slate-300" : "text-slate-600"
      }`}>
        {answer.answer}
      </p>

      <hr className={`mb-5 ${darkMode ? "border-slate-700" : "border-slate-200"}`} />

      {/* Reply Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className={`text-sm font-medium transition-all duration-300 ${
            darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
          }`}
        >
          {showReplyForm ? "− Hide Reply" : `+ Add Reply (${replies.length})`}
        </button>
        {replies.length > 0 && (
          <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            • {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>

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

      {/* Replies - Real-time with Delete & Report */}
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
                onReport={() => {
                  setReportReplyId(reply.id);
                  setShowReportReplyModal(true);
                }}
                currentUser={currentUser}
              />
            ))}
          </div>
        </>
      )}

      {/* Report Answer Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl max-w-md w-full mx-4 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}>Report Answer</h3>
            <textarea
              placeholder="Why are you reporting this answer?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className={`w-full p-3 rounded-xl border-2 outline-none transition-all duration-300 min-h-[100px] ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReportAnswer}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300"
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  darkMode ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Reply Modal */}
      {showReportReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl max-w-md w-full mx-4 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}>Report Reply</h3>
            <textarea
              placeholder="Why are you reporting this reply?"
              value={reportReplyReason}
              onChange={(e) => setReportReplyReason(e.target.value)}
              className={`w-full p-3 rounded-xl border-2 outline-none transition-all duration-300 min-h-[100px] ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReportReply}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300"
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportReplyModal(false);
                  setReportReplyReason("");
                  setReportReplyId(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  darkMode ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnswerCard;