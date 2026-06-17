import { useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  increment,
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

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    try {
      const q = query(
        collection(db, "replies"),
        where("answerId", "==", answer.id)
      );

      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReplies(data);
    } catch (error) {
      console.log(error);
    }
  };

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
        author: currentUser.displayName,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
      });

      setReplyText("");

      fetchReplies();
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`p-8 rounded-3xl shadow-xl mb-8 ${
        darkMode
          ? "bg-slate-800 text-white"
          : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-xl">
          {answer.author}
        </h3>

        <button
          onClick={handleUpvote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
        >
          👍 {answer.upvotes || 0}
        </button>
      </div>

      {/* Answer */}
      <p className="text-gray-500 mb-8">
        {answer.answer}
      </p>

      <hr className="mb-6" />

      {/* Reply Form */}
      <form
        onSubmit={handleReply}
        className="flex gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) =>
            setReplyText(e.target.value)
          }
          className="flex-1 p-4 rounded-xl border outline-none text-black"
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl"
        >
          Reply
        </button>
      </form>

      {/* Replies */}
      {replies.length > 0 && (
        <>
          <h4 className="font-bold mb-5">
            Replies ({replies.length})
          </h4>

          {replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default AnswerCard;