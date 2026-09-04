import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const fetchUnreadCount = async () => {
    try {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      if (user.role === "counsellor") {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/student/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const unread = (data.data || []).filter(
        (notification) => !notification.is_read
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Unread notification error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("loginData");

    navigate("/");

    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center"
          >
            <span className="text-2xl font-bold text-blue-700">
              GET YOUR SEAT
            </span>
          </Link>


          {/* Navigation */}

          <div className="flex items-center gap-6">

            {/* Home */}

            <Link
              to="/"
              className={`font-semibold transition ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Home
            </Link>


            {/* Colleges */}

            <Link
              to="/colleges"
              className={`font-semibold transition ${
                isActive("/colleges")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Colleges
            </Link>


            {/* Counsellors */}

            <Link
              to="/counsellors"
              className={`font-semibold transition ${
                isActive("/counsellors")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Counsellors
            </Link>


            {/* Counsellor Dashboard */}

            {user && user.role === "counsellor" && (
              <Link
                to="/counsellor-dashboard"
                className={`font-semibold transition ${
                  isActive("/counsellor-dashboard")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Dashboard
              </Link>
            )}


            {/* Student Profile */}

            {user && user.role !== "counsellor" && (
              <Link
                to="/profile"
                className={`font-semibold transition ${
                  isActive("/profile")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Profile
              </Link>
            )}


            {/* My Appointments */}

            {user && user.role !== "counsellor" && (
              <Link
                to="/my-appointments"
                className={`font-semibold transition ${
                  isActive("/my-appointments")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                My Appointments
              </Link>
            )}


            {/* Notifications */}

            {user && user.role !== "counsellor" && (
              <Link
                to="/notifications"
                className={`font-semibold transition flex items-center gap-2 ${
                  isActive("/notifications")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >

                <span className="text-lg">
                  🔔
                </span>

                <span>
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <span className="min-w-[22px] h-[22px] px-1.5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </Link>
            )}


            {/* About */}

            <Link
              to="/about"
              className={`font-semibold transition ${
                isActive("/about")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              About
            </Link>

          </div>


          {/* User / Login Section */}

          <div className="flex items-center gap-3">

            {user ? (
              <>

                <span className="text-gray-700 font-semibold">
                  Welcome, {user.full_name}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Logout
                </button>

              </>
            ) : (
              <>

                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Register
                </Link>

              </>
            )}

          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;