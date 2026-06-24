import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  updateProfile,
} from "firebase/auth";
import { db, auth } from "../firebase/config";

function EditProfile() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      alert("Please login first");
      return;
    }
    try {
      setSaving(true);
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      await updateDoc(doc(db, "users", currentUser.uid), {
        name,
        bio,
      });
      // Navigate with success parameter
      navigate("/profile?success=true");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
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
            Please login to edit your profile.
          </p>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className={`p-8 sm:p-10 rounded-3xl transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border border-white/5"
            : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
        }`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#6C63FF]/25">
              ✏️
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#6C63FF]">
                Edit Profile
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Update your personal information
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/50 border-slate-600 focus:border-[#6C63FF] text-white"
                    : "border-slate-200 focus:border-[#6C63FF]"
                }`}
              />
            </div>

            <div>
              <label className={`text-sm font-medium block mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Bio
              </label>
              <textarea
                rows="6"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/50 border-slate-600 focus:border-[#6C63FF] text-white placeholder:text-slate-500"
                    : "border-slate-200 focus:border-[#6C63FF]"
                }`}
                placeholder="Tell us something about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#3F3D9E] hover:shadow-lg hover:shadow-[#6C63FF]/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {saving ? (
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;