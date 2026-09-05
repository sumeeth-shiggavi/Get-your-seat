import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

function CounsellorBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const counsellorId =
    searchParams.get("counsellor_id");

  const [counsellor, setCounsellor] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [slots, setSlots] = useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [loadingCounsellor, setLoadingCounsellor] =
    useState(true);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [booking, setBooking] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // GET TODAY'S DATE
  // =====================================================

  const getTodayDate = () => {
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

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] =
      time.split(":").map(Number);

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
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
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
        parsedUser.role !== "student"
      ) {
        setError(
          "Only students can book counselling appointments."
        );

        setLoadingCounsellor(false);

        return;
      }

      if (!parsedUser.user_id) {
        console.error(
          "Student user_id is missing:",
          parsedUser
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setUser(parsedUser);
      setToken(storedToken);
    } catch (error) {
      console.error(
        "Invalid user data:",
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
  // FETCH COUNSELLOR DETAILS
  // =====================================================

  const fetchCounsellor = async () => {
    try {
      setLoadingCounsellor(true);
      setError("");

      if (!counsellorId) {
        throw new Error(
          "Counsellor was not selected."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/counsellors"
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch counsellors."
        );
      }

      const counsellors =
        data.data || [];

      const selectedCounsellor =
        counsellors.find(
          (item) =>
            String(item.id) ===
            String(counsellorId)
        );

      if (!selectedCounsellor) {
        throw new Error(
          "Counsellor not found."
        );
      }

      setCounsellor(
        selectedCounsellor
      );
    } catch (error) {
      console.error(
        "Fetch counsellor error:",
        error
      );

      setError(
        error.message ||
          "Failed to load counsellor."
      );
    } finally {
      setLoadingCounsellor(false);
    }
  };

  // =====================================================
  // FETCH AVAILABLE SLOTS
  // =====================================================

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      setError("");
      setSuccess("");
      setSelectedSlot(null);
      setSlots([]);

      if (!selectedDate) {
        return;
      }

      if (!counsellorId) {
        throw new Error(
          "Counsellor was not selected."
        );
      }

      const storedToken =
        localStorage.getItem("token");

      if (!storedToken) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-slots/${counsellorId}?date=${selectedDate}`,
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

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (response.status === 403) {
        throw new Error(
          data.message ||
            "Only students can view available counselling slots."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch available slots."
        );
      }

      setSlots(
        data.data?.slots || []
      );
    } catch (error) {
      console.error(
        "Fetch slots error:",
        error
      );

      setError(
        error.message ||
          "Failed to load available slots."
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    if (user.role !== "student") {
      return;
    }

    fetchCounsellor();

    setSelectedDate(
      getTodayDate()
    );
  }, [user, token, counsellorId]);

  // =====================================================
  // FETCH SLOTS WHEN DATE CHANGES
  // =====================================================

  useEffect(() => {
    if (
      selectedDate &&
      counsellorId &&
      user &&
      token &&
      user.role === "student"
    ) {
      fetchSlots();
    }
  }, [
    selectedDate,
    counsellorId,
    user,
    token,
  ]);

  // =====================================================
  // SELECT SLOT
  // =====================================================

  const handleSlotSelect = (slot) => {
    if (!slot.is_available) {
      return;
    }

    setSelectedSlot(slot);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // BOOK APPOINTMENT
  // =====================================================

  const handleBooking = async () => {
    try {
      setError("");
      setSuccess("");

      const storedToken =
        localStorage.getItem("token");

      const storedUser =
        localStorage.getItem("user");

      if (!storedToken || !storedUser) {
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

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (
        !loggedInUser ||
        loggedInUser.role !== "student"
      ) {
        setError(
          "Only students can book counselling appointments."
        );

        return;
      }

      if (!selectedDate) {
        setError(
          "Please select a date."
        );

        return;
      }

      if (!selectedSlot) {
        setError(
          "Please select an available time slot."
        );

        return;
      }

      if (!selectedSlot.is_available) {
        setError(
          "This slot is no longer available."
        );

        return;
      }

      if (!counsellor) {
        setError(
          "Counsellor information is not available."
        );

        return;
      }

      setBooking(true);

      // =================================================
      // IMPORTANT
      //
      // student_id is NOT trusted from the frontend.
      // The backend gets the authenticated student from
      // req.user.id in the JWT.
      // =================================================

      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${storedToken}`,
          },

          body: JSON.stringify({
            counsellor_id:
              counsellor.id,

            appointment_date:
              selectedDate,

            start_time:
              selectedSlot.start_time,

            end_time:
              selectedSlot.end_time,
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
            "Only students can book appointments."
        );
      }

      // =================================================
      // SLOT ALREADY BOOKED
      // =================================================

      if (response.status === 409) {
        throw new Error(
          data.message ||
            "This time slot is no longer available. Please select another slot."
        );
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to book appointment."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Appointment booked successfully!"
      );

      setSelectedSlot(null);

      await fetchSlots();

      setTimeout(() => {
        navigate(
          "/my-appointments"
        );
      }, 1200);
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      setError(
        error.message ||
          "Unable to book appointment."
      );

      // Refresh slots in case
      // another student booked it
      await fetchSlots();
    } finally {
      setBooking(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loadingCounsellor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            👨‍⚕️
          </div>

          <p className="text-lg text-gray-600">
            Loading counsellor details...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10">

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}

        <div className="mb-6">

          <button
            onClick={() =>
              navigate("/counsellors")
            }
            className="text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            ← Back to Counsellors
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 rounded-xl p-4 mb-6">

            <p className="font-semibold">
              ⚠️ {error}
            </p>

          </div>
        )}

        {/* Success */}

        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 rounded-xl p-4 mb-6">

            <p className="font-semibold">
              ✅ {success}
            </p>

          </div>
        )}

        {/* Counsellor Card */}

        {counsellor && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
                  Counselling With
                </p>

                <h1 className="text-3xl font-bold text-gray-800 mt-1">
                  {counsellor.full_name}
                </h1>

                <p className="text-blue-700 font-semibold mt-2">
                  {counsellor.specialization}
                </p>

                <p className="text-gray-600 mt-2">
                  📚{" "}
                  {counsellor.qualification ||
                    "Qualified Counsellor"}
                </p>

                <p className="text-gray-600">
                  💼{" "}
                  {counsellor.experience_years ||
                    0}{" "}
                  years experience
                </p>

              </div>

              <div className="bg-blue-50 rounded-xl p-5 text-center">

                <p className="text-sm text-gray-500">
                  Consultation Fee
                </p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  ₹
                  {counsellor.consultation_fee ||
                    0}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Date Selection */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <h2 className="text-2xl font-bold text-gray-800">
            📅 Select Appointment Date
          </h2>

          <p className="text-gray-500 mt-1">
            Choose a date to see available
            counselling slots.
          </p>

          <div className="mt-5 max-w-md">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Appointment Date
            </label>

            <input
              type="date"
              value={selectedDate}
              min={getTodayDate()}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {selectedDate && (
            <div className="mt-4 bg-blue-50 rounded-xl p-4">

              <p className="text-blue-800 font-semibold">
                📅{" "}
                {formatDate(
                  selectedDate
                )}
              </p>

            </div>
          )}

        </div>

        {/* Slots */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              🕐 Available Time Slots
            </h2>

            <p className="text-gray-500 mt-1">
              Select one available 30-minute
              counselling slot.
            </p>

          </div>

          {loadingSlots ? (

            <div className="text-center py-10">

              <div className="text-4xl mb-3">
                🕐
              </div>

              <p className="text-gray-600">
                Loading available slots...
              </p>

            </div>

          ) : slots.length === 0 ? (

            <div className="text-center py-12 bg-gray-50 rounded-xl">

              <div className="text-5xl mb-4">
                📭
              </div>

              <h3 className="text-xl font-bold text-gray-700">
                No Slots Available
              </h3>

              <p className="text-gray-500 mt-2">
                This counsellor is not available
                on the selected date.
              </p>

              <p className="text-gray-500 mt-1">
                Please select another date.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

              {slots.map(
                (slot, index) => {

                  const isSelected =
                    selectedSlot &&
                    selectedSlot.start_time ===
                      slot.start_time &&
                    selectedSlot.end_time ===
                      slot.end_time;

                  return (
                    <button
                      key={`${slot.start_time}-${index}`}
                      type="button"
                      disabled={
                        !slot.is_available
                      }
                      onClick={() =>
                        handleSlotSelect(
                          slot
                        )
                      }
                      className={`p-5 rounded-xl border-2 text-left transition ${
                        !slot.is_available
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-white border-green-200 text-gray-800 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <span className="font-bold text-lg">
                          🕐{" "}
                          {formatTime(
                            slot.start_time
                          )}
                        </span>

                        {!slot.is_available && (
                          <span className="text-xs font-bold">
                            FULL
                          </span>
                        )}

                        {slot.is_available &&
                          !isSelected && (
                            <span className="text-xs font-bold text-green-600">
                              AVAILABLE
                            </span>
                          )}

                        {isSelected && (
                          <span className="text-xs font-bold">
                            ✓ SELECTED
                          </span>
                        )}

                      </div>

                      <p
                        className={`mt-2 text-sm ${
                          isSelected
                            ? "text-blue-100"
                            : slot.is_available
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(
                          slot.start_time
                        )}{" "}
                        -{" "}
                        {formatTime(
                          slot.end_time
                        )}
                      </p>

                    </button>
                  );
                }
              )}

            </div>

          )}

          {/* Booking Summary */}

          {selectedSlot && (
            <div className="mt-8 border-t pt-6">

              <div className="bg-blue-50 rounded-xl p-5">

                <h3 className="text-lg font-bold text-blue-800">
                  📋 Booking Summary
                </h3>

                <div className="mt-4 space-y-2 text-gray-700">

                  <p>
                    <span className="font-semibold">
                      Counsellor:
                    </span>{" "}
                    {counsellor?.full_name}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Date:
                    </span>{" "}
                    {formatDate(
                      selectedDate
                    )}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Time:
                    </span>{" "}
                    {formatTime(
                      selectedSlot.start_time
                    )}{" "}
                    -{" "}
                    {formatTime(
                      selectedSlot.end_time
                    )}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Consultation Fee:
                    </span>{" "}
                    ₹
                    {counsellor?.consultation_fee ||
                      0}
                  </p>

                </div>

              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">

                <button
                  onClick={() =>
                    setSelectedSlot(
                      null
                    )
                  }
                  disabled={booking}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Clear Selection
                </button>

                <button
                  onClick={
                    handleBooking
                  }
                  disabled={booking}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking
                    ? "Booking..."
                    : "✅ Confirm Appointment"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default CounsellorBooking;