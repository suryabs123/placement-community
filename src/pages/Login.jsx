
import { useState, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const { darkMode } = useContext(ThemeContext);

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/");
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

        <h2 className="text-2xl text-center mb-8">
          Welcome Back 👋
        </h2>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
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

          <div className="text-right">
            <Link
              to="/forgotpassword"
              className="text-blue-500"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          <button
            type="button"
            className="
              w-full
              border
              p-4
              rounded-xl
            "
          >
            Continue with Google
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500">
          Don't have an account?
        </p>

        <div className="flex justify-center mt-3">
          <Link
            to="/register"
            className="text-blue-600 font-bold"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

