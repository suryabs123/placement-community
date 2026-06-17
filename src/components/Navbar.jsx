import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

function Navbar() {
  const { darkMode, toggleTheme } =
    useContext(ThemeContext);

  const { currentUser } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      alert("Logged out successfully!");

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav
      className={`shadow-lg px-8 py-4 flex justify-between items-center ${
        darkMode
          ? "bg-slate-800 text-white"
          : "bg-white text-black"
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-3xl font-bold text-blue-600"
      >
        Placement Community
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-6 font-medium">

        <Link to="/">🏠 Home</Link>

        <Link to="/ask">❓ Ask Question</Link>

        <Link to="/publicchat">💬 Public Chat</Link>

        <Link to="/chat">🔒 Private Chat</Link>

        <Link to="/notifications">🔔 Notifications</Link>

        <Link to="/profile">👤 Profile</Link>

        {!currentUser ? (
          <>
            <Link
              to="/login"
              className="bg-green-500 text-white px-4 py-2 rounded-xl"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="bg-indigo-500 text-white px-4 py-2 rounded-xl"
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;