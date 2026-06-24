
import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";

import { db } from "../firebase/config";
import { ThemeContext } from "../context/ThemeContext";

function Home() {
  const { darkMode } = useContext(ThemeContext);

  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(data);
    });

    return () => unsubscribe();
  }, []);

  const filteredQuestions = questions.filter((question) =>
    question.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <h1 className="text-5xl font-bold text-blue-600 mb-3">
          CIT Placement Community
        </h1>

        <p className="text-gray-500 mb-8">
          Ask questions, share knowledge and help others.
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search Previous Posts..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
            outline-none
            text-black
            mb-10
          "
        />

        {/* Questions */}
        {filteredQuestions.length === 0 ? (
          <div
            className={`p-10 rounded-3xl shadow-xl text-center ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold">
              No matching posts found.
            </h2>

            <p className="text-gray-500 mt-3">
              Try searching with different keywords.
            </p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className={`p-8 rounded-3xl shadow-xl mb-8 ${
                darkMode
                  ? "bg-slate-800"
                  : "bg-white"
              }`}
            >
              {/* Title */}
              <h2 className="text-2xl font-bold mb-4">
                {question.title}
              </h2>

              {/* Description */}
              <p className="text-gray-500 mb-6">
                {question.description}
              </p>

              {/* Footer */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">

                <div>
                  <h4 className="font-semibold">
                    Asked by:
                  </h4>

                  <p>{question.author}</p>

                  <small className="text-gray-500">
                    {question.createdAt
                      ?.toDate()
                      .toLocaleString()}
                  </small>
                </div>

                <div className="flex items-center gap-5">
                  <div className="font-bold">
                    👍 {question.upvotes || 0}
                  </div>

                  <Link
                    to={`/question/${question.id}`}
                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-6
                      py-3
                      rounded-xl
                    "
                  >
                    View Discussion
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Home;

