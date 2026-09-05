import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Counsellors() {
  const navigate = useNavigate();

  const [counsellors, setCounsellors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // ------------------------------------------
  // Fetch counsellors
  // ------------------------------------------

  const fetchCounsellors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/counsellors"
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch counsellors."
        );
      }

      setCounsellors(
        data.data || []
      );
    } catch (error) {
      console.error(
        "Fetch counsellors error:",
        error
      );

      setError(
        error.message ||
          "Unable to load counsellors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

  // ------------------------------------------
  // Book appointment
  // ------------------------------------------

  const handleBookAppointment = (
    counsellorId
  ) => {
    if (!user) {
      alert(
        "Please login to book a counselling appointment."
      );

      navigate("/login");

      return;
    }

    if (user.role === "counsellor") {
      alert(
        "Counsellors cannot book counselling appointments."
      );

      return;
    }

    navigate(
      `/counsellor-booking?counsellor_id=${counsellorId}`
    );
  };

  // ------------------------------------------
  // Loading
  // ------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            👨‍🏫
          </div>

          <p className="text-lg text-gray-600">
            Loading counsellors...
          </p>

        </div>

      </div>
    );
  }

  // ------------------------------------------
  // Page
  // ------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-10">

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="text-center mb-10">

          <h1 className="text-4xl font-bold text-gray-800">
            🎓 Career Counsellors
          </h1>

          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Connect with experienced counsellors
            and get personalized guidance for your
            college admissions.
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 rounded-xl p-4 mb-8">

            <p className="font-semibold">
              {error}
            </p>

          </div>
        )}

        {/* No Counsellors */}

        {!error &&
          counsellors.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-5xl mb-4">
                📭
              </div>

              <h2 className="text-2xl font-bold text-gray-700">
                No Counsellors Available
              </h2>

              <p className="text-gray-500 mt-2">
                Counsellors will appear here once
                they are available.
              </p>

            </div>
          )}

        {/* Counsellor Cards */}

        {counsellors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {counsellors.map(
              (counsellor) => (
                <div
                  key={counsellor.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition"
                >

                  {/* Top Section */}

                  <div className="bg-blue-50 p-6">

                    <div className="flex items-center gap-4">

                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                        {counsellor.full_name
                          ? counsellor.full_name
                              .charAt(0)
                              .toUpperCase()
                          : "C"}
                      </div>

                      <div className="flex-1">

                        <h2 className="text-xl font-bold text-gray-800">
                          {counsellor.full_name}
                        </h2>

                        {counsellor.is_verified && (
                          <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-green-600">
                            ✓ Verified Counsellor
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="p-6">

                    <div className="space-y-4">

                      {/* Specialization */}

                      <div>

                        <p className="text-sm text-gray-500">
                          Specialization
                        </p>

                        <p className="font-semibold text-blue-700 mt-1">
                          🎯{" "}
                          {counsellor.specialization ||
                            "Admissions Counselling"}
                        </p>

                      </div>

                      {/* Qualification */}

                      <div>

                        <p className="text-sm text-gray-500">
                          Qualification
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          📚{" "}
                          {counsellor.qualification ||
                            "Qualified Counsellor"}
                        </p>

                      </div>

                      {/* Experience */}

                      <div>

                        <p className="text-sm text-gray-500">
                          Experience
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          💼{" "}
                          {counsellor.experience_years ||
                            0}{" "}
                          years
                        </p>

                      </div>

                      {/* Consultation Fee */}

                      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">

                        <div>

                          <p className="text-sm text-gray-500">
                            Consultation Fee
                          </p>

                          <p className="text-xl font-bold text-blue-700 mt-1">
                            ₹
                            {counsellor.consultation_fee ||
                              0}
                          </p>

                        </div>

                        <div className="text-3xl">
                          💬
                        </div>

                      </div>

                    </div>

                    {/* Bio */}

                    {counsellor.bio && (
                      <div className="mt-5">

                        <p className="text-sm text-gray-500">
                          About
                        </p>

                        <p className="text-gray-600 mt-1 line-clamp-3">
                          {counsellor.bio}
                        </p>

                      </div>
                    )}

                    {/* Book Button */}

                    <button
                      onClick={() =>
                        handleBookAppointment(
                          counsellor.id
                        )
                      }
                      className="w-full mt-6 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                      📅 Book Appointment
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

        {/* Information */}

        <div className="mt-10 bg-white rounded-2xl shadow-md p-6">

          <div className="flex flex-col md:flex-row items-start gap-4">

            <div className="text-4xl">
              💡
            </div>

            <div>

              <h3 className="text-xl font-bold text-gray-800">
                How Counselling Works
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">

                <div>

                  <div className="text-2xl">
                    1️⃣
                  </div>

                  <h4 className="font-bold text-gray-700 mt-2">
                    Choose a Counsellor
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Select a counsellor based on
                    their specialization and
                    experience.
                  </p>

                </div>

                <div>

                  <div className="text-2xl">
                    2️⃣
                  </div>

                  <h4 className="font-bold text-gray-700 mt-2">
                    Select a Slot
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Choose a convenient date and
                    available 30-minute time slot.
                  </p>

                </div>

                <div>

                  <div className="text-2xl">
                    3️⃣
                  </div>

                  <h4 className="font-bold text-gray-700 mt-2">
                    Get Guidance
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Attend your counselling session
                    and get personalized admission
                    guidance.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Counsellors;