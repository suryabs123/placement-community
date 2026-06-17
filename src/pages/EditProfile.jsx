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
        setName(docSnap.data().name || "");
        setBio(docSnap.data().bio || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login first");
      return;
    }

    try {
      // Update Firebase Auth displayName
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      // Update Firestore
      await updateDoc(
        doc(db, "users", currentUser.uid),
        {
          name,
          bio,
        }
      );

      alert("Profile updated successfully!");

      navigate("/profile");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  if (!currentUser) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          darkMode
            ? "bg-slate-900 text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <div
          className={`p-10 rounded-3xl shadow-xl text-center ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}
        >
          <h1 className="text-3xl font-bold mb-4">
            🔒 Login Required
          </h1>

          <p className="text-gray-500">
            Please login to edit your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`max-w-3xl mx-auto p-10 rounded-3xl shadow-xl ${
          darkMode
            ? "bg-slate-800"
            : "bg-white"
        }`}
      >
        <h1 className="text-4xl font-bold text-blue-600 mb-10">
          ✏ Edit Profile
        </h1>

        <form
          onSubmit={handleSave}
          className="space-y-8"
        >
          {/* Name */}
          <div>
            <label className="font-bold">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="
                w-full
                mt-3
                p-4
                rounded-2xl
                border
                outline-none
                text-black
              "
            />
          </div>

          {/* Bio */}
          <div>
            <label className="font-bold">
              Bio
            </label>

            <textarea
              rows="6"
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              className="
                w-full
                mt-3
                p-4
                rounded-2xl
                border
                outline-none
                text-black
              "
              placeholder="Tell us something about yourself..."
            />
          </div>

          <button
            type="submit"
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-8
              py-4
              rounded-2xl
              font-semibold
            "
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;