import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");

  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // =====================================================
  // GET LOGGED-IN USER + TOKEN
  // =====================================================

  const getAuthData = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        return {
          user: null,
          token: null,
        };
      }

      const user = JSON.parse(storedUser);

      const normalizedUser = {
        ...user,
        user_id: user.user_id ?? user.id,
        id: user.id ?? user.user_id,
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
  // FETCH APPOINTMENTS
  // =====================================================

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const { user, token } = getAuthData();

      if (!user || !token || !user.user_id) {
        setError(
          "Please login to view your appointments."
        );
        setLoading(false);
        return;
      }

      const userId = user.user_id;

      const response = await fetch(
        `http://localhost:5000/api/appointments/student/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to view appointments."
        );
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch appointments."
        );
      }

      setAppointments(
        Array.isArray(data.data)
          ? data.data
          : []
      );
    } catch (err) {
      console.error(
        "Appointment fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const formattedDate = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "Not available";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date(
      1970,
      0,
      1,
      Number(hours),
      Number(minutes)
    );

    if (Number.isNaN(date.getTime())) {
      return time;
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "rescheduled":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  const handleCancel = async (
    appointmentId
  ) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) {
      return;
    }

    const { user, token } =
      getAuthData();

    if (!user || !token) {
      setError(
        "Please login to cancel the appointment."
      );
      return;
    }

    setCancellingId(appointmentId);
    setCancelMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to cancel this appointment."
        );
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to cancel appointment."
        );
      }

      setCancelMessage(
        "Appointment cancelled successfully."
      );

      setAppointments(
        (previousAppointments) =>
          previousAppointments.map(
            (appointment) =>
              appointment.id === appointmentId
                ? {
                    ...appointment,
                    status: "cancelled",
                  }
                : appointment
          )
      );
    } catch (err) {
      console.error(
        "Cancel appointment error:",
        err
      );

      setError(
        err.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================================
  // OPEN RESCHEDULE MODAL
  // =====================================================

  const openReschedule = (
    appointment
  ) => {
    setReschedulingId(
      appointment.id
    );

    setRescheduleDate(
      appointment.appointment_date
        ? String(
            appointment.appointment_date
          ).split("T")[0]
        : ""
    );

    setRescheduleTime(
      appointment.start_time
        ? String(
            appointment.start_time
          ).slice(0, 5)
        : ""
    );

    setRescheduleMessage("");
    setRescheduleError("");
    setError("");
  };

  // =====================================================
  // CLOSE RESCHEDULE MODAL
  // =====================================================

  const closeReschedule = () => {
    if (rescheduling) {
      return;
    }

    setReschedulingId(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleMessage("");
    setRescheduleError("");
  };

  // =====================================================
  // RESCHEDULE APPOINTMENT
  // =====================================================

  const handleReschedule = async () => {
    if (
      !rescheduleDate ||
      !rescheduleTime
    ) {
      setRescheduleError(
        "Please select a date and time."
      );
      return;
    }

    const { user, token } =
      getAuthData();

    if (!user || !token) {
      setRescheduleError(
        "Please login to reschedule the appointment."
      );
      return;
    }

    // =================================================
    // CONSULTATION DURATION = 30 MINUTES
    // =================================================

    const [
      selectedHours,
      selectedMinutes,
    ] = rescheduleTime
      .split(":")
      .map(Number);

    const startTotalMinutes =
      selectedHours * 60 +
      selectedMinutes;

    const endTotalMinutes =
      startTotalMinutes + 30;

    const endHours =
      Math.floor(
        endTotalMinutes / 60
      ) % 24;

    const endMinutes =
      endTotalMinutes % 60;

    const endTime =
      `${String(endHours).padStart(
        2,
        "0"
      )}:${String(endMinutes).padStart(
        2,
        "0"
      )}:00`;

    const startTime =
      `${rescheduleTime}:00`;

    setRescheduling(true);
    setRescheduleError("");
    setRescheduleMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${reschedulingId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointment_date:
              rescheduleDate,
            start_time: startTime,
            end_time: endTime,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setRescheduleError(
          "You are not authorized to reschedule this appointment."
        );
        return;
      }

      if (response.status === 409) {
        setRescheduleError(
          data.message ||
            "This counsellor already has an appointment during the selected time."
        );
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to reschedule appointment."
        );
      }

      setAppointments(
        (previousAppointments) =>
          previousAppointments.map(
            (appointment) =>
              appointment.id ===
              reschedulingId
                ? {
                    ...appointment,
                    appointment_date:
                      rescheduleDate,
                    start_time:
                      startTime,
                    end_time:
                      endTime,
                    status:
                      "rescheduled",
                  }
                : appointment
          )
      );

      setRescheduleMessage(
        "Appointment rescheduled successfully."
      );

      setTimeout(() => {
        setReschedulingId(null);
        setRescheduleDate("");
        setRescheduleTime("");
        setRescheduleMessage("");
      }, 1200);
    } catch (err) {
      console.error(
        "Reschedule appointment error:",
        err
      );

      setRescheduleError(
        err.message ||
          "Unable to reschedule appointment."
      );
    } finally {
      setRescheduling(false);
    }
  };

  // =====================================================
  // TODAY'S DATE
  // =====================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <section className="bg-blue-700 text-white py-14">
        <div className="max-w-6xl mx-auto px-6">

          <h1 className="text-4xl font-bold">
            My Appointments
          </h1>

          <p className="mt-3 text-blue-100 text-lg">
            View and manage your counselling
            consultations
          </p>

        </div>
      </section>

      {/* APPOINTMENTS */}

      <section className="max-w-6xl mx-auto px-6 py-12">

        {/* LOADING */}

        {loading && (
          <div className="text-center py-16">

            <p className="text-xl text-gray-600">
              Loading your appointments...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-700 rounded-xl p-6 text-center mb-6">

            <p className="font-semibold">
              {error}
            </p>

            <button
              onClick={() => {
                setError("");
                fetchAppointments();
              }}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>

          </div>
        )}

        {/* CANCEL MESSAGE */}

        {cancelMessage && (
          <div className="max-w-xl mx-auto bg-green-100 border border-green-300 text-green-700 rounded-xl p-4 text-center mb-6">

            <p className="font-semibold">
              {cancelMessage}
            </p>

          </div>
        )}

        {/* NO APPOINTMENTS */}

        {!loading &&
          !error &&
          appointments.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">

              <div className="text-6xl mb-5">
                📅
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                No Appointments Yet
              </h2>

              <p className="text-gray-500 mt-3">
                You haven't booked any counselling
                consultations yet.
              </p>

            </div>
          )}

        {/* APPOINTMENT LIST */}

        {!loading &&
          appointments.length > 0 && (
            <div className="space-y-6">

              {appointments.map(
                (appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
                  >

                    {/* TOP SECTION */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">

                          <span className="text-3xl">
                            👨‍🏫
                          </span>

                        </div>

                        <div>

                          <h2 className="text-xl font-bold text-gray-900">
                            {
                              appointment.counsellor_name ||
                              "Counsellor"
                            }
                          </h2>

                          <p className="text-gray-500">
                            {
                              appointment.specialization ||
                              "Career Counselling"
                            }
                          </p>

                        </div>

                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusStyle(
                          appointment.status
                        )}`}
                      >
                        {
                          appointment.status
                        }
                      </span>

                    </div>

                    {/* APPOINTMENT DETAILS */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7 pt-6 border-t border-gray-200">

                      <div>

                        <p className="text-sm text-gray-500 font-semibold">
                          DATE
                        </p>

                        <p className="text-gray-900 font-medium mt-1">
                          📅{" "}
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500 font-semibold">
                          TIME
                        </p>

                        <p className="text-gray-900 font-medium mt-1">
                          ⏰{" "}
                          {formatTime(
                            appointment.start_time
                          )}
                          {" - "}
                          {formatTime(
                            appointment.end_time
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500 font-semibold">
                          CONSULTATION FEE
                        </p>

                        <p className="text-blue-700 font-bold mt-1">
                          ₹
                          {
                            appointment.consultation_fee
                          }
                        </p>

                      </div>

                    </div>

                    {/* QUALIFICATION */}

                    <div className="mt-5">

                      <p className="text-sm text-gray-500 font-semibold">
                        QUALIFICATION
                      </p>

                      <p className="text-gray-800 mt-1">
                        {
                          appointment.qualification ||
                          "Not provided"
                        }
                      </p>

                    </div>

                    {/* EXPERIENCE */}

                    {appointment.experience_years !==
                      undefined &&
                      appointment.experience_years !==
                        null && (
                        <div className="mt-5">

                          <p className="text-sm text-gray-500 font-semibold">
                            EXPERIENCE
                          </p>

                          <p className="text-gray-800 mt-1">
                            {
                              appointment.experience_years
                            }{" "}
                            years
                          </p>

                        </div>
                      )}

                    {/* NOTES */}

                    {appointment.notes && (
                      <div className="mt-5 bg-gray-50 rounded-xl p-4">

                        <p className="text-sm text-gray-500 font-semibold">
                          YOUR QUERY
                        </p>

                        <p className="text-gray-700 mt-1">
                          {
                            appointment.notes
                          }
                        </p>

                      </div>
                    )}

                    {/* MEETING LINK */}

                    {appointment.meeting_link &&
                      appointment.status !==
                        "cancelled" && (
                        <div className="mt-5">

                          <a
                            href={
                              appointment.meeting_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Join Consultation
                          </a>

                        </div>
                      )}

                    {/* ACTION BUTTONS */}

                    {(appointment.status ===
                      "scheduled" ||
                      appointment.status ===
                        "rescheduled") && (
                      <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap gap-3">

                        {/* RESCHEDULE */}

                        <button
                          onClick={() =>
                            openReschedule(
                              appointment
                            )
                          }
                          disabled={
                            cancellingId ===
                            appointment.id
                          }
                          className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reschedule Appointment
                        </button>

                        {/* CANCEL */}

                        <button
                          onClick={() =>
                            handleCancel(
                              appointment.id
                            )
                          }
                          disabled={
                            cancellingId ===
                            appointment.id
                          }
                          className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId ===
                          appointment.id
                            ? "Cancelling..."
                            : "Cancel Appointment"}
                        </button>

                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          )}

      </section>

      {/* RESCHEDULE MODAL */}

      {reschedulingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Reschedule Appointment
                </h2>

                <p className="text-gray-500 mt-1">
                  Select a new date and time
                </p>

              </div>

              <button
                onClick={closeReschedule}
                disabled={rescheduling}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>

            {/* SUCCESS */}

            {rescheduleMessage && (
              <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-3 mb-5 text-center">
                {rescheduleMessage}
              </div>
            )}

            {/* ERROR */}

            {rescheduleError && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-5 text-center">
                {rescheduleError}
              </div>
            )}

            {/* DATE */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Date
              </label>

              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) =>
                  setRescheduleDate(
                    e.target.value
                  )
                }
                min={today}
                disabled={rescheduling}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* TIME */}

            <div className="mb-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Time
              </label>

              <input
                type="time"
                value={rescheduleTime}
                onChange={(e) =>
                  setRescheduleTime(
                    e.target.value
                  )
                }
                disabled={rescheduling}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-sm text-gray-500 mt-2">
                Consultation duration: 30 minutes
              </p>

            </div>

            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                onClick={closeReschedule}
                disabled={rescheduling}
                className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Close
              </button>

              <button
                onClick={
                  handleReschedule
                }
                disabled={rescheduling}
                className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rescheduling
                  ? "Rescheduling..."
                  : "Confirm Reschedule"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default MyAppointments;