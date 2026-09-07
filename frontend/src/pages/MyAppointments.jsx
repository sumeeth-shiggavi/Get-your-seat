import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
};

const getUserId = (user) =>
  user?.user_id ?? user?.id ?? null;

const getToken = () =>
  localStorage.getItem("token");

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(
    `${String(date).substring(0, 10)}T00:00:00`
  );

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (time) => {
  if (!time) return "—";

  const value = String(time).substring(
    0,
    5
  );

  const [hours, minutes] =
    value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
};

const getStatusClasses = (status) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-50 text-blue-700";

    case "rescheduled":
      return "bg-amber-50 text-amber-700";

    case "completed":
      return "bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};

const isAppointmentInPast = (
  appointment
) => {
  if (!appointment?.appointment_date) {
    return false;
  }

  const date = String(
    appointment.appointment_date
  ).substring(0, 10);

  const time = String(
    appointment.start_time || "00:00"
  ).substring(0, 5);

  const appointmentDateTime =
    new Date(`${date}T${time}:00`);

  if (
    Number.isNaN(
      appointmentDateTime.getTime()
    )
  ) {
    return false;
  }

  return (
    appointmentDateTime <=
    new Date()
  );
};

const getMinimumDate = () => {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMaximumDate = () => {
  const date = new Date();

  date.setDate(
    date.getDate() + 60
  );

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function MyAppointments() {
  const [user] = useState(
    getStoredUser
  );

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [rescheduleId, setRescheduleId] =
    useState(null);

  const [rescheduleForm, setRescheduleForm] =
    useState({
      appointment_date: "",
      start_time: "09:00",
      end_time: "09:30",
    });

  const [processingId, setProcessingId] =
    useState(null);

  const token = getToken();
  const userId = getUserId(user);

  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  const loadAppointments =
    async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/appointments/student/${userId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load appointments."
          );
        }

        setAppointments(
          result.data || []
        );
      } catch (err) {
        setError(
          err.message ||
            "Failed to load appointments."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAppointments();
  }, [userId, token]);

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this appointment?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setProcessingId(id);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/appointments/${id}/cancel`,
            {
              method: "PATCH",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to cancel appointment."
          );
        }

        setSuccess(
          "Appointment cancelled successfully."
        );

        await loadAppointments();
      } catch (err) {
        setError(
          err.message ||
            "Failed to cancel appointment."
        );
      } finally {
        setProcessingId(null);
      }
    };

  // =====================================================
  // OPEN RESCHEDULE
  // =====================================================

  const openReschedule =
    (appointment) => {
      setError("");
      setSuccess("");

      setRescheduleId(
        appointment.id
      );

      setRescheduleForm({
        appointment_date:
          String(
            appointment.appointment_date
          ).substring(0, 10),

        start_time:
          String(
            appointment.start_time
          ).substring(0, 5),

        end_time:
          String(
            appointment.end_time
          ).substring(0, 5),
      });
    };

  // =====================================================
  // RESCHEDULE FORM
  // =====================================================

  const handleRescheduleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setRescheduleForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };

  // =====================================================
  // RESCHEDULE
  // =====================================================

  const handleReschedule =
    async (event) => {
      event.preventDefault();

      if (!rescheduleId) {
        return;
      }

      setError("");
      setSuccess("");

      const {
        appointment_date,
        start_time,
        end_time,
      } = rescheduleForm;

      if (
        !appointment_date ||
        !start_time ||
        !end_time
      ) {
        setError(
          "Please select a date and time."
        );
        return;
      }

      const startParts =
        start_time.split(":");

      const endParts =
        end_time.split(":");

      const startMinutes =
        Number(startParts[0]) * 60 +
        Number(startParts[1]);

      const endMinutes =
        Number(endParts[0]) * 60 +
        Number(endParts[1]);

      if (
        endMinutes - startMinutes !==
        30
      ) {
        setError(
          "Appointments must be exactly 30 minutes."
        );
        return;
      }

      if (
        startMinutes % 30 !== 0
      ) {
        setError(
          "Please select a time on a 30-minute boundary."
        );
        return;
      }

      try {
        setProcessingId(
          rescheduleId
        );

        const response =
          await fetch(
            `${API_BASE_URL}/appointments/${rescheduleId}/reschedule`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                appointment_date,
                start_time,
                end_time,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to reschedule appointment."
          );
        }

        setSuccess(
          "Appointment rescheduled successfully."
        );

        setRescheduleId(null);

        await loadAppointments();
      } catch (err) {
        setError(
          err.message ||
            "Failed to reschedule appointment."
        );
      } finally {
        setProcessingId(null);
      }
    };

  // =====================================================
  // AUTH CHECK
  // =====================================================

  if (!token || !userId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🔐
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Login Required
            </h1>

            <p className="mt-3 text-slate-600">
              Please login to view your
              counselling appointments.
            </p>

            <a
              href="/login"
              className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
              <span>📅</span>
              Counselling
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Appointments
            </h1>

            <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
              View, reschedule and cancel
              your counselling appointments.
            </p>
          </div>
        </section>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <div className="flex items-start gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            <div className="flex items-start gap-3">
              <span>✓</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading appointments...
              </p>
            </div>
          </div>
        ) : appointments.length ===
          0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📅
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              No appointments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Book a counselling session
              with one of our verified
              counsellors to get personalised
              admission guidance.
            </p>

            <a
              href="/counsellors"
              className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Find a Counsellor
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map(
              (appointment) => {
                const canModify =
                  appointment.status ===
                    "scheduled" ||
                  appointment.status ===
                    "rescheduled";

                const past =
                  isAppointmentInPast(
                    appointment
                  );

                const canCancel =
                  canModify && !past;

                return (
                  <article
                    key={appointment.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* TOP */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                          👨‍🏫
                        </div>

                        <div>
                          <h2 className="font-bold text-slate-900">
                            {appointment.counsellor_name ||
                              "Counsellor"}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {appointment.specialization ||
                              "Admission Counselling"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(
                          appointment.status
                        )}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Date
                        </p>

                        <p className="mt-2 font-bold text-slate-900">
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Time
                        </p>

                        <p className="mt-2 font-bold text-slate-900">
                          {formatTime(
                            appointment.start_time
                          )}{" "}
                          –{" "}
                          {formatTime(
                            appointment.end_time
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Qualification
                        </p>

                        <p className="mt-2 font-bold text-slate-900">
                          {appointment.qualification ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    {/* NOTES */}
                    {appointment.notes && (
                      <div className="mx-5 mb-5 rounded-2xl border border-slate-200 bg-white p-4 sm:mx-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Notes
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    {canModify && (
                      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-xs text-slate-500">
                          {past
                            ? "This appointment has already started."
                            : "You can reschedule or cancel this appointment."}
                        </p>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={
                              past ||
                              processingId ===
                                appointment.id
                            }
                            onClick={() =>
                              openReschedule(
                                appointment
                              )
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reschedule
                          </button>

                          <button
                            type="button"
                            disabled={
                              !canCancel ||
                              processingId ===
                                appointment.id
                            }
                            onClick={() =>
                              handleCancel(
                                appointment.id
                              )
                            }
                            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingId ===
                            appointment.id
                              ? "Processing..."
                              : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* MEETING */}
                    {appointment.meeting_link &&
                      appointment.status !==
                        "cancelled" && (
                        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                          <a
                            href={
                              appointment.meeting_link
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* RESCHEDULE MODAL */}
        {rescheduleId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Reschedule Appointment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a new date and
                  30-minute time slot.
                </p>
              </div>

              <form
                onSubmit={
                  handleReschedule
                }
                className="space-y-5"
              >
                {/* DATE */}
                <div>
                  <label
                    htmlFor="appointment_date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New Date
                  </label>

                  <input
                    id="appointment_date"
                    name="appointment_date"
                    type="date"
                    min={getMinimumDate()}
                    max={getMaximumDate()}
                    value={
                      rescheduleForm.appointment_date
                    }
                    onChange={
                      handleRescheduleChange
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* START */}
                <div>
                  <label
                    htmlFor="start_time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Start Time
                  </label>

                  <input
                    id="start_time"
                    name="start_time"
                    type="time"
                    step="1800"
                    value={
                      rescheduleForm.start_time
                    }
                    onChange={
                      handleRescheduleChange
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* END */}
                <div>
                  <label
                    htmlFor="end_time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    End Time
                  </label>

                  <input
                    id="end_time"
                    name="end_time"
                    type="time"
                    step="1800"
                    value={
                      rescheduleForm.end_time
                    }
                    onChange={
                      handleRescheduleChange
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
                  💡 The selected time must
                  be exactly 30 minutes and
                  must fall within the
                  counsellor's availability.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRescheduleId(null)
                    }
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={
                      processingId ===
                      rescheduleId
                    }
                    className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId ===
                    rescheduleId
                      ? "Saving..."
                      : "Reschedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyAppointments;