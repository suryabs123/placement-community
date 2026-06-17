import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
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

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, []);

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
    }
  };

  const fetchAnswers = async () => {
    try {
      const q = query(
        collection(db, "answers"),
        where("questionId", "==", id)
      );

      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAnswers(data);
    } catch (error) {
      console.log(error);
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
      // Add answer
      await addDoc(collection(db, "answers"), {
        questionId: id,
        answer,
        author: currentUser.displayName,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        upvotes: 0,
      });

      // Notification
      if (
        question &&
        question.authorId &&
        question.authorId !== currentUser.uid
      ) {
        await addDoc(collection(db, "notifications"), {
          userId: question.authorId,
          message: `${currentUser.displayName} answered your question.`,
          createdAt: Timestamp.now(),
          isRead: false,
        });
      }

      setAnswer("");

      fetchAnswers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-5xl mx-auto">

        {/* Question */}
        {question && (
          <div
            className={`p-8 rounded-3xl shadow-xl mb-10 ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}
          >
            <h1 className="text-4xl font-bold text-blue-600 mb-5">
              {question.title}
            </h1>

            <p className="text-gray-500 mb-5">
              {question.description}
            </p>

            <h4 className="font-semibold">
              Asked by: {question.author}
            </h4>
          </div>
        )}

        {/* Answers */}
        <h2 className="text-3xl font-bold mb-8">
          Answers ({answers.length})
        </h2>

        {answers.length === 0 ? (
          <div
            className={`p-6 rounded-2xl shadow-xl mb-10 ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}
          >
            No answers yet.
          </div>
        ) : (
          answers.map((ans) => (
            <AnswerCard
              key={ans.id}
              answer={ans}
            />
          ))
        )}

        {/* Write Answer */}
        <div
          className={`p-8 rounded-3xl shadow-xl ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6">
            Write Your Answer
          </h2>

          <form
            onSubmit={handleAnswer}
            className="space-y-5"
          >
            <textarea
              rows="6"
              placeholder="Write your answer..."
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              className="w-full p-4 rounded-xl border outline-none text-black"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl"
            >
              Post Answer
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default QuestionPage;