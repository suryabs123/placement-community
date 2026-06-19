import { useState, useContext } from "react";
import {
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function AskQuestion() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login first");
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        title,
        description,
        author:
          currentUser.displayName ||
          currentUser.email,

        authorId: currentUser.uid,

        createdAt: Timestamp.now(),

        upvotes: 0,
      });

      setTitle("");
      setDescription("");

      setSuccess(
        "✅ Question posted successfully!"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
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
      <div
        className={`max-w-4xl mx-auto p-10 rounded-3xl shadow-xl ${
          darkMode
            ? "bg-slate-800"
            : "bg-white"
        }`}
      >
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          ❓ Ask a Question
        </h1>

        {success && (
          <div
            className="
              bg-green-100
              text-green-700
              p-4
              rounded-xl
              mb-6
            "
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="font-semibold">
              Question Title
            </label>

            <input
              type="text"
              placeholder="Enter your question title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="
                w-full
                p-4
                mt-2
                rounded-xl
                border
                outline-none
                text-black
              "
            />
          </div>

          <div>
            <label className="font-semibold">
              Question Description
            </label>

            <textarea
              rows="8"
              placeholder="Describe your question..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="
                w-full
                p-4
                mt-2
                rounded-xl
                border
                outline-none
                text-black
              "
            />
          </div>

          <button
            type="submit"
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-8
              py-4
              rounded-xl
              font-semibold
            "
          >
            Post Question
          </button>
        </form>
      </div>
    </div>
  );
}

export default AskQuestion;