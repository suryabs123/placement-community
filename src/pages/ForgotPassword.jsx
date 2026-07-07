import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { auth } from "../firebase/config";
import { 
  sendPasswordResetEmail, 
  fetchSignInMethodsForEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function ForgotPassword() {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsGoogleAccount(false);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        setError("❌ No account found with this email address. Please register first.");
        setLoading(false);
        return;
      }

      const isGoogle = signInMethods.includes(GoogleAuthProvider.PROVIDER_ID);
      
      if (isGoogle) {
        setIsGoogleAccount(true);
        setError("🔑 This email is linked to a Google account. Please sign in with Google or use the button below.");
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      });
      
      setSuccess(true);
      setEmail("");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.log("Forgot Password Error:", error);
      
      if (error.code === "auth/user-not-found") {
        setError("❌ No account found with this email address. Please register first.");
      } else if (error.code === "auth/invalid-email") {
        setError("❌ Invalid email address. Please check and try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("❌ Too many requests. Please try again later.");
      } else if (error.code === "auth/network-request-failed") {
        setError("❌ Network error. Please check your internet connection.");
      } else {
        setError("❌ Failed to send reset email. Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "User",
          email: user.email,
          bio: "",
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
      }

      navigate("/");
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed. Please try again.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError("Another sign-in popup is already open.");
      } else {
        setError(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex justify-center items-center px-4 pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-3xl transition-all duration-300 ${
        darkMode
          ? "bg-slate-800/80 border border-white/5 shadow-2xl"
          : "bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20"
      }`}>
        <div className="text-center mb-8">
          {/* Logo with Animation - Same as Login/Register */}
          <div className="w-28 h-28 mx-auto mb-4 logo-hover">
            <img 
              src="/logoo.png" 
              alt="College Logo" 
              className="w-full h-full object-contain animate-logo"
            />
          </div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            CIT Placement Community
          </h1>
          <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Forgot your password? No worries!
          </p>
          <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
            {isGoogleAccount && (
              <div className="mt-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
            ✅ Password reset email sent! Check your inbox and spam folder.
            <br />
            <span className="text-xs opacity-75">Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                  ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${
              (loading || success) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Sending...
              </>
            ) : success ? (
              "✅ Sent!"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className={`text-sm ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-700"}`}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;