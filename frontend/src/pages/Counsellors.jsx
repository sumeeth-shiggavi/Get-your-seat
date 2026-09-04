import { useEffect, useState } from "react";

function Counsellors() {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCounsellor, setSelectedCounsellor] = useState(null);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");

  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/counsellors"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch counsellors"
          );
        }

        setCounsellors(data.data);
      } catch (err) {
        console.error("Counsellor fetch error:", err);

        setError(
          err.message || "Unable to connect to server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellors();
  }, []);

  const openBooking = (counsellor) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login before booking a consultation.");
      return;
    }

    setSelectedCounsellor(counsellor);
    setAppointmentDate("");
    setStartTime("");
    setNotes("");
    setBookingMessage("");
    setBookingError("");
  };

  const closeBooking = () => {
    setSelectedCounsellor(null);
    setBookingMessage("");
    setBookingError("");
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    setBookingMessage("");
    setBookingError("");

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setBookingError("Please login before booking.");
      return;
    }

    if (!appointmentDate || !startTime) {
      setBookingError("Please select date and time.");
      return;
    }

    /*
      Currently appointments are created for a
      30-minute consultation.
    */
    const start = new Date(`1970-01-01T${startTime}:00`);

    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const endTime = end.toTimeString().slice(0, 5);

    setBooking(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: user.id,
            counsellor_id: selectedCounsellor.id,
            appointment_date: appointmentDate,
            start_time: startTime,
            end_time: endTime,
            notes: notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to book appointment."
        );
      }

      setBookingMessage(
        "Appointment booked successfully!"
      );

      setAppointmentDate("");
      setStartTime("");
      setNotes("");
    } catch (err) {
      console.error("Booking error:", err);

      setBookingError(
        err.message || "Unable to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold">
            Expert Counsellors
          </h1>

          <p className="mt-4 text-blue-100 text-lg">
            Get personalized guidance for your college admission journey
          </p>
        </div>
      </section>

      {/* Counsellors */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        {loading && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              Loading counsellors...
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-700 rounded-xl p-5 text-center">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          counsellors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">
                No counsellors available at the moment.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          counsellors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {counsellors.map((counsellor) => (
                <div
                  key={counsellor.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition"
                >

                  {/* Profile */}
                  <div className="flex justify-center mb-5">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-4xl">
                        👨‍🏫
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 text-center">
                    {counsellor.full_name}
                  </h2>

                  {/* Verified */}
                  {counsellor.is_verified && (
                    <div className="flex justify-center mt-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Verified Counsellor
                      </span>
                    </div>
                  )}

                  {/* Specialization */}
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-500">
                      SPECIALIZATION
                    </p>

                    <p className="text-gray-800 font-medium mt-1">
                      {counsellor.specialization}
                    </p>
                  </div>

                  {/* Experience */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-500">
                      EXPERIENCE
                    </p>

                    <p className="text-gray-800 font-medium mt-1">
                      {counsellor.experience_years} years
                    </p>
                  </div>

                  {/* Qualification */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-500">
                      QUALIFICATION
                    </p>

                    <p className="text-gray-800 font-medium mt-1">
                      {counsellor.qualification}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-500">
                      ABOUT
                    </p>

                    <p className="text-gray-600 mt-1 leading-relaxed">
                      {counsellor.bio}
                    </p>
                  </div>

                  {/* Fee */}
                  <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between">

                    <div>
                      <p className="text-sm text-gray-500">
                        Consultation Fee
                      </p>

                      <p className="text-xl font-bold text-blue-700">
                        ₹{counsellor.consultation_fee}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        openBooking(counsellor)
                      }
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Consult
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}
      </section>

      {/* Booking Modal */}
      {selectedCounsellor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Book Consultation
                </h2>

                <p className="text-gray-500 mt-1">
                  {selectedCounsellor.full_name}
                </p>
              </div>

              <button
                onClick={closeBooking}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>

            </div>

            {/* Success */}
            {bookingMessage && (
              <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-5">
                {bookingMessage}
              </div>
            )}

            {/* Error */}
            {bookingError && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-5">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBooking}>

              {/* Date */}
              <label className="block font-semibold text-gray-700 mb-2">
                Appointment Date
              </label>

              <input
                type="date"
                value={appointmentDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setAppointmentDate(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Time */}
              <label className="block font-semibold text-gray-700 mb-2">
                Start Time
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-sm text-gray-500 mb-5">
                Consultation duration: 30 minutes
              </p>

              {/* Notes */}
              <label className="block font-semibold text-gray-700 mb-2">
                Your Query
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Tell the counsellor what you need help with..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Buttons */}
              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeBooking}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={booking}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {booking
                    ? "Booking..."
                    : "Book Appointment"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default Counsellors;