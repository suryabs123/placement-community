import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase/config";

function EditProfile() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setName(docSnap.data().name || "");
        setBio(docSnap.data().bio || "");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToastMessage("Please login first", "error");
      return;
    }

    if (!name.trim()) {
      showToastMessage("Name is required", "error");
      return;
    }

    try {
      setLoading(true);
      
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
      });

      await updateDoc(doc(db, "users", currentUser.uid), {
        name: name.trim(),
        bio: bio.trim(),
      });

      showToastMessage("Profile updated successfully! ✅", "success");
      
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.log(error);
      showToastMessage("Failed to update profile: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
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
          <p className="text-gray-500">Please login to edit your profile.</p>
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
              toastType === "success"
                ? darkMode
                  ? "bg-slate-800 border border-emerald-500/30 text-white"
                  : "bg-white border border-emerald-500/30 text-slate-800"
                : darkMode
                ? "bg-slate-800 border border-red-500/30 text-white"
                : "bg-white border border-red-500/30 text-slate-800"
            }`}
          >
            <span className="text-2xl">
              {toastType === "success" ? "✅" : "❌"}
            </span>
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
        className={`max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl shadow-xl ${
          darkMode ? "bg-slate-800" : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        {/* Header with Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`
              w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 
              flex items-center justify-center text-white text-3xl font-bold 
              shadow-xl ring-4 ring-white dark:ring-slate-800 mb-4
            `}
          >
            {name?.charAt(0)?.toUpperCase() ||
              currentUser?.displayName?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-white" : "text-slate-800"
            }`}
          >
            ✏️ Edit Profile
          </h1>
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Update your personal information
          </p>
        </div>

        {/* Divider */}
        <div
          className={`w-full h-px my-6 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}
        ></div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Name */}
          <div>
            <label
              className={`font-semibold block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`
                w-full mt-1 p-4 rounded-2xl border-2 outline-none 
                transition-all duration-300
                ${
                  darkMode
                    ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 text-slate-800"
                }
              `}
              placeholder="Enter your full name"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              className={`font-semibold block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Bio
            </label>
            <textarea
              rows="6"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`
                w-full mt-1 p-4 rounded-2xl border-2 outline-none 
                transition-all duration-300 resize-none
                ${
                  darkMode
                    ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                    : "bg-gray-50 border-gray-200 focus:border-indigo-500 text-slate-800"
                }
              `}
              placeholder="Tell us something about yourself..."
            />
          </div>

          {/* Divider */}
          <div
            className={`w-full h-px my-6 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}
          ></div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`
                flex-1 py-4 rounded-2xl font-semibold 
                transition-all duration-300 flex items-center justify-center gap-2
                ${
                  darkMode
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white"
                } hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span> Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className={`
                px-8 py-4 rounded-2xl font-semibold 
                transition-all duration-300
                ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    : "bg-gray-100 hover:bg-gray-200 text-slate-700"
                }
              `}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;