import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";

function ChangePassword() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser) {
      setError("Please login first");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      setError("❌ New password cannot be the same as current password. Please choose a different password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      setSuccess("✅ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
      
    } catch (error) {
      console.log(error);
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later");
      } else {
        setError("Failed to change password: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!currentUser) {
      setError("Please login first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setSuccess("✅ Password reset email sent! Check your inbox.");
    } catch (error) {
      console.log(error);
      setError("Failed to send reset email");
    }
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <div className={`p-10 rounded-3xl text-center ${
          darkMode ? "bg-slate-800" : "bg-white shadow-xl"
        }`}>
          <h1 className="text-3xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-gray-500">Please login to change your password.</p>
          <Link to="/login" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-8 px-4 sm:px-8 ${
      darkMode ? "bg-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-3xl p-6 sm:p-8 ${
          darkMode ? "bg-slate-800/90 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-2xl border border-white/50"
        }`}>
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
              {currentUser?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <h1 className={`text-2xl sm:text-3xl font-bold mt-4 ${
              darkMode ? "text-white" : "text-slate-800"
            }`}>
              Change Password
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Update your account password
            </p>

            {error && (
              <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
                {success}
              </div>
            )}

            <div className={`w-full h-px my-6 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

            <form onSubmit={handleChangePassword} className="w-full space-y-5">
              <div>
                <label className={`text-sm font-medium block mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "bg-gray-50 border-gray-200 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "bg-gray-50 border-gray-200 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Re-enter New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "bg-gray-50 border-gray-200 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
                  }`}
                  required
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <div className={`w-full h-px ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3.5 rounded-2xl text-center font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                  } hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Changing...
                    </>
                  ) : (
                    <>
                      <span>🔑</span> Change Password
                    </>
                  )}
                </button>
                
                <Link
                  to="/profile"
                  className={`py-3.5 px-6 rounded-2xl text-center font-semibold transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      : "bg-gray-100 hover:bg-gray-200 text-slate-700"
                  }`}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;