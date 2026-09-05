import { useCallback, useEffect, useState } from "react";

function Notifications() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const userId = user?.id;

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      try {
        if (!userId) {
          setError(
            "Please login to view notifications."
          );

          setLoading(false);
          return;
        }

        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          `http://localhost:5000/api/notifications/student/${userId}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch notifications."
          );
        }

        setNotifications(
          data.data || []
        );
      } catch (error) {
        console.error(
          "Notifications error:",
          error
        );

        setError(
          error.message ||
            "Failed to load notifications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );

      setError(
        error.message ||
          "Failed to mark notification as read."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!userId) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/student/${userId}/read-all`,
        {
          method: "PATCH",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map(
          (notification) => ({
            ...notification,
            is_read: true,
          })
        )
      );
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      setError(
        error.message ||
          "Failed to mark notifications as read."
      );
    }
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">

          <div className="text-5xl mb-4">
            🔔
          </div>

          <p className="text-lg text-gray-600">
            Loading notifications...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">

      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-bold text-gray-800">
                🔔 Notifications
              </h1>

              <p className="text-gray-500 mt-2">
                Stay updated with your counselling activities.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  fetchNotifications(false)
                }
                disabled={refreshing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Mark All as Read
                </button>
              )}

            </div>

          </div>

          {unreadCount > 0 && (
            <div className="mt-4 inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
              🔵 {unreadCount} unread notification
              {unreadCount !== 1
                ? "s"
                : ""}
            </div>
          )}

          {unreadCount === 0 &&
            notifications.length > 0 && (
              <div className="mt-4 inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
                ✅ All notifications are read
              </div>
            )}

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl mb-6">

            <div className="flex items-center justify-between gap-4">

              <p className="font-semibold">
                {error}
              </p>

              <button
                onClick={() =>
                  fetchNotifications(false)
                }
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
              >
                Retry
              </button>

            </div>

          </div>
        )}

        {/* Empty State */}
        {!error &&
          notifications.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-6xl mb-5">
                🔕
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                No Notifications
              </h2>

              <p className="text-gray-500 mt-2">
                You're all caught up!
              </p>

              <button
                onClick={() =>
                  fetchNotifications(false)
                }
                className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                ↻ Check Again
              </button>

            </div>
          )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-4">

            {notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl shadow-md p-5 border-l-4 transition hover:shadow-lg ${
                    notification.is_read
                      ? "border-gray-300"
                      : "border-blue-600"
                  }`}
                >

                  <div className="flex flex-col sm:flex-row items-start justify-between gap-5">

                    <div className="flex gap-4">

                      <div
                        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${
                          notification.is_read
                            ? "bg-gray-100"
                            : "bg-blue-100"
                        }`}
                      >
                        🔔
                      </div>

                      <div>

                        <div className="flex items-center gap-2 flex-wrap">

                          <h2
                            className={`text-lg font-bold ${
                              notification.is_read
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h2>

                          {!notification.is_read && (
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              NEW
                            </span>
                          )}

                        </div>

                        <p className="text-gray-600 mt-2 leading-relaxed">
                          {notification.message}
                        </p>

                        <p className="text-sm text-gray-400 mt-3">
                          🕐{" "}
                          {formatDate(
                            notification.created_at
                          )}
                        </p>

                      </div>

                    </div>

                    {!notification.is_read && (
                      <button
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                        className="whitespace-nowrap px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        ✓ Mark as Read
                      </button>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Notifications;