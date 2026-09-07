import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CounsellorAvailability() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const [availability, setAvailability] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // DAYS ORDER
  // =====================================================

  const daysOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  // =====================================================
  // AUTHENTICATION
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

      const userId =
        parsedUser.user_id ??
        parsedUser.id;

      if (!userId) {
        console.error(
          "Counsellor user ID is missing:",
          parsedUser
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("loginData");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const normalizedUser = {
        ...parsedUser,
        user_id: userId,
        id:
          parsedUser.id ??
          userId,
      };

      setUser(normalizedUser);
      setToken(storedToken);
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("loginData");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // FETCH AVAILABILITY
  // =====================================================

  const fetchAvailability = async () => {
    try {
      setError("");

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

      const loggedInUser =
        JSON.parse(storedUser);

      if (
        !loggedInUser ||
        loggedInUser.role !== "counsellor"
      ) {
        setError(
          "Please login as a counsellor to manage availability."
        );

        return;
      }

      const userId =
        loggedInUser.user_id ??
        loggedInUser.id;

      if (!userId) {
        setError(
          "Counsellor account information is incomplete. Please login again."
        );

        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-availability/${userId}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${storedToken}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // =================================================
      // TOKEN ERROR
      // =================================================

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("loginData");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // =================================================
      // ROLE ERROR
      // =================================================

      if (response.status === 403) {
        setError(
          data.message ||
            "You are not authorized to manage availability."
        );

        return;
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load availability."
        );
      }

      // =================================================
      // SORT AVAILABILITY
      // =================================================

      const schedules =
        Array.isArray(data.data)
          ? [...data.data]
          : [];

      schedules.sort((a, b) => {
        const dayDifference =
          (daysOrder[a.day_of_week] || 99) -
          (daysOrder[b.day_of_week] || 99);

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return (
          String(a.start_time || "").localeCompare(
            String(b.start_time || "")
          )
        );
      });

      setAvailability(schedules);
    } catch (error) {
      console.error(
        "Fetch availability error:",
        error
      );

      setError(
        error.message ||
          "Unable to load availability."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD AVAILABILITY
  // =====================================================

  useEffect(() => {
    if (user && token) {
      fetchAvailability();
    }
  }, [user, token]);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      day_of_week: "",
      start_time: "",
      end_time: "",
    });

    setEditingId(null);
  };

  // =====================================================
  // CHECK FRONTEND OVERLAP
  // =====================================================

  const hasOverlappingSchedule = () => {
    const newStart =
      formData.start_time;

    const newEnd =
      formData.end_time;

    if (
      !formData.day_of_week ||
      !newStart ||
      !newEnd
    ) {
      return false;
    }

    const newStartMinutes =
      timeToMinutes(newStart);

    const newEndMinutes =
      timeToMinutes(newEnd);

    return availability.some(
      (slot) => {
        if (
          slot.day_of_week !==
          formData.day_of_week
        ) {
          return false;
        }

        if (
          editingId &&
          Number(slot.id) ===
            Number(editingId)
        ) {
          return false;
        }

        const existingStart =
          timeToMinutes(
            slot.start_time
              ? slot.start_time.slice(0, 5)
              : ""
          );

        const existingEnd =
          timeToMinutes(
            slot.end_time
              ? slot.end_time.slice(0, 5)
              : ""
          );

        return (
          newStartMinutes <
            existingEnd &&
          newEndMinutes >
            existingStart
        );
      }
    );
  };

  // =====================================================
  // TIME TO MINUTES
  // =====================================================

  const timeToMinutes = (time) => {
    if (!time) {
      return 0;
    }

    const [
      hours,
      minutes,
    ] = time.split(":").map(Number);

    return (
      hours * 60 +
      minutes
    );
  };

  // =====================================================
  // ADD / UPDATE AVAILABILITY
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (
      !formData.day_of_week ||
      !formData.start_time ||
      !formData.end_time
    ) {
      setError(
        "Please select a day, start time and end time."
      );

      return;
    }

    if (
      formData.start_time >=
      formData.end_time
    ) {
      setError(
        "Start time must be before end time."
      );

      return;
    }

    // -------------------------------------------------
    // MINIMUM 30 MINUTES
    // -------------------------------------------------

    const startMinutes =
      timeToMinutes(
        formData.start_time
      );

    const endMinutes =
      timeToMinutes(
        formData.end_time
      );

    if (
      endMinutes -
        startMinutes <
      30
    ) {
      setError(
        "Availability must be at least 30 minutes long."
      );

      return;
    }

    // -------------------------------------------------
    // CHECK OVERLAP
    // -------------------------------------------------

    if (hasOverlappingSchedule()) {
      setError(
        "This availability overlaps with another schedule on the same day."
      );

      return;
    }

    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

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

    let loggedInUser;

    try {
      loggedInUser =
        JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("loginData");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (
      !loggedInUser ||
      loggedInUser.role !== "counsellor"
    ) {
      setError(
        "Please login as a counsellor."
      );

      return;
    }

    const userId =
      loggedInUser.user_id ??
      loggedInUser.id;

    if (!userId) {
      setError(
        "Counsellor account information is incomplete. Please login again."
      );

      return;
    }

    setSaving(true);

    try {
      let url = "";
      let method = "";
      let body = {};

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        url =
          `http://localhost:5000/api/counsellor-availability/slot/${editingId}`;

        method = "PUT";

        body = {
          day_of_week:
            formData.day_of_week,

          start_time:
            formData.start_time,

          end_time:
            formData.end_time,

          is_available: true,
        };
      }

      // =================================================
      // ADD
      // =================================================

      else {
        url =
          `http://localhost:5000/api/counsellor-availability/${userId}`;

        method = "POST";

        body = {
          day_of_week:
            formData.day_of_week,

          start_time:
            formData.start_time,

          end_time:
            formData.end_time,
        };
      }

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${storedToken}`,
          },

          body: JSON.stringify(body),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // =================================================
      // TOKEN ERROR
      // =================================================

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("loginData");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // =================================================
      // ROLE ERROR
      // =================================================

      if (response.status === 403) {
        throw new Error(
          data.message ||
            "You are not authorized to modify availability."
        );
      }

      // =================================================
      // CONFLICT
      // =================================================

      if (response.status === 409) {
        throw new Error(
          data.message ||
            "This availability conflicts with an existing schedule."
        );
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save availability."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      if (editingId) {
        setSuccess(
          "Availability updated successfully."
        );
      } else {
        setSuccess(
          "Availability added successfully."
        );
      }

      resetForm();

      await fetchAvailability();
    } catch (error) {
      console.error(
        "Save availability error:",
        error
      );

      setError(
        error.message ||
          "Unable to save availability."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT AVAILABILITY
  // =====================================================

  const handleEdit = (slot) => {
    setEditingId(slot.id);

    setFormData({
      day_of_week:
        slot.day_of_week || "",

      start_time:
        slot.start_time
          ? slot.start_time.slice(0, 5)
          : "",

      end_time:
        slot.end_time
          ? slot.end_time.slice(0, 5)
          : "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE AVAILABILITY
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this availability?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const storedToken =
      localStorage.getItem("token");

    if (!storedToken) {
      setError(
        "Authentication token is missing. Please login again."
      );

      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/counsellor-availability/slot/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${storedToken}`,
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // =================================================
      // TOKEN ERROR
      // =================================================

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("loginData");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // =================================================
      // ROLE ERROR
      // =================================================

      if (response.status === 403) {
        throw new Error(
          data.message ||
            "You are not authorized to delete this availability."
        );
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete availability."
        );
      }

      setSuccess(
        "Availability deleted successfully."
      );

      if (
        Number(editingId) ===
        Number(id)
      ) {
        resetForm();
      }

      await fetchAvailability();
    } catch (error) {
      console.error(
        "Delete availability error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete availability."
      );
    }
  };

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const handleToggle = async (slot) => {
    setError("");
    setSuccess("");

    const storedToken =
      localStorage.getItem("token");

    if (!storedToken) {
      setError(
        "Authentication token is missing. Please login again."
      );

      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/counsellor-availability/slot/${slot.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${storedToken}`,
          },

          body: JSON.stringify({
            day_of_week:
              slot.day_of_week,

            start_time:
              slot.start_time
                ? slot.start_time.slice(0, 5)
                : "",

            end_time:
              slot.end_time
                ? slot.end_time.slice(0, 5)
                : "",

            is_available:
              !slot.is_available,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // =================================================
      // TOKEN ERROR
      // =================================================

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("loginData");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // =================================================
      // ROLE ERROR
      // =================================================

      if (response.status === 403) {
        throw new Error(
          data.message ||
            "You are not authorized to update this availability."
        );
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update availability."
        );
      }

      setSuccess(
        slot.is_available
          ? "Availability disabled."
          : "Availability enabled."
      );

      await fetchAvailability();
    } catch (error) {
      console.error(
        "Toggle availability error:",
        error
      );

      setError(
        error.message ||
          "Unable to update availability."
      );
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [
      hours,
      minutes,
    ] = time.split(":");

    const hourNumber =
      Number(hours);

    const suffix =
      hourNumber >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hourNumber % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🕐
          </div>

          <p className="text-lg text-gray-600">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🕐 Counsellor Availability
              </h1>

              <p className="text-gray-500 mt-2">
                Manage the days and times when students
                can book counselling appointments.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/counsellor-dashboard"
                )
              }
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ← Dashboard
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6">

            <div className="flex items-start gap-3">

              <span className="text-xl">
                ⚠️
              </span>

              <p>
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-6">

            <div className="flex items-start gap-3">

              <span className="text-xl">
                ✅
              </span>

              <p>
                {success}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">

                {editingId
                  ? "✏️ Edit Availability"
                  : "➕ Add Availability"}

              </h2>

              <p className="text-gray-500 mt-1">
                Set your counselling working hours.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* DAY */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Day *
                </label>

                <select
                  name="day_of_week"
                  value={
                    formData.day_of_week
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    Select day
                  </option>

                  <option value="Monday">
                    Monday
                  </option>

                  <option value="Tuesday">
                    Tuesday
                  </option>

                  <option value="Wednesday">
                    Wednesday
                  </option>

                  <option value="Thursday">
                    Thursday
                  </option>

                  <option value="Friday">
                    Friday
                  </option>

                  <option value="Saturday">
                    Saturday
                  </option>

                  <option value="Sunday">
                    Sunday
                  </option>
                </select>
              </div>

              {/* START TIME */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Start Time *
                </label>

                <input
                  type="time"
                  name="start_time"
                  value={
                    formData.start_time
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* END TIME */}

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  End Time *
                </label>

                <input
                  type="time"
                  name="end_time"
                  value={
                    formData.end_time
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={resetForm}
                  disabled={saving}
                  className="sm:w-40 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </div>

        {/* =================================================
            AVAILABILITY LIST
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📅 My Availability
              </h2>

              <p className="text-gray-500 mt-1">
                Students will use these timings to book appointments.
              </p>
            </div>

            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
              {availability.length}{" "}
              {availability.length === 1
                ? "Schedule"
                : "Schedules"}
            </div>

          </div>

          {availability.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-6xl mb-4">
                🗓️
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                No availability added
              </h3>

              <p className="text-gray-500 mt-2">
                Add your first working schedule above.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {availability.map(
                (slot) => (

                  <div
                    key={slot.id}
                    className={`border rounded-xl p-5 transition ${
                      slot.is_available
                        ? "border-gray-200 bg-white"
                        : "border-gray-200 bg-gray-100 opacity-70"
                    }`}
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* SLOT INFORMATION */}

                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                          📅
                        </div>

                        <div>

                          <h3 className="text-lg font-bold text-gray-900">
                            {slot.day_of_week}
                          </h3>

                          <p className="text-gray-600">
                            🕐{" "}
                            {formatTime(
                              slot.start_time
                            )}{" "}
                            –{" "}
                            {formatTime(
                              slot.end_time
                            )}
                          </p>

                          <span
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                              slot.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {slot.is_available
                              ? "Available"
                              : "Disabled"}
                          </span>

                        </div>

                      </div>

                      {/* ACTION BUTTONS */}

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(slot)
                          }
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            slot.is_available
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {slot.is_available
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(slot)
                          }
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              slot.id
                            )
                          }
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition"
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          )}

        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">

          <h3 className="font-bold text-blue-900 text-lg mb-3">
            💡 How availability works
          </h3>

          <ul className="space-y-2 text-blue-800">

            <li>
              • Add the days and times when you are available for counselling.
            </li>

            <li>
              • You can add multiple schedules for the same day as long as they don't overlap.
            </li>

            <li>
              • Each availability period must be at least 30 minutes.
            </li>

            <li>
              • Disabled schedules will not be available for student bookings.
            </li>

            <li>
              • Students will see available appointment slots based on these schedules.
            </li>

          </ul>

        </div>

      </div>
    </div>
  );
}

export default CounsellorAvailability;