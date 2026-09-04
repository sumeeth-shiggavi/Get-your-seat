import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CounsellorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    specialization: "",
    experience_years: "",
    qualification: "",
    bio: "",
    consultation_fee: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.phone ||
      !formData.specialization ||
      formData.experience_years === "" ||
      !formData.qualification
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      formData.password !==
      formData.confirm_password
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/counsellor-auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            specialization:
              formData.specialization,
            experience_years:
              Number(formData.experience_years),
            qualification:
              formData.qualification,
            bio: formData.bio,
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
            "Counsellor registration failed."
        );
      }

      setSuccess(
        "Counsellor registration successful! Redirecting to login..."
      );

      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        phone: "",
        specialization: "",
        experience_years: "",
        qualification: "",
        bio: "",
        consultation_fee: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Counsellor registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">

      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="bg-white rounded-2xl shadow-md p-8">

          <div className="text-center mb-8">

            <div className="text-5xl mb-3">
              👨‍⚕️
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Counsellor Registration
            </h1>

            <p className="text-gray-500 mt-2">
              Create your counsellor account on
              Get Your Seat
            </p>

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

          <form onSubmit={handleSubmit}>

            {/* Personal Information */}

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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

            {/* Password */}

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">
              Account Security
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>

                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* Professional Information */}

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
                  placeholder="Example: 5"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                rows="5"
                placeholder="Tell students about your experience and expertise..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Register as Counsellor"}
            </button>

          </form>

          {/* Login */}

          <div className="text-center mt-6">

            <p className="text-gray-500">
              Already have a counsellor account?
            </p>

            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-semibold hover:underline mt-1"
            >
              Login here
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CounsellorRegister;