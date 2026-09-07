import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  specialization: "",
  experience_years: "",
  qualification: "",
  bio: "",
  consultation_fee: "",
};

export default function CounsellorRegister() {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

  const validateForm = () => {
    if (
      !form.full_name.trim()
    ) {
      return "Please enter your full name.";
    }

    if (
      form.full_name.trim()
        .length < 2
    ) {
      return "Full name must contain at least 2 characters.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!form.password) {
      return "Please create a password.";
    }

    if (
      form.password.length < 6
    ) {
      return "Password must contain at least 6 characters.";
    }

    if (
      form.password !==
      form.confirm_password
    ) {
      return "Passwords do not match.";
    }

    if (
      !form.specialization.trim()
    ) {
      return "Please enter your specialization.";
    }

    if (
      !form.qualification.trim()
    ) {
      return "Please enter your qualification.";
    }

    const experience =
      Number(
        form.experience_years
      );

    if (
      !Number.isInteger(
        experience
      ) ||
      experience < 0
    ) {
      return "Please enter a valid number of experience years.";
    }

    const fee =
      Number(
        form.consultation_fee
      );

    if (
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      return "Please enter a valid consultation fee.";
    }

    return "";
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError
        );

        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                full_name:
                  form.full_name.trim(),
                email:
                  form.email.trim(),
                phone:
                  form.phone.trim() ||
                  null,
                password:
                  form.password,
                specialization:
                  form.specialization.trim(),
                experience_years:
                  Number(
                    form.experience_years
                  ),
                qualification:
                  form.qualification.trim(),
                bio:
                  form.bio.trim() ||
                  null,
                consultation_fee:
                  Number(
                    form.consultation_fee
                  ),
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Counsellor registration failed."
          );
        }

        setSuccess(
          result.message ||
            "Registration successful. Your account is awaiting verification."
        );

        setForm(
          initialForm
        );

        setTimeout(() => {
          navigate(
            "/counsellor-login",
            {
              replace: true,
            }
          );
        }, 1500);
      } catch (requestError) {
        console.error(
          "Counsellor registration error:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to create counsellor account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              G
            </div>

            <span className="text-2xl font-bold text-slate-900">
              Get Your Seat
            </span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold text-slate-900">
            Become a Counsellor
          </h1>

          <p className="mt-2 text-slate-500">
            Create your professional
            profile and help students
            make better admission
            decisions.
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-7"
          >
            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter the details students
                  will use to identify you.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Full Name
                  </label>

                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    value={
                      form.full_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Account Security
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Create a password"
                      className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={
                        form.confirm_password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                PROFESSIONAL INFORMATION
            ================================================= */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Professional Information
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  These details will appear
                  on your counsellor profile.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                      placeholder="e.g. KCET & Engineering Admissions"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

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
                      placeholder="e.g. M.Tech, MBA"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="experience_years"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Experience
                      <span className="ml-1 font-normal text-slate-400">
                        (years)
                      </span>
                    </label>

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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="consultation_fee"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Consultation Fee
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        ₹
                      </span>

                      <input
                        id="consultation_fee"
                        name="consultation_fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.consultation_fee
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="500"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

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
                    rows="5"
                    value={
                      form.bio
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tell students about your experience, expertise and counselling approach..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Keep your bio clear and
                    student-friendly.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                VERIFICATION NOTICE
            ================================================= */}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <div className="text-xl">
                  🔐
                </div>

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Verification Required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Your counsellor profile
                    will be reviewed by the
                    administrator. You can
                    log in after your account
                    has been verified.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading
                ? "Creating Counsellor Account..."
                : "Create Counsellor Account"}
            </button>
          </form>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <div className="mt-7 pt-7 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already registered as a
              counsellor?
            </p>

            <Link
              to="/counsellor-login"
              className="inline-block mt-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Counsellor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}