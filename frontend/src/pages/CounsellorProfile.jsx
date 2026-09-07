import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CounsellorProfile() {
  const navigate = useNavigate();

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
  // GET STORED USER
  // =====================================================

  const getStoredUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      const token =
        localStorage.getItem("token");

      if (!storedUser || !token) {
        return {
          user: null,
          token: null,
        };
      }

      const parsedUser =
        JSON.parse(storedUser);

      const normalizedUser = {
        ...parsedUser,
        user_id:
          parsedUser.user_id ??
          parsedUser.id,
        id:
          parsedUser.id ??
          parsedUser.user_id,
      };

      return {
        user: normalizedUser,
        token,
      };
    } catch (err) {
      console.error(
        "Stored user parsing error:",
        err
      );

      return {
        user: null,
        token: null,
      };
    }
  };

  // =====================================================
  // LOGOUT / SESSION EXPIRY
  // =====================================================

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginData");

    navigate("/login");
  };

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setError("");

      const { user, token } =
        getStoredUser();

      if (!user || !token) {
        setError(
          "Please login as a counsellor to access this page."
        );

        setLoading(false);
        return;
      }

      if (user.role !== "counsellor") {
        setError(
          "You are not authorized to access the counsellor profile."
        );

        setLoading(false);
        return;
      }

      if (!user.user_id) {
        setError(
          "Unable to identify your account. Please login again."
        );

        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/counsellor-profile/${user.user_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to view this profile."
        );

        setLoading(false);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load counsellor profile."
        );
      }

      const profile = data.data;

      setFormData({
        full_name:
          profile.full_name || "",

        email:
          profile.email || "",

        phone:
          profile.phone || "",

        specialization:
          profile.specialization || "",

        experience_years:
          profile.experience_years ?? "",

        qualification:
          profile.qualification || "",

        bio:
          profile.bio || "",

        consultation_fee:
          profile.consultation_fee ?? "",
      });
    } catch (err) {
      console.error(
        "Counsellor profile error:",
        err
      );

      setError(
        err.message ||
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
  // HANDLE INPUT CHANGE
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

    const { user, token } =
      getStoredUser();

    if (!user || !token) {
      setError(
        "Please login as a counsellor to update your profile."
      );
      return;
    }

    if (user.role !== "counsellor") {
      setError(
        "You are not authorized to update this profile."
      );
      return;
    }

    if (!user.user_id) {
      setError(
        "Unable to identify your account. Please login again."
      );
      return;
    }

    // -------------------------------------------------
    // Required field validation
    // -------------------------------------------------

    if (
      !formData.full_name.trim() ||
      !formData.phone.trim() ||
      !formData.specialization ||
      formData.experience_years === "" ||
      !formData.qualification.trim()
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    // -------------------------------------------------
    // Experience validation
    // -------------------------------------------------

    if (
      Number(formData.experience_years) < 0
    ) {
      setError(
        "Experience cannot be negative."
      );

      return;
    }

    // -------------------------------------------------
    // Consultation fee validation
    // -------------------------------------------------

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
        `http://localhost:5000/api/counsellor-profile/${user.user_id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            full_name:
              formData.full_name.trim(),

            phone:
              formData.phone.trim(),

            specialization:
              formData.specialization,

            experience_years:
              Number(
                formData.experience_years
              ),

            qualification:
              formData.qualification.trim(),

            bio:
              formData.bio.trim(),

            consultation_fee:
              formData.consultation_fee === ""
                ? 0
                : Number(
                    formData.consultation_fee
                  ),
          }),
        }
      );

      const data =
        await response.json();

      // -------------------------------------------------
      // Authentication errors
      // -------------------------------------------------

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to update this profile."
        );

        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update profile."
        );
      }

      // -------------------------------------------------
      // Update form with returned data
      // -------------------------------------------------

      if (data.data) {
        const updatedProfile =
          data.data;

        setFormData({
          full_name:
            updatedProfile.full_name ||
            "",

          email:
            updatedProfile.email ||
            formData.email,

          phone:
            updatedProfile.phone ||
            "",

          specialization:
            updatedProfile.specialization ||
            "",

          experience_years:
            updatedProfile.experience_years ??
            "",

          qualification:
            updatedProfile.qualification ||
            "",

          bio:
            updatedProfile.bio ||
            "",

          consultation_fee:
            updatedProfile.consultation_fee ??
            "",
        });

        // -------------------------------------------------
        // Update stored user information
        // -------------------------------------------------

        const storedUser =
          getStoredUser().user;

        if (storedUser) {
          const returnedUser =
            updatedProfile.user || {};

          const updatedUser = {
            ...storedUser,
            ...returnedUser,
            full_name:
              updatedProfile.full_name ||
              returnedUser.full_name ||
              storedUser.full_name,
            phone:
              updatedProfile.phone ||
              returnedUser.phone ||
              storedUser.phone,
            user_id:
              storedUser.user_id,
            id:
              storedUser.id ??
              storedUser.user_id,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          localStorage.setItem(
            "loginData",
            JSON.stringify({
              user: updatedUser,
              token,
            })
          );
        }
      }

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Update counsellor profile error:",
        err
      );

      setError(
        err.message ||
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

        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}

        {/* =================================================
            PROFILE FORM
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-8">

          <form onSubmit={handleSubmit}>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

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
                  value={
                    formData.full_name
                  }
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
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
                  value={
                    formData.email
                  }
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
                  value={
                    formData.phone
                  }
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

            {/* =================================================
                PROFESSIONAL INFORMATION
            ================================================= */}

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
                  value={
                    formData.specialization
                  }
                  onChange={handleChange}
                  required
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
                  value={
                    formData.experience_years
                  }
                  onChange={handleChange}
                  min="0"
                  required
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
                  value={
                    formData.qualification
                  }
                  onChange={handleChange}
                  placeholder="Example: M.Tech, Ph.D."
                  required
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
                  value={
                    formData.consultation_fee
                  }
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 500"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

            {/* =================================================
                BIO
            ================================================= */}

            <div className="mt-5">

              <label className="block font-semibold text-gray-700 mb-2">
                Professional Bio
              </label>

              <textarea
                name="bio"
                value={
                  formData.bio
                }
                onChange={handleChange}
                rows="6"
                placeholder="Tell students about your experience and expertise..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                This information helps students understand your expertise.
              </p>

            </div>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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