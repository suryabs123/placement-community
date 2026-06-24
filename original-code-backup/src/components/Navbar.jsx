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

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav
      className={`shadow-lg px-8 py-4 flex justify-between items-center sticky top-0 z-50 ${
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
        CIT Placement Community
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-6 font-medium">

        <Link
          to="/"
          className="hover:text-blue-600"
        >
          🏠 Home
        </Link>

        <Link
          to="/ask"
          className="hover:text-blue-600"
        >
          ❓ Ask Question
        </Link>

        <Link
          to="/publicchat"
          className="hover:text-blue-600"
        >
          💬 Public Chat
        </Link>

        <Link
          to="/chat"
          className="hover:text-blue-600"
        >
          🔒 Private Chat
        </Link>

        <Link
          to="/notifications"
          className="hover:text-blue-600"
        >
          🔔 Notifications
        </Link>

        <Link
          to="/profile"
          className="hover:text-blue-600"
        >
          👤 Profile
        </Link>

        {!currentUser ? (
          <>
            <Link
              to="/login"
              className="
                bg-green-500
                hover:bg-green-600
                text-white
                px-4 py-2
                rounded-xl
              "
            >
              Login
            </Link>

            <Link
              to="/register"
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-4 py-2
                rounded-xl
              "
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="
              bg-red-500
              hover:bg-red-600
              text-white
              px-4 py-2
              rounded-xl
            "
          >
            Logout
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="
            bg-indigo-500
            hover:bg-indigo-600
            text-white
            px-4 py-2
            rounded-xl
          "
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;