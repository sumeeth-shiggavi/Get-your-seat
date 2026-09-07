import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    return null;
  }
};

const getUserId = (user) => {
  return (
    user?.user_id ??
    user?.id ??
    null
  );
};

const getToken = () => {
  return localStorage.getItem(
    "token"
  );
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(
      `${String(date).substring(
        0,
        10
      )}T00:00:00`
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(date);
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (time) => {
  if (!time) {
    return "—";
  }

  const parts = String(time)
    .substring(0, 5)
    .split(":")
    .map(Number);

  if (
    parts.length < 2 ||
    Number.isNaN(parts[0]) ||
    Number.isNaN(parts[1])
  ) {
    return String(time);
  }

  const hours = parts[0];
  const minutes = parts[1];

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
};

const getStatusClass = (status) => {
  switch (
    String(status).toLowerCase()
  ) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    case "rescheduled":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const isToday = (date) => {
  if (!date) {
    return false;
  }

  const today =
    new Date();

  const selected =
    new Date(
      `${String(date).substring(
        0,
        10
      )}T00:00:00`
    );

  return (
    today.getFullYear() ===
      selected.getFullYear() &&
    today.getMonth() ===
      selected.getMonth() &&
    today.getDate() ===
      selected.getDate()
  );
};

const isUpcoming = (appointment) => {
  if (
    !appointment?.appointment_date
  ) {
    return false;
  }

  const appointmentDate =
    new Date(
      `${String(
        appointment.appointment_date
      ).substring(
        0,
        10
      )}T${
        String(
          appointment.start_time ||
            "00:00"
        ).substring(0, 5)
      }:00`
    );

  return (
    !Number.isNaN(
      appointmentDate.getTime()
    ) &&
    appointmentDate >= new Date() &&
    ![
      "completed",
      "cancelled",
    ].includes(
      String(
        appointment.status
      ).toLowerCase()
    )
  );
};

export default function CounsellorDashboard() {
  const [user, setUser] =
    useState(null);

  const [dashboard, setDashboard] =
    useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [notes, setNotes] =
    useState({});

  useEffect(() => {
    const storedUser =
      getStoredUser();

    if (!storedUser) {
      setError(
        "Please log in to access the counsellor dashboard."
      );

      setLoading(false);

      return;
    }

    if (
      storedUser.role &&
      storedUser.role !==
        "counsellor"
    ) {
      setError(
        "Only counsellors can access this dashboard."
      );

      setLoading(false);

      return;
    }

    setUser(storedUser);
  }, []);

  const loadDashboard =
    async () => {
      const storedUser =
        getStoredUser();

      const userId =
        getUserId(storedUser);

      const token =
        getToken();

      if (!userId || !token) {
        setError(
          "Authentication information is missing. Please log in again."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-dashboard/${userId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load dashboard."
          );
        }

        const dashboardData =
          result.data || {};

        setDashboard(
          dashboardData
        );

        const appointmentData =
          dashboardData.appointments ||
          [];

        setAppointments(
          appointmentData
        );

        const initialNotes = {};

        appointmentData.forEach(
          (appointment) => {
            initialNotes[
              appointment.id
            ] =
              appointment.notes ||
              "";
          }
        );

        setNotes(initialNotes);
      } catch (requestError) {
        console.error(
          "Dashboard loading error:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const filteredAppointments =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const studentName =
            String(
              appointment.student_name ||
                appointment.full_name ||
                ""
            ).toLowerCase();

          const studentEmail =
            String(
              appointment.student_email ||
                appointment.email ||
                ""
            ).toLowerCase();

          const status =
            String(
              appointment.status ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !searchValue ||
            studentName.includes(
              searchValue
            ) ||
            studentEmail.includes(
              searchValue
            );

          const matchesStatus =
            statusFilter === "all" ||
            status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      appointments,
      search,
      statusFilter,
    ]);

  const stats = useMemo(() => {
    const total =
      appointments.length;

    const scheduled =
      appointments.filter(
        (appointment) =>
          [
            "scheduled",
            "rescheduled",
          ].includes(
            String(
              appointment.status
            ).toLowerCase()
          )
      ).length;

    const completed =
      appointments.filter(
        (appointment) =>
          String(
            appointment.status
          ).toLowerCase() ===
          "completed"
      ).length;

    const cancelled =
      appointments.filter(
        (appointment) =>
          String(
            appointment.status
          ).toLowerCase() ===
          "cancelled"
      ).length;

    const today =
      appointments.filter(
        (appointment) =>
          isToday(
            appointment.appointment_date
          ) &&
          ![
            "completed",
            "cancelled",
          ].includes(
            String(
              appointment.status
            ).toLowerCase()
          )
      ).length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      today,
    };
  }, [appointments]);

  const handleComplete =
    async (appointmentId) => {
      const token =
        getToken();

      if (!token) {
        setError(
          "Authentication token is missing."
        );

        return;
      }

      try {
        setActionLoading(
          `complete-${appointmentId}`
        );

        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-dashboard/appointments/${appointmentId}/complete`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to complete appointment."
          );
        }

        setSuccess(
          "Appointment marked as completed successfully."
        );

        await loadDashboard();
      } catch (requestError) {
        console.error(
          "Complete appointment error:",
          requestError
        );

        setError(
          requestError.message ||
            "Failed to complete appointment."
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleSaveNotes =
    async (appointmentId) => {
      const token =
        getToken();

      if (!token) {
        setError(
          "Authentication token is missing."
        );

        return;
      }

      try {
        setActionLoading(
          `notes-${appointmentId}`
        );

        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-dashboard/appointments/${appointmentId}/notes`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                notes:
                  notes[
                    appointmentId
                  ] || "",
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to save notes."
          );
        }

        setSuccess(
          "Appointment notes saved successfully."
        );

        await loadDashboard();
      } catch (requestError) {
        console.error(
          "Save notes error:",
          requestError
        );

        setError(
          requestError.message ||
            "Failed to save notes."
        );
      } finally {
        setActionLoading(null);
      }
    };

  const updateNote = (
    appointmentId,
    value
  ) => {
    setNotes((previous) => ({
      ...previous,
      [appointmentId]:
        value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600 font-medium">
            Loading counsellor dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !dashboard
  ) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to open dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            {error}
          </p>

          <div className="mt-6 flex gap-3 justify-center">
            <button
              type="button"
              onClick={
                loadDashboard
              }
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Try Again
            </button>

            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const counsellorName =
    dashboard?.counsellor
      ?.full_name ||
    user?.full_name ||
    "Counsellor";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-50 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Counsellor Portal
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome,{" "}
                {counsellorName}
              </h1>

              <p className="mt-2 text-blue-100 max-w-2xl">
                Manage your counselling
                appointments, student
                consultations and
                session notes from one
                place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/counsellor-availability"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition shadow-sm"
              >
                Manage Availability
              </Link>

              <Link
                to="/counsellor-notices"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/10 border border-white/25 text-white font-semibold hover:bg-white/15 transition"
              >
                Manage Notices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 flex items-start justify-between gap-4">
            <p className="font-medium">
              {success}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {error && dashboard && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start justify-between gap-4">
            <p className="font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Appointments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {dashboard?.stats
                ?.total_appointments ??
                stats.total}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-600">
              Scheduled
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {dashboard?.stats
                ?.scheduled_appointments ??
                stats.scheduled}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {dashboard?.stats
                ?.completed_appointments ??
                stats.completed}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-600">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              {dashboard?.stats
                ?.cancelled_appointments ??
                stats.cancelled}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">
              Today
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {stats.today}
            </p>
          </div>
        </div>

        {/* =================================================
            PROFILE SUMMARY
        ================================================= */}

        {dashboard?.counsellor && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
                {counsellorName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {counsellorName}
                  </h2>

                  {dashboard
                    .counsellor
                    .is_verified && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 text-slate-600">
                  {dashboard
                    .counsellor
                    .specialization ||
                    "Admissions Counsellor"}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span>
                    {dashboard
                      .counsellor
                      .qualification ||
                      "Qualification not provided"}
                  </span>

                  <span>
                    {dashboard
                      .counsellor
                      .experience_years ??
                      0}{" "}
                    years experience
                  </span>

                  {dashboard
                    .counsellor
                    .consultation_fee !=
                    null && (
                    <span>
                      ₹
                      {Number(
                        dashboard
                          .counsellor
                          .consultation_fee
                      ).toLocaleString(
                        "en-IN"
                      )}{" "}
                      / session
                    </span>
                  )}
                </div>
              </div>

              <Link
                to="/counsellor-profile"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        )}

        {/* =================================================
            APPOINTMENTS
        ================================================= */}

        <section className="mt-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Consultation Management
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Appointments
              </h2>

              <p className="mt-1 text-slate-500">
                View student consultations
                and manage completed
                sessions.
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadDashboard
              }
              className="self-start lg:self-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              ↻ Refresh
            </button>
          </div>

          {/* Filters */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Search student
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search by student name or email..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">
                    All statuses
                  </option>
                  <option value="scheduled">
                    Scheduled
                  </option>
                  <option value="rescheduled">
                    Rescheduled
                  </option>
                  <option value="completed">
                    Completed
                  </option>
                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>
          </div>

          {filteredAppointments.length ===
          0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-2xl">
                📅
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No appointments found
              </h3>

              <p className="mt-1 text-slate-500 max-w-md mx-auto">
                There are no appointments
                matching the selected
                filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(
                (appointment) => {
                  const status =
                    String(
                      appointment.status ||
                        "scheduled"
                    ).toLowerCase();

                  const studentName =
                    appointment.student_name ||
                    appointment.full_name ||
                    "Student";

                  const studentEmail =
                    appointment.student_email ||
                    appointment.email ||
                    "";

                  const canComplete =
                    [
                      "scheduled",
                      "rescheduled",
                    ].includes(
                      status
                    );

                  const upcoming =
                    isUpcoming(
                      appointment
                    );

                  return (
                    <article
                      key={
                        appointment.id
                      }
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col xl:flex-row xl:items-start gap-5">
                          {/* Student */}

                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                              {studentName
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-lg">
                                  {
                                    studentName
                                  }
                                </h3>

                                {upcoming && (
                                  <span className="px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                                    Upcoming
                                  </span>
                                )}
                              </div>

                              {studentEmail && (
                                <p className="mt-1 text-sm text-slate-500 break-all">
                                  {
                                    studentEmail
                                  }
                                </p>
                              )}

                              {appointment.student_phone && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    appointment.student_phone
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Appointment Info */}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:min-w-[540px]">
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Date
                              </p>

                              <p className="mt-1 font-semibold text-slate-800">
                                {formatDate(
                                  appointment.appointment_date
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Time
                              </p>

                              <p className="mt-1 font-semibold text-slate-800">
                                {formatTime(
                                  appointment.start_time
                                )}
                                {" – "}
                                {formatTime(
                                  appointment.end_time
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Status
                              </p>

                              <span
                                className={`inline-flex mt-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusClass(
                                  status
                                )}`}
                              >
                                {status
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase() +
                                  status.slice(
                                    1
                                  )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Meeting link */}

                        {appointment.meeting_link && (
                          <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
                            <p className="text-sm font-semibold text-blue-800">
                              Meeting Link
                            </p>

                            <a
                              href={
                                appointment.meeting_link
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-1 text-sm text-blue-700 hover:text-blue-900 font-medium break-all"
                            >
                              {
                                appointment.meeting_link
                              }
                            </a>
                          </div>
                        )}

                        {/* Notes */}

                        <div className="mt-5">
                          <label
                            htmlFor={`notes-${appointment.id}`}
                            className="block text-sm font-semibold text-slate-700 mb-2"
                          >
                            Session Notes
                          </label>

                          <textarea
                            id={`notes-${appointment.id}`}
                            rows="3"
                            value={
                              notes[
                                appointment.id
                              ] ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateNote(
                                appointment.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Add notes about this student's counselling session..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />

                          <div className="mt-3 flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                `notes-${appointment.id}`
                              }
                              onClick={() =>
                                handleSaveNotes(
                                  appointment.id
                                )
                              }
                              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {actionLoading ===
                              `notes-${appointment.id}`
                                ? "Saving..."
                                : "Save Notes"}
                            </button>

                            {canComplete && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  `complete-${appointment.id}`
                                }
                                onClick={() =>
                                  handleComplete(
                                    appointment.id
                                  )
                                }
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                {actionLoading ===
                                `complete-${appointment.id}`
                                  ? "Completing..."
                                  : "Mark Completed"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}