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
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setUserData({
          name: currentUser.displayName || "User",
          email: currentUser.email,
          bio: "",
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success === 'true') {
      showToast('Profile updated successfully! ✅');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  if (!currentUser && !loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <div className={`p-10 rounded-3xl text-center ${
          darkMode ? "bg-slate-800" : "bg-white shadow-xl"
        }`}>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Login Required
          </h1>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Please login to view your profile.
          </p>
          <Link to="/login" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
      }`}>
        <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-8 px-4 sm:px-8 ${
      darkMode ? "bg-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-2xl mx-auto">
        <div className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
          darkMode 
            ? "bg-slate-800/90 border border-slate-700/50 shadow-2xl" 
            : "bg-white/90 backdrop-blur-sm shadow-2xl border border-white/50"
        }`}>
          
          <div className={`h-24 sm:h-28 ${
            darkMode ? "bg-gradient-to-r from-indigo-800 to-purple-800" : "bg-gradient-to-r from-indigo-500 to-purple-500"
          }`}>
            <div className="absolute inset-0 bg-white/5"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col items-center -mt-12">
              <div className="relative">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl ring-4 ${
                  darkMode ? "ring-slate-800" : "ring-white"
                }`}>
                  {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-3 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-bold mt-4 ${
                darkMode ? "text-white" : "text-slate-800"
              }`}>
                {userData?.name || "User"}
              </h1>

              <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {userData?.email}
              </p>

              <p className={`text-xs mt-1 flex items-center gap-1.5 ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                <span>📅</span>
                Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric"
                }) : "Recently"}
              </p>

              <div className={`w-full h-px my-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

              <div className="w-full">
                <div className={`flex items-center gap-2 mb-2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  <span className="text-lg">📝</span>
                  <span className="text-sm font-semibold uppercase tracking-wider">Bio</span>
                </div>
                <div className={`p-4 rounded-2xl ${
                  darkMode ? "bg-slate-700/30 border border-slate-700" : "bg-indigo-50/50 border border-indigo-100"
                }`}>
                  <p className={`text-base leading-relaxed ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    {userData?.bio || "No bio added yet. Tell us about yourself!"}
                  </p>
                </div>
              </div>

              <div className={`w-full h-px my-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

              {/* SIMPLIFIED BUTTONS - NO CONDITIONAL STYLING */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <Link
                  to="/editprofile"
                  className="w-full sm:flex-1 py-3.5 rounded-2xl text-center font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white hover:scale-[1.02]"
                >
                  <span>✏️</span> Edit Profile
                </Link>
                <Link
                  to="/changepassword"
                  className="w-full sm:flex-1 py-3.5 rounded-2xl text-center font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:scale-[1.02] dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
                >
                  <span>🔑</span> Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;