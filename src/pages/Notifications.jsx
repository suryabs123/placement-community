// pages/Notifications.jsx - Enhanced UI
import { useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function Notifications() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [currentUser]);

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
            Please login to view notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text">🔔 Notifications</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Stay updated with your activity
            </p>
          </div>
          <span className={`text-sm px-4 py-2 rounded-xl ${
            darkMode
              ? "bg-slate-800 text-slate-300"
              : "bg-white shadow-md text-slate-600"
          }`}>
            {notifications.length} notifications
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className={`p-12 rounded-3xl text-center transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/50 border border-white/5"
              : "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20"
          }`}>
            <div className="text-6xl mb-4">🔕</div>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              No Notifications
            </h3>
            <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-6 rounded-3xl transition-all duration-300 animate-slide-up ${
                  darkMode
                    ? "bg-slate-800/80 border border-white/5 hover:bg-slate-800"
                    : "bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-xl border border-white/20"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#3F3D9E] flex items-center justify-center text-white text-xl">
                    🔔
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      darkMode ? "text-white" : "text-slate-800"
                    }`}>
                      {notification.message}
                    </p>
                    <p className={`text-sm mt-1 ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {notification.createdAt
                        ?.toDate()
                        .toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;