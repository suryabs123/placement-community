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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Check for success message from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success === 'true') {
      showToast('Profile updated successfully! ✅');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Toast notification function
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-4 z-50 p-4 rounded-xl shadow-2xl animate-slide-up flex items-center gap-3 ${
      darkMode 
        ? 'bg-slate-800 border border-emerald-500/30 text-white' 
        : 'bg-white border border-emerald-500/30 text-slate-800'
    }`;
    toast.innerHTML = `
      <span class="text-2xl">✅</span>
      <span class="font-medium">${message}</span>
      <button onclick="this.parentElement.remove()" class="ml-4 text-slate-400 hover:text-slate-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
      }`}>
        <div className={`p-10 rounded-3xl text-center ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl"
        }`}>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Login Required
          </h1>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Please login to view your profile.
          </p>
          <Link to="/login" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#3F3D9E] hover:shadow-lg hover:shadow-[#6C63FF]/25 transition-all duration-300">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
      }`}>
        <div className="w-12 h-12 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className={`p-8 sm:p-10 rounded-3xl transition-all duration-300 card-hover ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
        }`}>
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-[#6C63FF]/25">
                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-slate-800 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>

            {/* Name */}
            <h1 className={`text-3xl sm:text-4xl font-bold mt-6 ${
              darkMode ? "text-white" : "text-slate-800"
            }`}>
              {userData?.name || "User"}
            </h1>

            {/* Email */}
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {userData?.email}
            </p>

            {/* Member Since */}
            <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
              }) : "Recently"}
            </p>

            {/* Bio */}
            <div className="w-full mt-8 p-6 rounded-2xl bg-slate-100 dark:bg-slate-700/30">
              <h2 className={`text-sm font-semibold mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                📝 Bio
              </h2>
              <p className={darkMode ? "text-slate-300" : "text-slate-700"}>
                {userData?.bio || "No bio added yet. Tell us about yourself!"}
              </p>
            </div>

            {/* Stats Section - REMOVED */}

            {/* Edit Button */}
            <Link
              to="/editprofile"
              className="w-full mt-8 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#3F3D9E] hover:shadow-lg hover:shadow-[#6C63FF]/25 transition-all duration-300 text-center"
            >
              ✏️ Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;