import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not logged in
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, "users", userId);
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
    fetchUserProfile();
  }, [userId, currentUser, navigate]);

  // Format date properly
  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "Recently";
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate("/");
  };

  // Handle message button - redirect to private chat
  const handleMessage = () => {
    // Navigate to chat page and pass the user as selected user
    // We'll use state to pass the user data
    navigate("/chat", { state: { selectedUser: userData } });
  };

  if (!currentUser) {
    return null; // Will redirect to login
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

  if (!userData) {
    return (
      <div className={`min-h-screen flex justify-center items-center pt-20 ${
        darkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <div className={`p-10 rounded-3xl shadow-xl text-center ${
          darkMode ? "bg-slate-800" : "bg-white"
        }`}>
          <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-500">The user you're looking for doesn't exist.</p>
          <button
            onClick={handleBackToHome}
            className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Don't show message button for own profile
  const isOwnProfile = currentUser.uid === userId;

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

            {/* Member Since */}
            <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              📅 Member since {formatDate(userData?.createdAt)}
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

            {/* Buttons - Back to Home & Message */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              {/* Back to Home Button */}
              <button 
                onClick={handleBackToHome}
                className={`flex-1 py-3.5 px-4 rounded-2xl text-center font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                } hover:scale-[1.02]`}
              >
                🏠 Back to Home
              </button>
              
              {/* Message Button - Only show if not own profile */}
              {!isOwnProfile && (
                <button 
                  onClick={handleMessage}
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-center font-semibold transition-all duration-300 ${
                    darkMode
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white"
                  } hover:scale-[1.02] flex items-center justify-center gap-2`}
                >
                  <span>💬</span> Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;