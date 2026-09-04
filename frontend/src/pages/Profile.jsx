import { useEffect, useState } from "react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        setError(
          "Please login to view your profile."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/profile/${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch profile."
        );
      }

      setProfile(data.data);
    } catch (err) {
      console.error(
        "Profile fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE PROFILE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {
      setError(
        "Please login to update your profile."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: profile.full_name,
            phone: profile.phone,
            date_of_birth:
              profile.date_of_birth || null,
            gender: profile.gender,
            city: profile.city,
            state: profile.state,
            preferred_course:
              profile.preferred_course,
            preferred_location:
              profile.preferred_location,
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

      setProfile(data.data);

      // Update navbar user information
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            full_name:
              data.data.full_name,
            phone: data.data.phone,
          })
        );
      }

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
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
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {
      setPasswordError(
        "Please login to change your password."
      );
      return;
    }

    // -------------------------------------------------
    // Validate passwords
    // -------------------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    setChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/password/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password:
              currentPassword,
            new_password: newPassword,
            confirm_password:
              confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setPasswordError(
        err.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">
          Loading your profile...
        </p>
      </div>
    );
  }

  // =====================================================
  // PROFILE UNAVAILABLE
  // =====================================================

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

        <div className="bg-white rounded-2xl shadow-md p-10 text-center">

          <div className="text-5xl mb-4">
            👤
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Profile Unavailable
          </h2>

          <p className="text-red-600 mt-3">
            {error ||
              "Unable to load profile."}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-blue-700 text-white py-14">

        <div className="max-w-5xl mx-auto px-6">

          <h1 className="text-4xl font-bold">
            My Profile
          </h1>

          <p className="mt-3 text-blue-100 text-lg">
            Manage your personal information,
            preferences and account security
          </p>

        </div>

      </section>


      {/* =================================================
          PROFILE FORM
      ================================================= */}

      <section className="max-w-5xl mx-auto px-6 py-12">

        {/* Profile message */}

        {message && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-xl p-4 mb-6 text-center font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mb-6 text-center font-semibold">
            {error}
          </div>
        )}


        {/* =================================================
            PERSONAL INFORMATION CARD
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
        >

          {/* Profile heading */}

          <div className="bg-gray-50 px-8 py-7 border-b border-gray-200">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">

                <span className="text-4xl">
                  👤
                </span>

              </div>

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.full_name}
                </h2>

                <p className="text-gray-500">
                  Student
                </p>

              </div>

            </div>

          </div>


          <div className="p-8">

            {/* Personal Information */}

            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={
                    profile.full_name ||
                    ""
                  }
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Email */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={
                    profile.email || ""
                  }
                  disabled
                  className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-4 py-3 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed.
                </p>

              </div>


              {/* Phone */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    profile.phone || ""
                  }
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Date of Birth */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={
                    profile.date_of_birth
                      ? profile.date_of_birth.split(
                          "T"
                        )[0]
                      : ""
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* Gender */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>

                <select
                  name="gender"
                  value={
                    profile.gender || ""
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* City */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={
                    profile.city || ""
                  }
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* State */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={
                    profile.state || ""
                  }
                  onChange={handleChange}
                  placeholder="Enter state"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>


            {/* =================================================
                COUNSELLING PREFERENCES
            ================================================= */}

            <div className="mt-10 pt-8 border-t border-gray-200">

              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Counselling Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Preferred Course */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Course
                  </label>

                  <input
                    type="text"
                    name="preferred_course"
                    value={
                      profile.preferred_course ||
                      ""
                    }
                    onChange={handleChange}
                    placeholder="Example: Engineering"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>


                {/* Preferred Location */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Location
                  </label>

                  <input
                    type="text"
                    name="preferred_location"
                    value={
                      profile.preferred_location ||
                      ""
                    }
                    onChange={handleChange}
                    placeholder="Example: Bengaluru"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              </div>

            </div>


            {/* Save Profile */}

            <div className="mt-10 pt-8 border-t border-gray-200 flex justify-end">

              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </form>


        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-2xl shadow-md border border-gray-200 mt-8 p-8"
        >

          <div className="flex items-center gap-4 mb-7">

            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">

              <span className="text-2xl">
                🔐
              </span>

            </div>

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Change Password
              </h2>

              <p className="text-gray-500 mt-1">
                Keep your account secure by
                updating your password
              </p>

            </div>

          </div>


          {/* Password success */}

          {passwordMessage && (
            <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-5 text-center font-semibold">
              {passwordMessage}
            </div>
          )}


          {/* Password error */}

          {passwordError && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-5 text-center font-semibold">
              {passwordError}
            </div>
          )}


          <div className="space-y-5">

            {/* Current Password */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* New Password */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                Password must contain at least
                6 characters.
              </p>

            </div>


            {/* Confirm Password */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>


          {/* Change Password Button */}

          <div className="mt-7 flex justify-end">

            <button
              type="submit"
              disabled={changingPassword}
              className="px-7 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}

export default Profile;