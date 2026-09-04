import { useEffect, useState } from "react";

function Notifications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      if (!user) {
        setError("Please login to view notifications.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/student/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notifications."
        );
      }

      setNotifications(data.data || []);
    } catch (error) {
      console.error("Notifications error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) return;

      const response = await fetch(
        `http://localhost:5000/api/notifications/student/${user.id}/read-all`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🔔 Notifications
              </h1>

              <p className="text-gray-500 mt-2">
                Stay updated with your counselling activities.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {unreadCount > 0 && (
            <div className="mt-4 text-sm text-blue-600 font-semibold">
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && notifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <div className="text-5xl mb-4">
              🔕
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No Notifications
            </h2>

            <p className="text-gray-500 mt-2">
              You're all caught up!
            </p>
          </div>
        )}

        {/* Notifications */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${
                notification.is_read
                  ? "border-gray-300"
                  : "border-blue-600"
              }`}
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-4">

                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${
                      notification.is_read
                        ? "bg-gray-100"
                        : "bg-blue-100"
                    }`}
                  >
                    🔔
                  </div>

                  <div>
                    <h2
                      className={`text-lg font-bold ${
                        notification.is_read
                          ? "text-gray-700"
                          : "text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </h2>

                    <p className="text-gray-600 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-sm text-gray-400 mt-3">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                </div>

                {!notification.is_read && (
                  <button
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                    className="whitespace-nowrap px-3 py-2 text-sm bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Mark as Read
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Notifications;