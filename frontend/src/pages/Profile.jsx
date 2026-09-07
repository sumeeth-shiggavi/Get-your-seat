import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    city: "",
    state: "",
    preferred_course: "",
    preferred_location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [changingPassword, setChangingPassword] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser =
        JSON.parse(
          localStorage.getItem("user")
        );

      const token =
        localStorage.getItem("token");

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      setUser(storedUser);

      const userId =
        storedUser.id ||
        storedUser.user_id;

      if (!userId) {
        setError(
          "Unable to identify your account."
        );
        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/api/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (
        response.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load profile."
        );
      }

      const data =
        result.data ||
        result.profile ||
        result.user ||
        result;

      setProfile({
        full_name:
          data.full_name || "",
        email:
          data.email || "",
        phone:
          data.phone || "",
        date_of_birth:
          data.date_of_birth
            ? String(
                data.date_of_birth
              ).substring(0, 10)
            : "",
        gender:
          data.gender || "",
        city:
          data.city || "",
        state:
          data.state || "",
        preferred_course:
          data.preferred_course || "",
        preferred_location:
          data.preferred_location || "",
      });
    } catch (err) {
      console.error(
        "Load profile error:",
        err
      );

      setError(
        err.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handlePasswordChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setPasswordData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setMessage("");
    setError("");
  };

  const handleSaveProfile =
    async (event) => {
      event.preventDefault();

      setMessage("");
      setError("");

      if (
        !profile.full_name.trim()
      ) {
        setError(
          "Full name is required."
        );
        return;
      }

      if (
        !profile.email.trim()
      ) {
        setError(
          "Email is required."
        );
        return;
      }

      if (
        profile.phone &&
        !/^[0-9+\-\s()]{7,20}$/.test(
          profile.phone
        )
      ) {
        setError(
          "Please enter a valid phone number."
        );
        return;
      }

      try {
        setSaving(true);

        const token =
          localStorage.getItem("token");

        const storedUser =
          JSON.parse(
            localStorage.getItem("user")
          );

        const userId =
          storedUser?.id ||
          storedUser?.user_id;

        if (!token || !userId) {
          navigate("/login");
          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/profile/${userId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                full_name:
                  profile.full_name.trim(),
                email:
                  profile.email.trim(),
                phone:
                  profile.phone.trim(),
                date_of_birth:
                  profile.date_of_birth ||
                  null,
                gender:
                  profile.gender ||
                  null,
                city:
                  profile.city.trim() ||
                  null,
                state:
                  profile.state.trim() ||
                  null,
                preferred_course:
                  profile.preferred_course.trim() ||
                  null,
                preferred_location:
                  profile.preferred_location.trim() ||
                  null,
              }),
            }
          );

        const result =
          await response.json();

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );
          localStorage.removeItem(
            "user"
          );

          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to update profile."
          );
        }

        const updatedData =
          result.data ||
          result.profile ||
          result.user;

        if (updatedData) {
          setProfile((previous) => ({
            ...previous,
            ...updatedData,
            date_of_birth:
              updatedData.date_of_birth
                ? String(
                    updatedData.date_of_birth
                  ).substring(0, 10)
                : previous.date_of_birth,
          }));
        }

        const updatedUser = {
          ...storedUser,
          full_name:
            profile.full_name.trim(),
          email:
            profile.email.trim(),
          phone:
            profile.phone.trim(),
        };

        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedUser
          )
        );

        setUser(updatedUser);

        setMessage(
          "Your profile has been updated successfully."
        );
      } catch (err) {
        console.error(
          "Update profile error:",
          err
        );

        setError(
          err.message ||
            "Unable to update your profile."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleChangePassword =
    async (event) => {
      event.preventDefault();

      setMessage("");
      setError("");

      if (
        !passwordData.current_password
      ) {
        setError(
          "Please enter your current password."
        );
        return;
      }

      if (
        passwordData.new_password.length <
        6
      ) {
        setError(
          "New password must contain at least 6 characters."
        );
        return;
      }

      if (
        passwordData.new_password !==
        passwordData.confirm_password
      ) {
        setError(
          "New password and confirmation password do not match."
        );
        return;
      }

      try {
        setChangingPassword(
          true
        );

        const token =
          localStorage.getItem("token");

        const storedUser =
          JSON.parse(
            localStorage.getItem("user")
          );

        const userId =
          storedUser?.id ||
          storedUser?.user_id;

        if (!token || !userId) {
          navigate("/login");
          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/password/${userId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                current_password:
                  passwordData.current_password,
                new_password:
                  passwordData.new_password,
              }),
            }
          );

        const result =
          await response.json();

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );
          localStorage.removeItem(
            "user"
          );

          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to change password."
          );
        }

        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });

        setShowPasswordSection(
          false
        );

        setMessage(
          "Your password has been changed successfully."
        );
      } catch (err) {
        console.error(
          "Change password error:",
          err
        );

        setError(
          err.message ||
            "Unable to change your password."
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-page py-12">
          <div className="mx-auto max-w-4xl">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({
                  length: 8,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="space-y-2"
                    >
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <Link
                    to="/"
                    className="transition hover:text-blue-600"
                  >
                    Home
                  </Link>

                  <span>/</span>

                  <span className="font-medium text-slate-700">
                    Profile
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  My Profile
                </h1>

                <p className="mt-2 text-slate-600">
                  Manage your personal information
                  and counselling preferences.
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600">
                {(
                  profile.full_name ||
                  user?.full_name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container-page py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          {message && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              <span className="text-lg">
                ✓
              </span>

              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <span className="text-lg">
                !
              </span>

              <p>{error}</p>
            </div>
          )}

          <form
            onSubmit={
              handleSaveProfile
            }
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
              <h2 className="text-xl font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your account information
                up to date.
              </p>
            </div>

            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={
                    profile.full_name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your full name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    profile.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your email"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    profile.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your phone number"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={
                    profile.date_of_birth
                  }
                  onChange={
                    handleChange
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Gender
                </label>

                <select
                  name="gender"
                  value={
                    profile.gender
                  }
                  onChange={
                    handleChange
                  }
                  className="input-field"
                >
                  <option value="">
                    Select gender
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
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={
                    profile.city
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Bengaluru"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={
                    profile.state
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Karnataka"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred Course
                </label>

                <input
                  type="text"
                  name="preferred_course"
                  value={
                    profile.preferred_course
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Engineering / Medicine"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred Location
                </label>

                <input
                  type="text"
                  name="preferred_location"
                  value={
                    profile.preferred_location
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <Link
                to="/"
                className="btn-secondary text-center"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Account Security
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Keep your account secure by
                  using a strong password.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPasswordSection(
                    (previous) =>
                      !previous
                  )
                }
                className="btn-secondary whitespace-nowrap"
              >
                {showPasswordSection
                  ? "Close"
                  : "Change Password"}
              </button>
            </div>

            {showPasswordSection && (
              <form
                onSubmit={
                  handleChangePassword
                }
                className="border-t border-slate-200 bg-slate-50 px-6 py-7 sm:px-8"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Current Password
                    </label>

                    <input
                      type="password"
                      name="current_password"
                      value={
                        passwordData.current_password
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Enter current password"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      name="new_password"
                      value={
                        passwordData.new_password
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Minimum 6 characters"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      name="confirm_password"
                      value={
                        passwordData.confirm_password
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Confirm new password"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      changingPassword
                    }
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword
                      ? "Changing Password..."
                      : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                💡
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Looking for admission guidance?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Explore our verified counsellors
                  and book a counselling session
                  based on your admission goals.
                </p>

                <Link
                  to="/counsellors"
                  className="mt-4 inline-flex items-center font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Find a Counsellor
                  <span className="ml-2">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;