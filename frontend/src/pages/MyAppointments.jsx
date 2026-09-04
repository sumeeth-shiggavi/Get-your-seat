import { useEffect, useState } from "react";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");

  // Reschedule states
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleMessage, setRescheduleMessage] =
    useState("");
  const [rescheduleError, setRescheduleError] =
    useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        setError(
          "Please login to view your appointments."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/appointments/student/${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch appointments."
        );
      }

      setAppointments(data.data);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (time) => {
    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) {
      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {
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
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      const data = await response.json();

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

  const openReschedule = (appointment) => {
    setReschedulingId(appointment.id);

    setRescheduleDate(
      appointment.appointment_date
        ? appointment.appointment_date.split("T")[0]
        : ""
    );

    setRescheduleTime(
      appointment.start_time
        ? appointment.start_time.slice(0, 5)
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
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError(
        "Please select a date and time."
      );
      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {
      setRescheduleError(
        "Please login to reschedule the appointment."
      );
      return;
    }

    // Consultation duration = 30 minutes
    const startDate = new Date(
      `1970-01-01T${rescheduleTime}:00`
    );

    const endDate = new Date(
      startDate.getTime() + 30 * 60 * 1000
    );

    const endHours = String(
      endDate.getHours()
    ).padStart(2, "0");

    const endMinutes = String(
      endDate.getMinutes()
    ).padStart(2, "0");

    const endTime = `${endHours}:${endMinutes}:00`;

    setRescheduling(true);
    setRescheduleError("");
    setRescheduleMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${reschedulingId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            appointment_date:
              rescheduleDate,
            start_time:
              `${rescheduleTime}:00`,
            end_time: endTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to reschedule appointment."
        );
      }

      // Update appointment in frontend
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
                      `${rescheduleTime}:00`,
                    end_time: endTime,
                    status:
                      "rescheduled",
                  }
                : appointment
          )
      );

      setRescheduleMessage(
        "Appointment rescheduled successfully."
      );

      // Close modal after short delay
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

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

      {/* =================================================
          APPOINTMENTS
      ================================================= */}

      <section className="max-w-6xl mx-auto px-6 py-12">

        {/* Loading */}

        {loading && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              Loading your appointments...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-700 rounded-xl p-6 text-center mb-6">
            <p className="font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* Cancel message */}

        {cancelMessage && (
          <div className="max-w-xl mx-auto bg-green-100 border border-green-300 text-green-700 rounded-xl p-4 text-center mb-6">
            <p className="font-semibold">
              {cancelMessage}
            </p>
          </div>
        )}

        {/* No appointments */}

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

        {/* Appointment list */}

        {!loading &&
          appointments.length > 0 && (
            <div className="space-y-6">

              {appointments.map(
                (appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
                  >

                    {/* Top section */}

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
                              appointment.counsellor_name
                            }
                          </h2>

                          <p className="text-gray-500">
                            {
                              appointment.specialization
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

                    {/* Appointment details */}

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

                    {/* Qualification */}

                    <div className="mt-5">

                      <p className="text-sm text-gray-500 font-semibold">
                        QUALIFICATION
                      </p>

                      <p className="text-gray-800 mt-1">
                        {
                          appointment.qualification
                        }
                      </p>

                    </div>

                    {/* Notes */}

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

                    {/* Meeting link */}

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

                    {/* Action buttons */}

                    {(appointment.status ===
                      "scheduled" ||
                      appointment.status ===
                        "rescheduled") && (
                      <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap gap-3">

                        {/* Reschedule */}

                        <button
                          onClick={() =>
                            openReschedule(
                              appointment
                            )
                          }
                          className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
                        >
                          Reschedule Appointment
                        </button>

                        {/* Cancel */}

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

      {/* =================================================
          RESCHEDULE MODAL
      ================================================= */}

      {reschedulingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">

            {/* Modal header */}

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

            {/* Success */}

            {rescheduleMessage && (
              <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-3 mb-5 text-center">
                {rescheduleMessage}
              </div>
            )}

            {/* Error */}

            {rescheduleError && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-5 text-center">
                {rescheduleError}
              </div>
            )}

            {/* Date */}

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
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                disabled={rescheduling}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Time */}

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

            {/* Buttons */}

            <div className="flex gap-3">

              <button
                onClick={closeReschedule}
                disabled={rescheduling}
                className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Close
              </button>

              <button
                onClick={handleReschedule}
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