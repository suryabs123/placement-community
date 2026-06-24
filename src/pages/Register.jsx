import { useState, useContext } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: name,
      });
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      setGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // If user doesn't exist, create a new user document
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "User",
          email: user.email,
          bio: "",
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
      }

      navigate("/login");
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-up popup was closed. Please try again.");
      } else {
        setError(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex justify-center items-center px-4 pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-3xl transition-all duration-300 ${
        darkMode
          ? "bg-slate-800/80 border border-white/5 shadow-2xl"
          : "bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20"
      }`}>
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="w-28 h-28 mx-auto mb-4 logo-hover">
            <img 
              src="/logoo.png" 
              alt="College Logo" 
              className="w-full h-full object-contain animate-logo"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#6C63FF]">CIT Placement Community</h1>
          <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Create your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full mt-1.5 p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-[#6C63FF] text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-[#6C63FF]"
              }`}
              required
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full mt-1.5 p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-[#6C63FF] text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-[#6C63FF]"
              }`}
              required
            />
          </div>

          <div>
            <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full mt-1.5 p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600 focus:border-[#6C63FF] text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-[#6C63FF]"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#3F3D9E] hover:shadow-lg hover:shadow-[#6C63FF]/25 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? "border-slate-700" : "border-slate-200"}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${darkMode ? "bg-slate-800/80 text-slate-400" : "bg-white/80 text-slate-500"}`}>
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className={`w-full py-4 rounded-xl border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
              darkMode
                ? "border-slate-700 text-slate-300 hover:bg-slate-700/50"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            } ${googleLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {googleLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></span>
                Signing up...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </>
            )}
          </button>
        </form>

        <p className={`text-center mt-8 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Already have an account?{" "}
          <Link to="/login" className="text-[#6C63FF] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;