
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
        author:
          currentUser.displayName ||
          currentUser.email,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        upvotes: 0,
      });

      setAnswer("");
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

            <div className="text-sm text-gray-400">
              Asked by {question.author}
              <br />
              {question.createdAt
                ?.toDate()
                .toLocaleString()}
            </div>
          </div>
        )}

        {/* Answers */}
        <h2 className="text-3xl font-bold mb-8">
          Answers ({answers.length})
        </h2>

        {answers.length === 0 ? (
          <div
            className={`p-8 rounded-3xl shadow-xl mb-10 ${
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
          className={`p-8 rounded-3xl shadow-xl mt-10 ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}
        >
          <h2 className="text-3xl font-bold mb-6">
            Write Your Answer
          </h2>

          <form
            onSubmit={handleAnswer}
            className="space-y-6"
          >
            <textarea
              rows="6"
              placeholder="Write your answer..."
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              className="
                w-full p-5 rounded-2xl
                border outline-none text-black
              "
            />

            <button
              className="
                bg-blue-600 hover:bg-blue-700
                text-white px-8 py-4 rounded-2xl
              "
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

