import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [userData, setUserData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    // Check if profile was updated successfully
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success === 'true') {
      setToastMessage("Profile updated successfully! ✅");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentUser) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center pt-20 ${
          darkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div
          className={`p-10 rounded-3xl shadow-xl text-center ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <h1 className="text-3xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-gray-500">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-24 pb-8 px-4 sm:px-8 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
      }`}
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-up">
          <div
            className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 ${
              darkMode
                ? "bg-slate-800 border border-emerald-500/30 text-white"
                : "bg-white border border-emerald-500/30 text-slate-800"
            }`}
          >
            <span className="text-2xl">✅</span>
            <span className="font-medium flex-1">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className={`max-w-xl mx-auto p-6 sm:p-10 rounded-3xl shadow-xl ${
          darkMode ? "bg-slate-800" : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Avatar with gradient */}
          <div
            className="
              w-28 h-28 sm:w-32 sm:h-32
              rounded-full
              bg-gradient-to-br from-indigo-500 to-purple-500
              text-white
              flex items-center
              justify-center
              text-4xl sm:text-5xl
              font-bold
              shadow-xl
              ring-4 ring-white dark:ring-slate-800
              mb-6
            "
          >
            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* Name */}
          <h1
            className={`text-2xl sm:text-4xl font-bold mb-1 ${
              darkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {userData?.name}
          </h1>

          {/* Email */}
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {userData?.email}
          </p>

          {/* Member Since */}
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            📅 Member since{" "}
            {userData?.createdAt
              ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Recently"}
          </p>

          {/* Divider */}
          <div
            className={`w-full h-px my-6 ${
              darkMode ? "bg-slate-700" : "bg-gray-200"
            }`}
          ></div>

          {/* Bio */}
          <div className="w-full mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <span>📝</span>
              <span className="text-sm font-semibold uppercase tracking-wider">Bio</span>
            </div>
            <div
              className={`p-4 rounded-2xl ${
                darkMode
                  ? "bg-slate-700/30 border border-slate-700"
                  : "bg-indigo-50/50 border border-indigo-100"
              }`}
            >
              <p
                className={`text-base leading-relaxed ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {userData?.bio || "No bio added yet. Tell us about yourself!"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className={`w-full h-px my-6 ${
              darkMode ? "bg-slate-700" : "bg-gray-200"
            }`}
          ></div>

          {/* Edit Button - Gradient */}
          <Link
            to="/editprofile"
            className={`
              w-full py-3.5 rounded-2xl text-center font-semibold 
              transition-all duration-300 flex items-center justify-center gap-2
              ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
              } hover:scale-[1.02]
            `}
          >
            <span>✏️</span> Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;