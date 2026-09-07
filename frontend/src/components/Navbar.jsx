import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [notificationCount, setNotificationCount] =
    useState(0);
  const [mobileOpen, setMobileOpen] =
    useState(false);

  // =====================================================
  // LOAD LOGIN DATA
  // =====================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    const storedLoginData =
      localStorage.getItem("loginData");

    const storedToken =
      localStorage.getItem("token");

    let currentUser = null;

    try {
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      } else if (storedLoginData) {
        const loginData =
          JSON.parse(storedLoginData);

        currentUser =
          loginData.user ||
          loginData.data?.user ||
          null;
      }
    } catch (error) {
      console.error(
        "Failed to read user data:",
        error
      );
    }

    setUser(currentUser);
    setToken(storedToken);
  }, []);

  // =====================================================
  // FETCH STUDENT NOTIFICATION COUNT
  // =====================================================

  useEffect(() => {
    const fetchNotificationCount =
      async () => {
        if (
          !user ||
          user.role !== "student" ||
          !token
        ) {
          setNotificationCount(0);
          return;
        }

        const userId =
          user.user_id ?? user.id;

        if (!userId) {
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE_URL}/notifications/student/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            return;
          }

          const notifications =
            data.data || [];

          const unreadCount =
            notifications.filter(
              (notification) =>
                !notification.is_read
            ).length;

          setNotificationCount(
            unreadCount
          );
        } catch (error) {
          console.error(
            "Notification fetch error:",
            error
          );
        }
      };

    fetchNotificationCount();
  }, [user, token]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginData");

    setUser(null);
    setToken(null);
    setNotificationCount(0);
    setMobileOpen(false);

    navigate("/login");
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // =====================================================
  // NAV LINK STYLE
  // =====================================================

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-slate-600 hover:text-blue-600"
    }`;

  // =====================================================
  // USER ROLE
  // =====================================================

  const isStudent =
    user?.role === "student";

  const isCounsellor =
    user?.role === "counsellor";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between">
          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <span className="text-lg font-bold">
                G
              </span>
            </div>

            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-slate-900">
                Get Your Seat
              </div>

              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Your Admission Companion
              </div>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav className="hidden items-center gap-6 lg:flex">
            <NavLink
              to="/"
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/colleges"
              className={navLinkClass}
            >
              Colleges
            </NavLink>

            <NavLink
              to="/counsellors"
              className={navLinkClass}
            >
              Counsellors
            </NavLink>

            <NavLink
              to="/about"
              className={navLinkClass}
            >
              About
            </NavLink>

            {/* STUDENT LINKS */}

            {isStudent && (
              <>
                <NavLink
                  to="/counsellor-booking"
                  className={navLinkClass}
                >
                  Book Counsellor
                </NavLink>

                <NavLink
                  to="/my-appointments"
                  className={navLinkClass}
                >
                  Appointments
                </NavLink>
              </>
            )}

            {/* COUNSELLOR LINKS */}

            {isCounsellor && (
              <>
                <NavLink
                  to="/counsellor-dashboard"
                  className={navLinkClass}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/counsellor-availability"
                  className={navLinkClass}
                >
                  Availability
                </NavLink>

                <NavLink
                  to="/counsellor-notices"
                  className={navLinkClass}
                >
                  Notices
                </NavLink>
              </>
            )}
          </nav>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="hidden items-center gap-3 md:flex">
            {/* STUDENT NOTIFICATIONS */}

            {isStudent && (
              <Link
                to="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
                aria-label="Notifications"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75c0 2.028-.673 3.906-1.81 5.414a23.85 23.85 0 0 0 5.454 1.31m5.213 0a24.255 24.255 0 0 1-5.213 0m5.213 0a3 3 0 1 1-5.213 0"
                  />
                </svg>

                {notificationCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notificationCount >
                    9
                      ? "9+"
                      : notificationCount}
                  </span>
                )}
              </Link>
            )}

            {/* PROFILE */}

            {user ? (
              <Link
                to={
                  isCounsellor
                    ? "/counsellor-profile"
                    : "/profile"
                }
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {(
                    user.full_name ||
                    user.name ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hidden xl:block max-w-[130px]">
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {user.full_name ||
                      user.name ||
                      "User"}
                  </div>

                  <div className="text-[11px] capitalize text-slate-500">
                    {user.role ||
                      "student"}
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
              >
                Login
              </Link>
            )}

            {/* LOGOUT */}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-red-600"
              >
                Logout
              </button>
            )}
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (previous) =>
                  !previous
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* ===================================================
            MOBILE NAVIGATION
        =================================================== */}

        {mobileOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/colleges"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Colleges
              </NavLink>

              <NavLink
                to="/counsellors"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Counsellors
              </NavLink>

              <NavLink
                to="/about"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                About
              </NavLink>

              {/* STUDENT MOBILE LINKS */}

              {isStudent && (
                <>
                  <NavLink
                    to="/counsellor-booking"
                    onClick={
                      closeMobileMenu
                    }
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    Book Counsellor
                  </NavLink>

                  <NavLink
                    to="/my-appointments"
                    onClick={
                      closeMobileMenu
                    }
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    My Appointments
                  </NavLink>

                  <NavLink
                    to="/notifications"
                    onClick={
                      closeMobileMenu
                    }
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    <span>
                      Notifications
                    </span>

                    {notificationCount >
                      0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {notificationCount >
                        9
                          ? "9+"
                          : notificationCount}
                      </span>
                    )}
                  </NavLink>
                </>
              )}

              {/* COUNSELLOR MOBILE LINKS */}

              {isCounsellor && (
                <>
                  <NavLink
                    to="/counsellor-dashboard"
                    onClick={
                      closeMobileMenu
                    }
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/counsellor-availability"
                    onClick={
                      closeMobileMenu
                    }
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    Availability
                  </NavLink>

                  <NavLink
                    to="/counsellor-notices"
                    onClick={
                      closeMobileMenu
                    }
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    Notice Management
                  </NavLink>
                </>
              )}

              {/* USER ACTIONS */}

              <div className="mt-3 border-t border-slate-100 pt-3">
                {user ? (
                  <>
                    <NavLink
                      to={
                        isCounsellor
                          ? "/counsellor-profile"
                          : "/profile"
                      }
                      onClick={
                        closeMobileMenu
                      }
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {(
                          user.full_name ||
                          user.name ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {user.full_name ||
                            user.name ||
                            "User"}
                        </div>

                        <div className="text-xs capitalize text-slate-500">
                          {user.role ||
                            "student"}
                        </div>
                      </div>
                    </NavLink>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="mt-1 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={
                      closeMobileMenu
                    }
                    className="btn btn-primary mx-4 flex justify-center"
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;