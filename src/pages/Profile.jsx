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
    }
  };

  // Toast notification for success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success === 'true') {
      alert("Profile updated successfully! ✅");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <div className={`p-10 rounded-3xl shadow-xl text-center ${
          darkMode ? "bg-slate-800" : "bg-white"
        }`}>
          <h1 className="text-3xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-gray-500">Please login to view your profile.</p>
          <Link to="/login" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-8 px-4 sm:px-8 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-2xl mx-auto">
        {/* Card */}
        <div className={`rounded-3xl p-6 sm:p-8 ${
          darkMode ? "bg-slate-800/90 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-2xl border border-white/50"
        }`}>
          
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Name */}
            <h1 className={`text-2xl sm:text-3xl font-bold mt-4 ${
              darkMode ? "text-white" : "text-slate-800"
            }`}>
              {userData?.name || "User"}
            </h1>

            {/* Email */}
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {userData?.email}
            </p>

            

            {/* Divider */}
            <div className={`w-full h-px my-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

            {/* Bio */}
            <div className="w-full">
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>📝 Bio</p>
              <div className={`mt-2 p-4 rounded-2xl ${
                darkMode ? "bg-slate-700/30 border border-slate-700" : "bg-indigo-50/50 border border-indigo-100"
              }`}>
                <p className={darkMode ? "text-slate-300" : "text-slate-700"}>
                  {userData?.bio || "No bio added yet. Tell us about yourself!"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className={`w-full h-px my-5 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

            {/* Buttons - WORKING */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              {/* Edit Profile Button */}
              <Link 
                to="/editprofile"
                className="w-full sm:flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-center font-semibold transition-all duration-300"
              >
                ✏️ Edit Profile
              </Link>
              
              {/* Change Password Button */}
              <Link 
                to="/changepassword"
                className="w-full sm:flex-1 py-3.5 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl text-center font-semibold transition-all duration-300"
              >
                🔑 Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;