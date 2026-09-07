import React, {
  useEffect,
  useState,
} from "react";

const API_BASE_URL =
  "http://localhost:5000";

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    return null;
  }
};

const getUserId = (user) => {
  return (
    user?.user_id ??
    user?.id ??
    null
  );
};

const getToken = () => {
  return localStorage.getItem(
    "token"
  );
};

const initialForm = {
  specialization: "",
  experience_years: "",
  qualification: "",
  bio: "",
  consultation_fee: "",
};

export default function CounsellorProfile() {
  const [user, setUser] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [verified, setVerified] =
    useState(false);

  useEffect(() => {
    const storedUser =
      getStoredUser();

    if (!storedUser) {
      setError(
        "Please log in to access your counsellor profile."
      );

      setLoading(false);

      return;
    }

    if (
      storedUser.role &&
      storedUser.role !==
        "counsellor"
    ) {
      setError(
        "Only counsellors can access this page."
      );

      setLoading(false);

      return;
    }

    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile =
    async () => {
      const userId =
        getUserId(user);

      const token =
        getToken();

      if (!userId || !token) {
        setError(
          "Authentication information is missing. Please log in again."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-profile/${userId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load profile."
          );
        }

        const profile =
          result.data ||
          result.counsellor ||
          {};

        setForm({
          specialization:
            profile.specialization ||
            "",
          experience_years:
            profile.experience_years ??
            "",
          qualification:
            profile.qualification ||
            "",
          bio:
            profile.bio ||
            "",
          consultation_fee:
            profile.consultation_fee ??
            "",
        });

        setVerified(
          profile.is_verified ===
            true
        );
      } catch (requestError) {
        console.error(
          "Load counsellor profile error:",
          requestError
        );

        setError(
          requestError.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const userId =
        getUserId(user);

      const token =
        getToken();

      if (!userId || !token) {
        setError(
          "Authentication information is missing. Please log in again."
        );

        return;
      }

      const experience =
        Number(
          form.experience_years
        );

      const fee =
        Number(
          form.consultation_fee
        );

      if (
        form.experience_years !==
          "" &&
        (!Number.isInteger(
          experience
        ) ||
          experience < 0)
      ) {
        setError(
          "Experience must be a valid non-negative whole number."
        );

        return;
      }

      if (
        form.consultation_fee !==
          "" &&
        (Number.isNaN(fee) ||
          fee < 0)
      ) {
        setError(
          "Consultation fee must be a valid non-negative amount."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-profile/${userId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                specialization:
                  form.specialization.trim(),
                experience_years:
                  form.experience_years ===
                  ""
                    ? null
                    : experience,
                qualification:
                  form.qualification.trim(),
                bio:
                  form.bio.trim(),
                consultation_fee:
                  form.consultation_fee ===
                  ""
                    ? null
                    : fee,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to update profile."
          );
        }

        const profile =
          result.data ||
          result.counsellor ||
          {};

        setVerified(
          profile.is_verified ===
            true
        );

        setSuccess(
          "Your counsellor profile has been updated successfully."
        );

        await loadProfile();
      } catch (requestError) {
        console.error(
          "Update counsellor profile error:",
          requestError
        );

        setError(
          requestError.message ||
            "Failed to update profile."
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Counsellor Profile
          </h1>

          <p className="mt-2 text-slate-600">
            {error ||
              "Please log in to continue."}
          </p>
        </div>
      </div>
    );
  }

  const counsellorName =
    user.full_name ||
    "Counsellor";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl font-bold">
              {counsellorName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">
                  {counsellorName}
                </h1>

                {verified && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 text-xs font-semibold">
                    ✓ Verified Counsellor
                  </span>
                )}
              </div>

              <p className="mt-2 text-blue-100">
                Manage your professional
                information and
                consultation details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =================================================
              PROFILE SUMMARY
          ================================================= */}

          <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
            <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              {counsellorName
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              {counsellorName}
            </h2>

            <p className="mt-1 text-sm text-slate-500 break-all">
              {user.email ||
                "Email not available"}
            </p>

            {user.phone && (
              <p className="mt-1 text-sm text-slate-500">
                {user.phone}
              </p>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Verification
              </p>

              <div className="mt-2">
                {verified ? (
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                    ✓ Profile Verified
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                    Verification Pending
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Profile tip
              </p>

              <p className="mt-1 text-sm text-blue-700 leading-6">
                Keep your qualification,
                specialization and
                experience information
                updated so students can
                choose the right
                counsellor.
              </p>
            </div>
          </aside>

          {/* =================================================
              EDIT FORM
          ================================================= */}

          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Professional Profile
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Counsellor Information
              </h2>

              <p className="mt-1 text-slate-500">
                Update the information
                students see before
                booking a consultation.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >
              {/* Specialization */}

              <div>
                <label
                  htmlFor="specialization"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Specialization
                </label>

                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  value={
                    form.specialization
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. NEET & Medical Admissions"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Qualification */}

              <div>
                <label
                  htmlFor="qualification"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Qualification
                </label>

                <input
                  id="qualification"
                  name="qualification"
                  type="text"
                  value={
                    form.qualification
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. MBBS, MBA, M.Tech"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Experience + Fee */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="experience_years"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Experience
                  </label>

                  <div className="relative">
                    <input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.experience_years
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 pr-16 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      years
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="consultation_fee"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Consultation Fee
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ₹
                    </span>

                    <input
                      id="consultation_fee"
                      name="consultation_fee"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.consultation_fee
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="500"
                      className="w-full px-4 py-3 pl-8 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Professional Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows="6"
                  value={form.bio}
                  onChange={
                    handleChange
                  }
                  placeholder="Tell students about your experience, expertise and how you can help them..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <p className="mt-2 text-xs text-slate-400">
                  A clear and informative
                  bio helps students
                  understand your
                  expertise.
                </p>
              </div>

              {/* Buttons */}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    loadProfile
                  }
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}