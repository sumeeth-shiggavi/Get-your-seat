import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

// =====================================================
// HELPERS
// =====================================================

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    return null;
  }
};

const getToken = () => {
  return localStorage.getItem(
    "token"
  );
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// =====================================================
// NOTIFICATIONS PAGE
// =====================================================

const Notifications = () => {
  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ===================================================
  // AUTH CHECK
  // ===================================================

  useEffect(() => {
    const storedUser =
      getStoredUser();

    const token =
      getToken();

    if (
      !storedUser ||
      !token
    ) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    if (
      storedUser.role !==
      "student"
    ) {
      navigate(
        "/",
        {
          replace: true,
        }
      );

      return;
    }

    setUser(
      storedUser
    );
  }, [navigate]);

  // ===================================================
  // FETCH NOTIFICATIONS
  // ===================================================

  const fetchNotifications =
    async () => {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token =
          getToken();

        const userId =
          user.id ||
          user.user_id;

        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/student/${userId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to fetch notifications."
          );
        }

        setNotifications(
          Array.isArray(
            result.data
          )
            ? result.data
            : []
        );
      } catch (err) {
        console.error(
          "Fetch notifications error:",
          err
        );

        setError(
          err.message ||
            "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // ===================================================
  // MARK ONE AS READ
  // ===================================================

  const markAsRead =
    async (
      notificationId
    ) => {
      try {
        setActionLoading(
          notificationId
        );

        setError("");
        setSuccess("");

        const token =
          getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/${notificationId}/read`,
            {
              method:
                "PATCH",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to mark notification as read."
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (
                notification
              ) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      is_read:
                        true,
                    }
                  : notification
            )
        );

        setSuccess(
          "Notification marked as read."
        );

        window.dispatchEvent(
          new Event(
            "notificationsChanged"
          )
        );
      } catch (err) {
        console.error(
          "Mark notification read error:",
          err
        );

        setError(
          err.message ||
            "Unable to update notification."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  // ===================================================
  // MARK ALL AS READ
  // ===================================================

  const markAllAsRead =
    async () => {
      try {
        setActionLoading(
          "all"
        );

        setError("");
        setSuccess("");

        const token =
          getToken();

        const userId =
          user.id ||
          user.user_id;

        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/student/${userId}/read-all`,
            {
              method:
                "PATCH",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to mark notifications as read."
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (
                notification
              ) => ({
                ...notification,
                is_read:
                  true,
              })
            )
        );

        setSuccess(
          "All notifications marked as read."
        );

        window.dispatchEvent(
          new Event(
            "notificationsChanged"
          )
        );
      } catch (err) {
        console.error(
          "Mark all notifications error:",
          err
        );

        setError(
          err.message ||
            "Unable to update notifications."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  // ===================================================
  // COUNTS
  // ===================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className="page"
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
      }}
    >
      <div className="container">
        {/* =========================================
            HEADER
        ========================================= */}

        <section
          style={{
            padding:
              "2.5rem 0 1.5rem",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap:
                "1rem",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "0.5rem",
                  marginBottom:
                    "0.6rem",
                }}
              >
                <Link
                  to="/"
                  style={{
                    color:
                      "#2563eb",
                    textDecoration:
                      "none",
                    fontSize:
                      "0.85rem",
                    fontWeight:
                      600,
                  }}
                >
                  Home
                </Link>

                <span
                  style={{
                    color:
                      "#cbd5e1",
                  }}
                >
                  /
                </span>

                <span
                  style={{
                    color:
                      "#64748b",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  Notifications
                </span>
              </div>

              <h1
                style={{
                  margin:
                    0,
                  fontSize:
                    "clamp(1.8rem, 4vw, 2.5rem)",
                  color:
                    "#0f172a",
                }}
              >
                Notifications
              </h1>

              <p
                style={{
                  margin:
                    "0.5rem 0 0",
                  color:
                    "#64748b",
                  lineHeight:
                    1.6,
                }}
              >
                Stay updated about your counselling
                appointments and important activities.
              </p>
            </div>

            {unreadCount >
              0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  markAllAsRead
                }
                disabled={
                  actionLoading ===
                  "all"
                }
              >
                {actionLoading ===
                "all"
                  ? "Updating..."
                  : "Mark All as Read"}
              </button>
            )}
          </div>
        </section>

        {/* =========================================
            ALERTS
        ========================================= */}

        {error && (
          <div
            style={{
              marginBottom:
                "1rem",
              padding:
                "0.9rem 1rem",
              borderRadius:
                "10px",
              background:
                "#fef2f2",
              border:
                "1px solid #fecaca",
              color:
                "#b91c1c",
              fontWeight:
                500,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom:
                "1rem",
              padding:
                "0.9rem 1rem",
              borderRadius:
                "10px",
              background:
                "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              color:
                "#15803d",
              fontWeight:
                500,
            }}
          >
            {success}
          </div>
        )}

        {/* =========================================
            SUMMARY
        ========================================= */}

        {!loading && (
          <div
            className="card"
            style={{
              padding:
                "1rem 1.25rem",
              marginBottom:
                "1.25rem",
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "0.75rem",
            }}
          >
            <div
              style={{
                width:
                  "42px",
                height:
                  "42px",
                borderRadius:
                  "10px",
                background:
                  unreadCount >
                  0
                    ? "#eff6ff"
                    : "#f1f5f9",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "1.1rem",
              }}
            >
              🔔
            </div>

            <div>
              <div
                style={{
                  fontWeight:
                    700,
                  color:
                    "#0f172a",
                }}
              >
                {unreadCount ===
                0
                  ? "You're all caught up"
                  : `${unreadCount} unread notification${
                      unreadCount !==
                      1
                        ? "s"
                        : ""
                    }`}
              </div>

              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "0.82rem",
                  marginTop:
                    "0.15rem",
                }}
              >
                {notifications.length} total notification
                {notifications.length !==
                1
                  ? "s"
                  : ""}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            NOTIFICATION LIST
        ========================================= */}

        {loading ? (
          <div
            className="card"
            style={{
              padding:
                "3.5rem 1.5rem",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "2rem",
                marginBottom:
                  "0.75rem",
              }}
            >
              🔔
            </div>

            <h3
              style={{
                margin:
                  "0 0 0.4rem",
                color:
                  "#0f172a",
              }}
            >
              Loading notifications...
            </h3>

            <p
              style={{
                margin:
                  0,
                color:
                  "#64748b",
              }}
            >
              Please wait.
            </p>
          </div>
        ) : notifications.length ===
          0 ? (
          <div
            className="card"
            style={{
              padding:
                "4rem 1.5rem",
              textAlign:
                "center",
              marginBottom:
                "3rem",
            }}
          >
            <div
              style={{
                width:
                  "64px",
                height:
                  "64px",
                borderRadius:
                  "50%",
                background:
                  "#eff6ff",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                margin:
                  "0 auto 1rem",
                fontSize:
                  "1.6rem",
              }}
            >
              🔔
            </div>

            <h2
              style={{
                margin:
                  "0 0 0.5rem",
                color:
                  "#0f172a",
                fontSize:
                  "1.3rem",
              }}
            >
              No notifications yet
            </h2>

            <p
              style={{
                margin:
                  "0 0 1.25rem",
                color:
                  "#64748b",
                lineHeight:
                  1.6,
              }}
            >
              We'll notify you when there are updates
              about your counselling appointments.
            </p>

            <Link
              to="/counsellors"
              className="btn btn-primary"
              style={{
                textDecoration:
                  "none",
              }}
            >
              Find a Counsellor
            </Link>
          </div>
        ) : (
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "0.8rem",
              marginBottom:
                "3rem",
            }}
          >
            {notifications.map(
              (
                notification
              ) => {
                const unread =
                  !notification.is_read;

                return (
                  <div
                    key={
                      notification.id
                    }
                    className="card"
                    style={{
                      padding:
                        "1.15rem 1.25rem",
                      borderLeft:
                        unread
                          ? "4px solid #2563eb"
                          : "4px solid #e2e8f0",
                      background:
                        unread
                          ? "#ffffff"
                          : "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between",
                        gap:
                          "1rem",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "flex-start",
                          gap:
                            "0.9rem",
                          flex:
                            1,
                        }}
                      >
                        <div
                          style={{
                            width:
                              "42px",
                            height:
                              "42px",
                            minWidth:
                              "42px",
                            borderRadius:
                              "10px",
                            background:
                              unread
                                ? "#eff6ff"
                                : "#f1f5f9",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize:
                              "1rem",
                          }}
                        >
                          {unread
                            ? "🔔"
                            : "✓"}
                        </div>

                        <div
                          style={{
                            flex:
                              1,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              flexWrap:
                                "wrap",
                              gap:
                                "0.5rem",
                              marginBottom:
                                "0.35rem",
                            }}
                          >
                            <h3
                              style={{
                                margin:
                                  0,
                                color:
                                  "#0f172a",
                                fontSize:
                                  "1rem",
                              }}
                            >
                              {
                                notification.title
                              }
                            </h3>

                            {unread && (
                              <span
                                className="badge"
                                style={{
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#1d4ed8",
                                  fontSize:
                                    "0.68rem",
                                }}
                              >
                                New
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              margin:
                                "0 0 0.5rem",
                              color:
                                "#64748b",
                              lineHeight:
                                1.6,
                              fontSize:
                                "0.9rem",
                            }}
                          >
                            {
                              notification.message
                            }
                          </p>

                          <div
                            style={{
                              color:
                                "#94a3b8",
                              fontSize:
                                "0.75rem",
                            }}
                          >
                            {formatDateTime(
                              notification.created_at
                            )}
                          </div>
                        </div>
                      </div>

                      {unread && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          disabled={
                            actionLoading ===
                            notification.id
                          }
                          style={{
                            whiteSpace:
                              "nowrap",
                            fontSize:
                              "0.78rem",
                            padding:
                              "0.5rem 0.7rem",
                          }}
                        >
                          {actionLoading ===
                          notification.id
                            ? "Updating..."
                            : "Mark Read"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;