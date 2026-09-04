import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CounsellorDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [counsellor, setCounsellor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [notes, setNotes] = useState("");

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      if (!user) {
        setError(
          "Please login to access the counsellor dashboard."
        );

        setLoading(false);
        return;
      }

      if (user.role !== "counsellor") {
        setError(
          "Only counsellors can access this dashboard."
        );

        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-dashboard/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load counsellor dashboard."
        );
      }

      setCounsellor(data.data.counsellor);
      setAppointments(data.data.appointments || []);

    } catch (error) {
      console.error(
        "Counsellor dashboard error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  const completeAppointment = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/counsellor-dashboard/appointments/${id}/complete`,
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to complete appointment."
        );
      }

      alert(
        "Appointment marked as completed."
      );

      fetchDashboard();

    } catch (error) {
      alert(error.message);
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

      const response = await fetch(
        `http://localhost:5000/api/counsellor-dashboard/appointments/${selectedAppointment.id}/notes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            notes: notes,
          }),
        }
      );

      const data = await response.json();

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

      fetchDashboard();

    } catch (error) {
      alert(error.message);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
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

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

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


            {/* Profile Button */}

            <button
              onClick={() =>
                navigate("/counsellor-profile")
              }
              className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              👤 My Profile
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}


        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <p className="text-gray-500">
              Total Appointments
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {appointments.length}
            </p>

          </div>


          {/* Upcoming */}

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


          {/* Completed */}

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


        {/* ================================================= */}
        {/* APPOINTMENTS */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              📅 Appointments
            </h2>

            <p className="text-gray-500 mt-1">
              Manage your counselling appointments.
            </p>

          </div>


          {/* No Appointments */}

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


      {/* ================================================= */}
      {/* NOTES MODAL */}
      {/* ================================================= */}

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