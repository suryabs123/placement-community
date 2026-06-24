
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
            Please login to view notifications.
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
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-blue-600 mb-10">
          🔔 Notifications
        </h1>

        {notifications.length === 0 ? (
          <div
            className={`p-10 rounded-3xl shadow-xl text-center ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-3">
              No Notifications
            </h2>

            <p className="text-gray-500">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 rounded-3xl shadow-xl mb-6 ${
                darkMode
                  ? "bg-slate-800"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    w-14 h-14
                    rounded-full
                    bg-blue-600
                    text-white
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  🔔
                </div>

                <div>
                  <p className="font-medium">
                    {notification.message}
                  </p>

                  <small className="text-gray-500">
                    {notification.createdAt
                      ?.toDate()
                      .toLocaleString()}
                  </small>
                </div>

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Notifications;

