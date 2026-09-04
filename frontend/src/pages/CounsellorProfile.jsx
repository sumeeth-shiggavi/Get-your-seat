import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CounsellorProfile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    experience_years: "",
    qualification: "",
    bio: "",
    consultation_fee: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      if (!user || user.role !== "counsellor") {
        setError(
          "Please login as a counsellor to access this page."
        );

        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-profile/${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load counsellor profile."
        );
      }

      const profile = data.data;

      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        specialization:
          profile.specialization || "",
        experience_years:
          profile.experience_years ?? "",
        qualification:
          profile.qualification || "",
        bio: profile.bio || "",
        consultation_fee:
          profile.consultation_fee ?? "",
      });

    } catch (error) {
      console.error(
        "Counsellor profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.full_name ||
      !formData.phone ||
      !formData.specialization ||
      formData.experience_years === "" ||
      !formData.qualification
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    if (
      Number(formData.experience_years) < 0
    ) {
      setError(
        "Experience cannot be negative."
      );

      return;
    }

    if (
      formData.consultation_fee !== "" &&
      Number(formData.consultation_fee) < 0
    ) {
      setError(
        "Consultation fee cannot be negative."
      );

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/counsellor-profile/${user.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            full_name:
              formData.full_name,

            phone:
              formData.phone,

            specialization:
              formData.specialization,

            experience_years:
              Number(
                formData.experience_years
              ),

            qualification:
              formData.qualification,

            bio:
              formData.bio,

            consultation_fee:
              formData.consultation_fee === ""
                ? 0
                : Number(
                    formData.consultation_fee
                  ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update profile."
        );
      }

      // Update local user name
      if (data.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            ...data.data.user,
          })
        );
      }

      setSuccess(
        "Profile updated successfully."
      );

      // Reload profile data
      await fetchProfile();

    } catch (error) {
      console.error(
        "Update counsellor profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading counsellor profile...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">

      <div className="max-w-4xl mx-auto">

        {/* Header */}

        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                👨‍⚕️ Counsellor Profile
              </h1>

              <p className="text-gray-500 mt-2">
                Manage your professional information.
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


        {/* Error */}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}


        {/* Success */}

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}


        {/* Profile Form */}

        <div className="bg-white rounded-2xl shadow-md p-8">

          <form onSubmit={handleSubmit}>

            {/* Personal Information */}

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Email */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed.
                </p>

              </div>


              {/* Phone */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Phone *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>


            {/* Professional Information */}

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-5">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Specialization */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Specialization *
                </label>

                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select specialization
                  </option>

                  <option value="KCET & Engineering Admissions">
                    KCET & Engineering Admissions
                  </option>

                  <option value="JEE & Engineering Admissions">
                    JEE & Engineering Admissions
                  </option>

                  <option value="NEET & Medical Admissions">
                    NEET & Medical Admissions
                  </option>

                  <option value="University Admissions">
                    University Admissions
                  </option>

                  <option value="Career Counselling">
                    Career Counselling
                  </option>

                </select>

              </div>


              {/* Experience */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Experience (Years) *
                </label>

                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Qualification */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Qualification *
                </label>

                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="Example: M.Tech, Ph.D."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Consultation Fee */}

              <div>

                <label className="block font-semibold text-gray-700 mb-2">
                  Consultation Fee (₹)
                </label>

                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 500"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>


            {/* Bio */}

            <div className="mt-5">

              <label className="block font-semibold text-gray-700 mb-2">
                Professional Bio
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="6"
                placeholder="Tell students about your experience and expertise..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* Save Button */}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Profile Changes"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default CounsellorProfile;