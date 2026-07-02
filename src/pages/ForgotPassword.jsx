import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { auth } from "../firebase/config";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";

function ForgotPassword() {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        setError("No account found with this email address. Please register first.");
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      });
      
      setSuccess(true);
      setEmail("");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.log("Forgot Password Error:", error);
      
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address. Please register first.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address. Please check and try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Failed to send reset email. Error: " + error.message);
      }
    } finally {
      setLoading(false);
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25 p-2">
            <img 
              src="/logoo.png" 
              alt="College Logo" 
              className="w-full h-full object-contain rounded-xl"
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