import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // GET AUTHENTICATION DATA
  // =====================================================

  const getAuthData = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      const token =
        localStorage.getItem("token");

      if (!storedUser || !token) {
        return {
          user: null,
          token: null,
        };
      }

      const parsedUser =
        JSON.parse(storedUser);

      const normalizedUser = {
        ...parsedUser,
        user_id:
          parsedUser.user_id ??
          parsedUser.id,
        id:
          parsedUser.id ??
          parsedUser.user_id,
      };

      return {
        user: normalizedUser,
        token,
      };
    } catch (error) {
      console.error(
        "Authentication data error:",
        error
      );

      return {
        user: null,
        token: null,
      };
    }
  };

  // =====================================================
  // HANDLE UNAUTHORIZED
  // =====================================================

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginData");

    navigate("/login");
  };

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      try {
        const { user, token } =
          getAuthData();

        if (
          !user ||
          !token ||
          !user.user_id
        ) {
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

        const userId =
          user.user_id;

        const response = await fetch(
          `http://localhost:5000/api/notifications/student/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (response.status === 403) {
          setError(
            "You are not authorized to view notifications."
          );
          return;
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to fetch notifications."
          );
        }

        setNotifications(
          Array.isArray(data.data)
            ? data.data
            : []
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
    []
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // =====================================================
  // MARK ONE NOTIFICATION AS READ
  // =====================================================

  const markAsRead = async (
    notificationId
  ) => {
    const { user, token } =
      getAuthData();

    if (!user || !token) {
      setError(
        "Please login to update notifications."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to update this notification."
        );
        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
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

  // =====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =====================================================

  const markAllAsRead = async () => {
    const { user, token } =
      getAuthData();

    if (
      !user ||
      !token ||
      !user.user_id
    ) {
      setError(
        "Please login to update notifications."
      );
      return;
    }

    try {
      setError("");

      const userId =
        user.user_id;

      const response = await fetch(
        `http://localhost:5000/api/notifications/student/${userId}/read-all`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to update notifications."
        );
        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read."
        );
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
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

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "";
    }

    return formattedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

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

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10">

      <div className="max-w-4xl mx-auto px-6">

        {/* HEADER */}

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

            <div className="flex items-center gap-3 flex-wrap">

              {/* REFRESH */}

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

              {/* MARK ALL */}

              {unreadCount > 0 && (
                <button
                  onClick={
                    markAllAsRead
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Mark All as Read
                </button>
              )}

            </div>

          </div>

          {/* UNREAD COUNT */}

          {unreadCount > 0 && (
            <div className="mt-4 inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
              🔵 {unreadCount} unread notification
              {unreadCount !== 1
                ? "s"
                : ""}
            </div>
          )}

          {/* ALL READ */}

          {unreadCount === 0 &&
            notifications.length > 0 && (
              <div className="mt-4 inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
                ✅ All notifications are read
              </div>
            )}

        </div>

        {/* ERROR */}

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

        {/* EMPTY STATE */}

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

        {/* NOTIFICATIONS LIST */}

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

                      {/* ICON */}

                      <div
                        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${
                          notification.is_read
                            ? "bg-gray-100"
                            : "bg-blue-100"
                        }`}
                      >
                        🔔
                      </div>

                      {/* CONTENT */}

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
                          {
                            notification.message
                          }
                        </p>

                        <p className="text-sm text-gray-400 mt-3">
                          🕐{" "}
                          {formatDate(
                            notification.created_at
                          )}
                        </p>

                      </div>

                    </div>

                    {/* MARK AS READ */}

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