import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
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

const getStoredToken = () => {
  return localStorage.getItem(
    "token"
  );
};

// =====================================================
// NAVBAR
// =====================================================

const Navbar = () => {
  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] = useState(
    getStoredUser()
  );

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const isStudent =
    user?.role ===
    "student";

  const isCounsellor =
    user?.role ===
    "counsellor";

  // ===================================================
  // CHECK LOGIN STATE
  // ===================================================

  useEffect(() => {
    const syncUser =
      () => {
        setUser(
          getStoredUser()
        );
      };

    window.addEventListener(
      "storage",
      syncUser
    );

    window.addEventListener(
      "authChanged",
      syncUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncUser
      );

      window.removeEventListener(
        "authChanged",
        syncUser
      );
    };
  }, []);

  // ===================================================
  // FETCH UNREAD NOTIFICATIONS
  // ===================================================

  useEffect(() => {
    if (!isStudent || !user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread =
      async () => {
        try {
          const token =
            getStoredToken();

          if (!token) {
            return;
          }

          const userId =
            user.id ||
            user.user_id;

          if (!userId) {
            return;
          }

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

          if (!response.ok) {
            return;
          }

          const result =
            await response.json();

          if (
            !result.success ||
            !Array.isArray(
              result.data
            )
          ) {
            return;
          }

          const count =
            result.data.filter(
              (notification) =>
                !notification.is_read
            ).length;

          setUnreadCount(
            count
          );
        } catch (error) {
          console.error(
            "Notification fetch error:",
            error
          );
        }
      };

    fetchUnread();

    const interval =
      setInterval(
        fetchUnread,
        30000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    isStudent,
    user,
  ]);

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      setUser(null);
      setUnreadCount(0);
      setMobileOpen(false);

      window.dispatchEvent(
        new Event(
          "authChanged"
        )
      );

      navigate(
        "/",
        {
          replace: true,
        }
      );
    };

  // ===================================================
  // NAV LINK STYLE
  // ===================================================

  const navLinkStyle =
    ({ isActive }) => ({
      textDecoration:
        "none",
      color: isActive
        ? "#2563eb"
        : "#475569",
      fontWeight:
        isActive
          ? 700
          : 600,
      fontSize:
        "0.9rem",
      padding:
        "0.5rem 0.65rem",
      borderRadius:
        "8px",
      transition:
        "all 0.2s ease",
      background:
        isActive
          ? "#eff6ff"
          : "transparent",
    });

  // ===================================================
  // CLOSE MOBILE MENU
  // ===================================================

  const closeMobile =
    () => {
      setMobileOpen(false);
    };

  return (
    <header
      style={{
        position:
          "sticky",
        top: 0,
        zIndex: 1000,
        background:
          "rgba(255, 255, 255, 0.96)",
        backdropFilter:
          "blur(12px)",
        borderBottom:
          "1px solid #e2e8f0",
      }}
    >
      <div
        className="container"
        style={{
          minHeight:
            "72px",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          gap:
            "1rem",
        }}
      >
        {/* =========================================
            LOGO
        ========================================= */}

        <Link
          to="/"
          onClick={
            closeMobile
          }
          style={{
            textDecoration:
              "none",
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "0.7rem",
            flexShrink:
              0,
          }}
        >
          <div
            style={{
              width:
                "40px",
              height:
                "40px",
              borderRadius:
                "11px",
              background:
                "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color:
                "#ffffff",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontWeight:
                800,
              fontSize:
                "1rem",
              boxShadow:
                "0 6px 18px rgba(37, 99, 235, 0.25)",
            }}
          >
            GY
          </div>

          <div>
            <div
              style={{
                color:
                  "#0f172a",
                fontSize:
                  "1.05rem",
                fontWeight:
                  800,
                lineHeight:
                  1.1,
              }}
            >
              Get Your Seat
            </div>

            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "0.67rem",
                fontWeight:
                  600,
                marginTop:
                  "0.2rem",
              }}
            >
              Find. Predict. Decide.
            </div>
          </div>
        </Link>

        {/* =========================================
            DESKTOP NAVIGATION
        ========================================= */}

        <nav
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "0.15rem",
            flex: 1,
            justifyContent:
              "center",
          }}
          className="desktop-navbar"
        >
          <NavLink
            to="/"
            style={
              navLinkStyle
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/colleges"
            style={
              navLinkStyle
            }
          >
            Colleges
          </NavLink>

          <NavLink
            to="/predictor"
            style={
              navLinkStyle
            }
          >
            Predictor
          </NavLink>

          <NavLink
            to="/counsellors"
            style={
              navLinkStyle
            }
          >
            Counsellors
          </NavLink>

          <NavLink
            to="/notices"
            style={
              navLinkStyle
            }
          >
            Notices
          </NavLink>

          {isStudent && (
            <NavLink
              to="/my-appointments"
              style={
                navLinkStyle
              }
            >
              Appointments
            </NavLink>
          )}

          {isCounsellor && (
            <>
              <NavLink
                to="/counsellor-dashboard"
                style={
                  navLinkStyle
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/counsellor-notices"
                style={
                  navLinkStyle
                }
              >
                Manage Notices
              </NavLink>
            </>
          )}
        </nav>

        {/* =========================================
            DESKTOP ACCOUNT AREA
        ========================================= */}

        <div
          className="desktop-navbar"
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "0.5rem",
          }}
        >
          {isStudent && (
            <Link
              to="/notifications"
              style={{
                position:
                  "relative",
                width:
                  "38px",
                height:
                  "38px",
                borderRadius:
                  "9px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                textDecoration:
                  "none",
                color:
                  "#475569",
                background:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                fontSize:
                  "1rem",
              }}
              aria-label="Notifications"
              title="Notifications"
            >
              🔔

              {unreadCount >
                0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top:
                      "-4px",
                    right:
                      "-4px",
                    minWidth:
                      "18px",
                    height:
                      "18px",
                    padding:
                      "0 4px",
                    borderRadius:
                      "999px",
                    background:
                      "#dc2626",
                    color:
                      "#ffffff",
                    fontSize:
                      "0.65rem",
                    fontWeight:
                      800,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    border:
                      "2px solid #ffffff",
                  }}
                >
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </Link>
          )}

          {isStudent && (
            <Link
              to="/profile"
              style={{
                textDecoration:
                  "none",
                color:
                  "#334155",
                fontSize:
                  "0.88rem",
                fontWeight:
                  700,
                padding:
                  "0.5rem 0.7rem",
                borderRadius:
                  "8px",
              }}
            >
              Profile
            </Link>
          )}

          {isCounsellor && (
            <Link
              to="/counsellor-profile"
              style={{
                textDecoration:
                  "none",
                color:
                  "#334155",
                fontSize:
                  "0.88rem",
                fontWeight:
                  700,
                padding:
                  "0.5rem 0.7rem",
                borderRadius:
                  "8px",
              }}
            >
              Profile
            </Link>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{
                  textDecoration:
                    "none",
                  padding:
                    "0.55rem 0.85rem",
                  fontSize:
                    "0.84rem",
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  textDecoration:
                    "none",
                  padding:
                    "0.55rem 0.85rem",
                  fontSize:
                    "0.84rem",
                }}
              >
                Get Started
              </Link>
            </>
          )}

          {user && (
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="btn btn-secondary"
              style={{
                padding:
                  "0.55rem 0.85rem",
                fontSize:
                  "0.84rem",
              }}
            >
              Logout
            </button>
          )}
        </div>

        {/* =========================================
            MOBILE MENU BUTTON
        ========================================= */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (previous) =>
                !previous
            )
          }
          className="mobile-menu-button"
          aria-label="Toggle navigation"
          style={{
            width:
              "42px",
            height:
              "42px",
            borderRadius:
              "9px",
            border:
              "1px solid #e2e8f0",
            background:
              "#ffffff",
            color:
              "#334155",
            fontSize:
              "1.25rem",
            cursor:
              "pointer",
          }}
        >
          {mobileOpen
            ? "✕"
            : "☰"}
        </button>
      </div>

      {/* ===========================================
          MOBILE NAVIGATION
      =========================================== */}

      {mobileOpen && (
        <div
          style={{
            borderTop:
              "1px solid #e2e8f0",
            background:
              "#ffffff",
            padding:
              "0.75rem 1rem 1.25rem",
          }}
          className="mobile-navbar"
        >
          <div
            className="container"
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "0.3rem",
            }}
          >
            <NavLink
              to="/"
              onClick={
                closeMobile
              }
              style={
                navLinkStyle
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/colleges"
              onClick={
                closeMobile
              }
              style={
                navLinkStyle
              }
            >
              Colleges
            </NavLink>

            <NavLink
              to="/predictor"
              onClick={
                closeMobile
              }
              style={
                navLinkStyle
              }
            >
              Predictor
            </NavLink>

            <NavLink
              to="/counsellors"
              onClick={
                closeMobile
              }
              style={
                navLinkStyle
              }
            >
              Counsellors
            </NavLink>

            <NavLink
              to="/notices"
              onClick={
                closeMobile
              }
              style={
                navLinkStyle
              }
            >
              Notices
            </NavLink>

            {isStudent && (
              <>
                <NavLink
                  to="/my-appointments"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  My Appointments
                </NavLink>

                <NavLink
                  to="/notifications"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  Notifications
                  {unreadCount >
                    0 && (
                    <span
                      style={{
                        marginLeft:
                          "0.5rem",
                        padding:
                          "0.15rem 0.45rem",
                        borderRadius:
                          "999px",
                        background:
                          "#fee2e2",
                        color:
                          "#dc2626",
                        fontSize:
                          "0.7rem",
                        fontWeight:
                          800,
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  Profile
                </NavLink>
              </>
            )}

            {isCounsellor && (
              <>
                <NavLink
                  to="/counsellor-dashboard"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/counsellor-profile"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  Profile
                </NavLink>

                <NavLink
                  to="/counsellor-availability"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  Availability
                </NavLink>

                <NavLink
                  to="/counsellor-notices"
                  onClick={
                    closeMobile
                  }
                  style={
                    navLinkStyle
                  }
                >
                  Manage Notices
                </NavLink>
              </>
            )}

            <div
              style={{
                height:
                  "1px",
                background:
                  "#e2e8f0",
                margin:
                  "0.6rem 0",
              }}
            />

            {!user && (
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap:
                    "0.5rem",
                }}
              >
                <Link
                  to="/login"
                  onClick={
                    closeMobile
                  }
                  className="btn btn-secondary"
                  style={{
                    textDecoration:
                      "none",
                    textAlign:
                      "center",
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={
                    closeMobile
                  }
                  className="btn btn-primary"
                  style={{
                    textDecoration:
                      "none",
                    textAlign:
                      "center",
                  }}
                >
                  Register
                </Link>
              </div>
            )}

            {user && (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  closeMobile();
                }}
                className="btn btn-secondary"
                style={{
                  width:
                    "100%",
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===========================================
          RESPONSIVE STYLES
      =========================================== */}

      <style>
        {`
          .mobile-menu-button,
          .mobile-navbar {
            display: none;
          }

          @media (max-width: 1050px) {
            .desktop-navbar {
              display: none !important;
            }

            .mobile-menu-button {
              display: flex !important;
              align-items: center;
              justify-content: center;
            }

            .mobile-navbar {
              display: block !important;
            }
          }

          @media (max-width: 520px) {
            header .container {
              min-height: 64px !important;
            }

            header a {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}
      </style>
    </header>
  );
};

export default Navbar;