import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CounsellorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [counsellor, setCounsellor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [notes, setNotes] = useState("");

  // =====================================================
  // GET AUTHENTICATED USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      const storedToken =
        localStorage.getItem("token");

      if (!storedUser || !storedToken) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      if (
        !parsedUser ||
        parsedUser.role !== "counsellor"
      ) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Invalid user information:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setError("");

      const storedUser =
        localStorage.getItem("user");

      const token =
        localStorage.getItem("token");

      // -------------------------------------------------
      // CHECK LOGIN
      // -------------------------------------------------

      if (!storedUser || !token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const loggedInUser =
        JSON.parse(storedUser);

      // -------------------------------------------------
      // CHECK ROLE
      // -------------------------------------------------

      if (
        !loggedInUser ||
        loggedInUser.role !== "counsellor"
      ) {
        setError(
          "Only counsellors can access this dashboard."
        );

        return;
      }

      // -------------------------------------------------
      // IMPORTANT
      //
      // The counsellor login response contains:
      //
      // user_id = users.id
      //
      // The JWT also contains:
      //
      // id = users.id
      //
      // The backend identifies the counsellor
      // from the JWT, so we don't actually need
      // to trust a URL user ID.
      //
      // We use user_id only for the existing route.
      // -------------------------------------------------

      const userId =
        loggedInUser.user_id;

      if (!userId) {
        console.error(
          "Counsellor user_id is missing:",
          loggedInUser
        );

        setError(
          "Counsellor account information is incomplete. Please log in again."
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // -------------------------------------------------
      // FETCH DASHBOARD WITH JWT
      // -------------------------------------------------

      const response = await fetch(
        `http://localhost:5000/api/counsellor-dashboard/${userId}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // -------------------------------------------------
      // HANDLE EMPTY / INVALID RESPONSE
      // -------------------------------------------------

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // -------------------------------------------------
      // TOKEN EXPIRED / INVALID
      // -------------------------------------------------

      if (
        response.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // -------------------------------------------------
      // NOT AUTHORIZED
      // -------------------------------------------------

      if (
        response.status === 403
      ) {
        setError(
          data.message ||
            "You are not authorized to access the counsellor dashboard."
        );

        return;
      }

      // -------------------------------------------------
      // OTHER API ERRORS
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load counsellor dashboard."
        );
      }

      // -------------------------------------------------
      // STORE DATA
      // -------------------------------------------------

      setCounsellor(
        data.data?.counsellor || null
      );

      setAppointments(
        data.data?.appointments || []
      );
    } catch (error) {
      console.error(
        "Counsellor dashboard error:",
        error
      );

      setError(
        error.message ||
          "Failed to load counsellor dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  const completeAppointment = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-dashboard/appointments/${id}/complete`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to complete appointment."
        );
      }

      alert(
        "Appointment marked as completed."
      );

      await fetchDashboard();
    } catch (error) {
      console.error(
        "Complete appointment error:",
        error
      );

      alert(
        error.message ||
          "Failed to complete appointment."
      );
    }
  };

  // =====================================================
  // SAVE NOTES
  // =====================================================

  const saveNotes = async () => {
    try {
      if (!selectedAppointment) {
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-dashboard/appointments/${selectedAppointment.id}/notes`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            notes: notes,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save notes."
        );
      }

      alert(
        "Consultation notes saved successfully."
      );

      setSelectedAppointment(null);
      setNotes("");

      await fetchDashboard();
    } catch (error) {
      console.error(
        "Save notes error:",
        error
      );

      alert(
        error.message ||
          "Failed to save notes."
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading counsellor dashboard...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h1 className="text-3xl font-bold text-gray-800">
                👨‍⚕️ Counsellor Dashboard
              </h1>

              {counsellor && (
                <div className="mt-4">

                  <h2 className="text-xl font-semibold text-blue-700">
                    {counsellor.full_name}
                  </h2>

                  <p className="text-gray-600 mt-1">
                    {counsellor.specialization}
                  </p>

                  <p className="text-gray-500 mt-1">
                    {counsellor.qualification} •{" "}
                    {counsellor.experience_years} years
                    experience
                  </p>

                </div>
              )}

            </div>

            {/* Dashboard Actions */}

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={() =>
                  navigate(
                    "/counsellor-availability"
                  )
                }
                className="px-5 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                🕐 Manage Availability
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/counsellor-profile"
                  )
                }
                className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                👤 My Profile
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Appointments
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {appointments.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Upcoming
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {
                appointments.filter(
                  (appointment) =>
                    appointment.status ===
                      "scheduled" ||
                    appointment.status ===
                      "rescheduled"
                ).length
              }
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Completed
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              {
                appointments.filter(
                  (appointment) =>
                    appointment.status ===
                    "completed"
                ).length
              }
            </p>

          </div>

        </div>

        {/* =================================================
            APPOINTMENTS
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              📅 Appointments
            </h2>

            <p className="text-gray-500 mt-1">
              Manage your counselling appointments.
            </p>

          </div>

          {appointments.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-5xl mb-4">
                📭
              </div>

              <h3 className="text-xl font-bold text-gray-700">
                No Appointments
              </h3>

              <p className="text-gray-500 mt-2">
                You don't have any appointments yet.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {appointments.map(
                (appointment) => (

                  <div
                    key={appointment.id}
                    className="border rounded-xl p-5 hover:shadow-md transition"
                  >

                    {/* Appointment Header */}

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                      <div>

                        <h3 className="text-xl font-bold text-gray-800">
                          👤{" "}
                          {appointment.student_name}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          {appointment.student_email}
                        </p>

                        <p className="text-gray-500">
                          📞{" "}
                          {appointment.student_phone ||
                            "Not provided"}
                        </p>

                      </div>

                      {/* Status */}

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          appointment.status ===
                          "completed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status ===
                              "cancelled"
                            ? "bg-red-100 text-red-700"
                            : appointment.status ===
                              "rescheduled"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {appointment.status
                          .charAt(0)
                          .toUpperCase() +
                          appointment.status.slice(
                            1
                          )}
                      </span>

                    </div>

                    {/* Appointment Details */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Date
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          📅{" "}
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Time
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          🕐{" "}
                          {formatTime(
                            appointment.start_time
                          )}{" "}
                          -{" "}
                          {formatTime(
                            appointment.end_time
                          )}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Preferred Course
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          🎓{" "}
                          {appointment.preferred_course ||
                            "Not specified"}
                        </p>

                      </div>

                    </div>

                    {/* Student Information */}

                    <div className="mt-5 p-4 bg-blue-50 rounded-xl">

                      <h4 className="font-bold text-blue-800">
                        Student Information
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">

                        <p>
                          <span className="font-semibold">
                            Gender:
                          </span>{" "}
                          {appointment.gender ||
                            "Not specified"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            City:
                          </span>{" "}
                          {appointment.city ||
                            "Not specified"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            State:
                          </span>{" "}
                          {appointment.state ||
                            "Not specified"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Preferred Location:
                          </span>{" "}
                          {appointment.preferred_location ||
                            "Not specified"}
                        </p>

                      </div>

                    </div>

                    {/* Existing Notes */}

                    {appointment.notes && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-xl">

                        <p className="font-semibold text-yellow-800">
                          📝 Consultation Notes
                        </p>

                        <p className="text-gray-700 mt-1">
                          {appointment.notes}
                        </p>

                      </div>
                    )}

                    {/* Action Buttons */}

                    {(appointment.status ===
                      "scheduled" ||
                      appointment.status ===
                        "rescheduled") && (

                      <div className="flex flex-wrap gap-3 mt-5">

                        <button
                          onClick={() =>
                            completeAppointment(
                              appointment.id
                            )
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          ✅ Complete
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAppointment(
                              appointment
                            );

                            setNotes(
                              appointment.notes ||
                                ""
                            );
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          📝 Add Notes
                        </button>

                      </div>
                    )}

                    {/* Edit Notes */}

                    {appointment.status ===
                      "completed" && (

                      <button
                        onClick={() => {
                          setSelectedAppointment(
                            appointment
                          );

                          setNotes(
                            appointment.notes ||
                              ""
                          );
                        }}
                        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        📝 Edit Notes
                      </button>

                    )}

                  </div>
                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* =================================================
          NOTES MODAL
      ================================================= */}

      {selectedAppointment && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold text-gray-800">
                📝 Consultation Notes
              </h2>

              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setNotes("");
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>

            <p className="text-gray-500 mt-2">

              Student:{" "}

              <span className="font-semibold">
                {
                  selectedAppointment.student_name
                }
              </span>

            </p>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows="6"
              placeholder="Enter consultation notes..."
              className="w-full mt-5 border rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setNotes("");
                }}
                className="px-4 py-2 border rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={saveNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Save Notes
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default CounsellorDashboard;