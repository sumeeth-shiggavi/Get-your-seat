import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000/api";

function CounsellorBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const counsellorId =
    searchParams.get("counsellor_id");

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const [counsellor, setCounsellor] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [slots, setSlots] = useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [
    loadingCounsellor,
    setLoadingCounsellor,
  ] = useState(true);

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
  // GET MAX BOOKING DATE
  // =====================================================

  const getMaxDate = () => {
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
    date.setSeconds(0);

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
  // HANDLE AUTHENTICATION FAILURE
  // =====================================================

  const handleAuthenticationFailure =
    () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem(
        "loginData"
      );

      navigate("/login", {
        replace: true,
      });
    };

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      const storedToken =
        localStorage.getItem("token");

      if (
        !storedUser ||
        !storedToken
      ) {
        handleAuthenticationFailure();
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

      const userId =
        parsedUser.user_id ??
        parsedUser.id;

      if (!userId) {
        handleAuthenticationFailure();
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
        "Authentication loading error:",
        error
      );

      handleAuthenticationFailure();
    }
  }, []);

  // =====================================================
  // FETCH COUNSELLOR
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
        `${API_BASE_URL}/counsellors`
      );

      let data = {};

      try {
        data =
          await response.json();
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
    if (!selectedDate) {
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");
      setSuccess("");
      setSelectedSlot(null);
      setSlots([]);

      const storedToken =
        localStorage.getItem("token");

      if (!storedToken) {
        handleAuthenticationFailure();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/counsellor-slots/${counsellorId}?date=${selectedDate}`,
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
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        handleAuthenticationFailure();
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
  }, [
    user,
    token,
    counsellorId,
  ]);

  // =====================================================
  // LOAD SLOTS WHEN DATE CHANGES
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
  // SLOT COUNTS
  // =====================================================

  const availableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.is_available
      ),
    [slots]
  );

  const unavailableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          !slot.is_available
      ),
    [slots]
  );

  // =====================================================
  // SELECT SLOT
  // =====================================================

  const handleSlotSelect = (
    slot
  ) => {
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

      if (!selectedDate) {
        setError(
          "Please select an appointment date."
        );

        return;
      }

      if (!selectedSlot) {
        setError(
          "Please select an available time slot."
        );

        return;
      }

      if (
        !selectedSlot.is_available
      ) {
        setError(
          "This slot is no longer available. Please select another slot."
        );

        await fetchSlots();

        return;
      }

      const storedToken =
        localStorage.getItem("token");

      const storedUser =
        localStorage.getItem("user");

      if (
        !storedToken ||
        !storedUser
      ) {
        handleAuthenticationFailure();
        return;
      }

      let loggedInUser;

      try {
        loggedInUser =
          JSON.parse(storedUser);
      } catch {
        handleAuthenticationFailure();
        return;
      }

      const userId =
        loggedInUser.user_id ??
        loggedInUser.id;

      if (!userId) {
        handleAuthenticationFailure();
        return;
      }

      setBooking(true);

      const response = await fetch(
        `${API_BASE_URL}/appointments`,
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
              Number(counsellorId),

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
        data =
          await response.json();
      } catch {
        data = {};
      }

      // =================================================
      // TOKEN EXPIRED
      // =================================================

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      // =================================================
      // SLOT CONFLICT
      // =================================================

      if (
        response.status === 409
      ) {
        setError(
          data.message ||
            "This slot is no longer available. Please select another slot."
        );

        setSelectedSlot(null);

        await fetchSlots();

        return;
      }

      // =================================================
      // VALIDATION ERROR
      // =================================================

      if (
        response.status === 400
      ) {
        setError(
          data.message ||
            "Please check your booking details."
        );

        return;
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
        data.message ||
          "Appointment booked successfully."
      );

      setSelectedSlot(null);

      // Refresh slots so the booked
      // slot immediately becomes unavailable.
      await fetchSlots();
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      setError(
        error.message ||
          "Failed to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loadingCounsellor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">
            👨‍🏫
          </div>

          <p className="text-gray-600">
            Loading counsellor...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            type="button"
            onClick={() =>
              navigate("/counsellors")
            }
            className="text-blue-100 hover:text-white text-sm font-semibold mb-6 transition"
          >
            ← Back to Counsellors
          </button>

          <p className="text-blue-200 text-sm font-semibold tracking-widest">
            COUNSELLING APPOINTMENT
          </p>

          <h1 className="text-3xl md:text-5xl font-bold mt-3">
            Book a Counselling Session
          </h1>

          <p className="text-blue-100 mt-4 max-w-2xl leading-7">
            Select a convenient date and
            an available 30-minute time
            slot with your counsellor.
          </p>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <div className="flex items-start gap-3">
              <span className="text-xl">
                ⚠️
              </span>

              <div>
                <p className="font-semibold">
                  Unable to continue
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  ✅
                </span>

                <div>
                  <p className="font-semibold">
                    Booking successful
                  </p>

                  <p className="text-sm mt-1">
                    {success}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/my-appointments"
                  )
                }
                className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                View Appointments →
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            COUNSELLOR CARD
        ================================================= */}

        {counsellor && (
          <section className="bg-white border border-gray-200 rounded-3xl shadow-md p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold shrink-0">
                {counsellor.full_name
                  ?.substring(0, 1)
                  .toUpperCase() ||
                  "C"}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {counsellor.full_name}
                  </h2>

                  {counsellor.is_verified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="text-blue-600 font-semibold mt-1">
                  {counsellor.specialization ||
                    "Admission Counsellor"}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-500">
                  {counsellor.experience_years !==
                    undefined && (
                    <span>
                      <strong className="text-gray-700">
                        Experience:
                      </strong>{" "}
                      {
                        counsellor.experience_years
                      }{" "}
                      years
                    </span>
                  )}

                  {counsellor.qualification && (
                    <span>
                      <strong className="text-gray-700">
                        Qualification:
                      </strong>{" "}
                      {
                        counsellor.qualification
                      }
                    </span>
                  )}

                  {counsellor.consultation_fee !==
                    undefined &&
                    counsellor.consultation_fee !==
                      null && (
                      <span>
                        <strong className="text-gray-700">
                          Fee:
                        </strong>{" "}
                        ₹
                        {
                          counsellor.consultation_fee
                        }
                      </span>
                    )}
                </div>
              </div>
            </div>

            {counsellor.bio && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  About the Counsellor
                </p>

                <p className="text-gray-600 leading-7 whitespace-pre-line">
                  {counsellor.bio}
                </p>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            BOOKING GRID
        ================================================= */}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* =================================================
              DATE SELECTION
          ================================================= */}

          <section className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
                📅
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Select Date
                </h2>

                <p className="text-sm text-gray-500">
                  Choose your appointment day
                </p>
              </div>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Appointment Date
            </label>

            <input
              type="date"
              value={selectedDate}
              min={getTodayDate()}
              max={getMaxDate()}
              onChange={(event) => {
                setSelectedDate(
                  event.target.value
                );

                setSelectedSlot(null);
                setError("");
                setSuccess("");
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {selectedDate && (
              <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Selected Date
                </p>

                <p className="text-blue-900 font-bold mt-1">
                  {formatDate(
                    selectedDate
                  )}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-800">
                Booking Information
              </p>

              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>
                  ✓ Each appointment is 30
                  minutes.
                </li>

                <li>
                  ✓ Only available slots can
                  be selected.
                </li>

                <li>
                  ✓ Booked slots are disabled.
                </li>

                <li>
                  ✓ Past time slots cannot be
                  booked.
                </li>
              </ul>
            </div>
          </section>

          {/* =================================================
              SLOT SELECTION
          ================================================= */}

          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-md p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
                  🕐
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Available Time Slots
                  </h2>

                  <p className="text-sm text-gray-500">
                    30-minute counselling
                    sessions
                  </p>
                </div>
              </div>

              {slots.length > 0 && (
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-green-600">
                    {availableSlots.length}
                  </span>{" "}
                  available
                </div>
              )}
            </div>

            {/* LOADING */}

            {loadingSlots && (
              <div className="py-16 text-center">
                <div className="text-4xl mb-4">
                  🕐
                </div>

                <p className="text-gray-500">
                  Checking available slots...
                </p>
              </div>
            )}

            {/* NO DATE */}

            {!loadingSlots &&
              !selectedDate && (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-4">
                    📅
                  </div>

                  <p className="text-gray-500">
                    Select a date to view
                    available slots.
                  </p>
                </div>
              )}

            {/* NO SLOTS */}

            {!loadingSlots &&
              selectedDate &&
              slots.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-4">
                    🗓️
                  </div>

                  <h3 className="text-lg font-bold text-gray-800">
                    No slots available
                  </h3>

                  <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                    This counsellor does not
                    have availability on{" "}
                    {formatDate(
                      selectedDate
                    )}
                    . Please choose another
                    date.
                  </p>
                </div>
              )}

            {/* SLOTS */}

            {!loadingSlots &&
              slots.length > 0 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slots.map(
                      (slot, index) => {
                        const isSelected =
                          selectedSlot?.start_time ===
                            slot.start_time &&
                          selectedSlot?.end_time ===
                            slot.end_time;

                        return (
                          <button
                            key={`${slot.start_time}-${slot.end_time}-${index}`}
                            type="button"
                            disabled={
                              !slot.is_available
                            }
                            onClick={() =>
                              handleSlotSelect(
                                slot
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                : slot.is_available
                                ? "bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-500"
                                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <div>
                              {formatTime(
                                slot.start_time
                              )}
                            </div>

                            <div
                              className={`text-xs mt-1 ${
                                isSelected
                                  ? "text-blue-100"
                                  : slot.is_available
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {formatTime(
                                slot.end_time
                              )}
                            </div>

                            <div className="text-[11px] mt-2">
                              {isSelected
                                ? "Selected"
                                : slot.is_available
                                ? "Available"
                                : slot.is_booked
                                ? "Booked"
                                : "Unavailable"}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* LEGEND */}

                  <div className="flex flex-wrap gap-5 mt-6 pt-5 border-t border-gray-200 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      Available
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-300" />
                      Booked / unavailable
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      Selected
                    </div>
                  </div>

                  {/* SELECTED SLOT */}

                  {selectedSlot && (
                    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        Selected Appointment
                      </p>

                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-blue-900">
                            {formatDate(
                              selectedDate
                            )}
                          </p>

                          <p className="text-blue-700 font-semibold mt-1">
                            {formatTime(
                              selectedSlot.start_time
                            )}{" "}
                            –{" "}
                            {formatTime(
                              selectedSlot.end_time
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={
                            handleBooking
                          }
                          disabled={
                            booking
                          }
                          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          {booking
                            ? "Booking..."
                            : "Confirm Appointment →"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NO AVAILABLE SLOTS */}

                  {availableSlots.length ===
                    0 &&
                    unavailableSlots.length >
                      0 && (
                      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                        <p className="font-semibold text-amber-800">
                          All slots are currently
                          unavailable.
                        </p>

                        <p className="text-sm text-amber-700 mt-1">
                          Please choose another
                          date.
                        </p>
                      </div>
                    )}
                </>
              )}
          </section>
        </div>

        {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/my-appointments"
              )
            }
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            View My Appointments
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/counsellors")
            }
            className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
          >
            Choose Another Counsellor
          </button>
        </div>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm">
          © 2026 Get Your Seat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default CounsellorBooking;