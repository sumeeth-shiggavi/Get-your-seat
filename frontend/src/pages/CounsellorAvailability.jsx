import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EMPTY_FORM = {
  day_of_week: "Monday",
  start_time: "09:00",
  end_time: "17:00",
  is_available: true,
};

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const value = String(time).substring(0, 5);
  const [hours, minutes] = value
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
};

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

function CounsellorAvailability() {
  const [user] = useState(
    getStoredUser
  );

  const [availability, setAvailability] =
    useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const token = getToken();
  const userId = getUserId(user);

  const headers = useMemo(
    () => ({
      "Content-Type":
        "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // =====================================================
  // LOAD AVAILABILITY
  // =====================================================

  const loadAvailability =
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
            `${API_BASE_URL}/counsellor-availability/${userId}`,
            {
              headers,
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load availability."
          );
        }

        setAvailability(
          result.data || []
        );
      } catch (err) {
        setError(
          err.message ||
            "Failed to load availability."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAvailability();
  }, [userId, token]);

  // =====================================================
  // FORM HANDLING
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (slot) => {
    setEditingId(slot.id);

    setForm({
      day_of_week:
        slot.day_of_week,
      start_time:
        String(
          slot.start_time
        ).substring(0, 5),
      end_time:
        String(
          slot.end_time
        ).substring(0, 5),
      is_available:
        slot.is_available,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SAVE AVAILABILITY
  // =====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (!token || !userId) {
        setError(
          "Please login as a counsellor first."
        );
        return;
      }

      if (
        !form.day_of_week ||
        !form.start_time ||
        !form.end_time
      ) {
        setError(
          "Please fill all required fields."
        );
        return;
      }

      if (
        form.start_time >=
        form.end_time
      ) {
        setError(
          "End time must be later than start time."
        );
        return;
      }

      const startMinutes =
        Number(
          form.start_time
            .split(":")[0]
        ) *
          60 +
        Number(
          form.start_time
            .split(":")[1]
        );

      const endMinutes =
        Number(
          form.end_time
            .split(":")[0]
        ) *
          60 +
        Number(
          form.end_time
            .split(":")[1]
        );

      if (
        startMinutes % 30 !== 0 ||
        endMinutes % 30 !== 0
      ) {
        setError(
          "Please select times on 30-minute boundaries, such as 09:00, 09:30 or 10:00."
        );
        return;
      }

      if (
        endMinutes - startMinutes <
        30
      ) {
        setError(
          "Availability must be at least 30 minutes."
        );
        return;
      }

      try {
        setSaving(true);

        const url = editingId
          ? `${API_BASE_URL}/counsellor-availability/slot/${editingId}`
          : `${API_BASE_URL}/counsellor-availability/${userId}`;

        const method =
          editingId ? "PUT" : "POST";

        const response =
          await fetch(url, {
            method,
            headers,
            body: JSON.stringify({
              day_of_week:
                form.day_of_week,
              start_time:
                form.start_time,
              end_time:
                form.end_time,
              is_available:
                form.is_available,
            }),
          });

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to save availability."
          );
        }

        setSuccess(
          editingId
            ? "Availability updated successfully."
            : "Availability added successfully."
        );

        resetForm();

        await loadAvailability();
      } catch (err) {
        setError(
          err.message ||
            "Failed to save availability."
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this availability period?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(id);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/counsellor-availability/slot/${id}`,
            {
              method: "DELETE",
              headers,
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to delete availability."
          );
        }

        setSuccess(
          "Availability deleted successfully."
        );

        if (editingId === id) {
          resetForm();
        }

        await loadAvailability();
      } catch (err) {
        setError(
          err.message ||
            "Failed to delete availability."
        );
      } finally {
        setDeletingId(null);
      }
    };

  // =====================================================
  // GROUP BY DAY
  // =====================================================

  const groupedAvailability =
    DAYS.map((day) => ({
      day,
      slots:
        availability.filter(
          (slot) =>
            slot.day_of_week ===
            day
        ),
    })).filter(
      (group) =>
        group.slots.length > 0
    );

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
              Counsellor Login Required
            </h1>

            <p className="mt-3 text-slate-600">
              Please login as a counsellor
              to manage your counselling
              availability.
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8 text-white shadow-lg sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
              <span>🗓️</span>
              Counsellor Schedule
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Manage Your Availability
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Set the days and times when
              students can book counselling
              appointments with you.
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

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* FORM */}
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId
                  ? "Edit Availability"
                  : "Add Availability"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Availability is divided into
                30-minute booking slots.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* DAY */}
              <div>
                <label
                  htmlFor="day_of_week"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Day
                </label>

                <select
                  id="day_of_week"
                  name="day_of_week"
                  value={
                    form.day_of_week
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {DAYS.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}
                </select>
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
                    form.start_time
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                    form.end_time
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* ACTIVE */}
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Available for booking
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Students can book slots
                    during this period.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="is_available"
                  checked={
                    form.is_available
                  }
                  onChange={
                    handleChange
                  }
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Availability"
                    : "Add Availability"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* INFO */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-900">
                💡 Scheduling rule
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Availability must use
                30-minute boundaries.
                Example: 09:00–12:00 creates
                six bookable slots.
              </p>
            </div>
          </section>

          {/* AVAILABILITY LIST */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Your Availability
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  These periods are used to
                  generate student booking
                  slots.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {availability.length}{" "}
                {availability.length ===
                1
                  ? "period"
                  : "periods"}
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading availability...
                  </p>
                </div>
              </div>
            ) : availability.length ===
              0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  🗓️
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  No availability added
                  yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Add your working days and
                  consultation hours using
                  the form.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedAvailability.map(
                  (group) => (
                    <div
                      key={group.day}
                      className="overflow-hidden rounded-2xl border border-slate-200"
                    >
                      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                        <h3 className="font-bold text-slate-900">
                          {group.day}
                        </h3>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {group.slots.map(
                          (slot) => (
                            <div
                              key={
                                slot.id
                              }
                              className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">
                                  🕐
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {formatTime(
                                      slot.start_time
                                    )}{" "}
                                    –{" "}
                                    {formatTime(
                                      slot.end_time
                                    )}
                                  </p>

                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        slot.is_available
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {slot.is_available
                                        ? "Available"
                                        : "Unavailable"}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                      30-minute
                                      slots
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEdit(
                                      slot
                                    )
                                  }
                                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      slot.id
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    slot.id
                                  }
                                  className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId ===
                                  slot.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default CounsellorAvailability;