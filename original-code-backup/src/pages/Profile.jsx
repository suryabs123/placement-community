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
            Please login to view your profile.
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
        className={`max-w-xl mx-auto p-10 rounded-3xl shadow-xl ${
          darkMode
            ? "bg-slate-800"
            : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center">

          {/* Avatar */}
          <div
            className="
              w-32 h-32
              rounded-full
              bg-blue-600
              text-white
              flex items-center
              justify-center
              text-5xl
              font-bold
              mb-8
            "
          >
            {userData?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Name */}
          <h1 className="text-4xl font-bold mb-4">
            {userData?.name}
          </h1>

          {/* Email */}
          <h3 className="text-gray-500 mb-8">
            {userData?.email}
          </h3>

          {/* Bio */}
          <div className="w-full mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Bio
            </h2>

            <p className="text-gray-500">
              {userData?.bio || "No bio added yet."}
            </p>
          </div>

          {/* Edit Button */}
          <Link
            to="/editprofile"
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-8
              py-3
              rounded-xl
            "
          >
            Edit Profile
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Profile;