import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

function QuestionCard({ question }) {

  const handleUpvote = async () => {
    await updateDoc(
      doc(db, "questions", question.id),
      {
        upvotes: increment(1),
      }
    );
  };

  return (
    <div
      style={{
        border: "1px solid black",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h2>{question.title}</h2>

      <p>{question.description}</p>

      <h4>Asked by: {question.author}</h4>

      <h3>👍 {question.upvotes || 0}</h3>

      <button onClick={handleUpvote}>
        Upvote
      </button>

      <br />
      <br />

      <Link to={`/question/${question.id}`}>
        <button>
          View Answers
        </button>
      </Link>
    </div>
  );
}

export default QuestionCard;