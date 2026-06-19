
import { useState, useContext } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const { darkMode } = useContext(ThemeContext);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName: name,
        }
      );

      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          name,
          email,
          bio: "",
          createdAt: new Date(),
        }
      );

      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex justify-center items-center px-5 ${
        darkMode
          ? "bg-slate-900"
          : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-md p-10 rounded-3xl shadow-xl ${
          darkMode
            ? "bg-slate-800 text-white"
            : "bg-white"
        }`}
      >
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
          CIT Placement Community
        </h1>

        <h2 className="text-2xl text-center mb-4">
          Create Account 🚀
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Any valid email address can be used.
        </p>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full p-4 rounded-xl border outline-none text-black"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-4 rounded-xl border outline-none text-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-4 rounded-xl border outline-none text-black"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl"
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500">
          Already have an account?
        </p>

        <div className="flex justify-center mt-3">
          <Link
            to="/login"
            className="text-blue-600 font-bold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

