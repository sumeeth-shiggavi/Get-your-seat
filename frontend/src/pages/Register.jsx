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
};

export default function Register() {
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
    const fullName =
      form.full_name.trim();

    const email =
      form.email.trim();

    const phone =
      form.phone.trim();

    if (!fullName) {
      return "Please enter your full name.";
    }

    if (fullName.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!email) {
      return "Please enter your email address.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(email)
    ) {
      return "Please enter a valid email address.";
    }

    if (phone) {
      const phonePattern =
        /^[0-9+\-\s()]{7,20}$/;

      if (
        !phonePattern.test(phone)
      ) {
        return "Please enter a valid phone number.";
      }
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
            `${API_BASE_URL}/api/auth/register`,
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
                role: "student",
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Registration failed. Please try again."
          );
        }

        const token =
          result.token ||
          result.data?.token;

        const user =
          result.user ||
          result.data?.user;

        // =================================================
        // IF BACKEND LOGS USER IN AFTER REGISTRATION
        // =================================================

        if (token && user) {
          localStorage.setItem(
            "token",
            token
          );

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );

          setSuccess(
            "Account created successfully. Redirecting..."
          );

          setTimeout(() => {
            if (
              user.role ===
              "counsellor"
            ) {
              navigate(
                "/counsellor-dashboard",
                {
                  replace: true,
                }
              );
            } else {
              navigate("/", {
                replace: true,
              });
            }
          }, 700);

          return;
        }

        // =================================================
        // NORMAL STUDENT REGISTRATION
        // =================================================

        setSuccess(
          "Account created successfully. Please log in."
        );

        setForm(
          initialForm
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1000);
      } catch (requestError) {
        console.error(
          "Registration error:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to create your account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
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
            Create Your Account
          </h1>

          <p className="mt-2 text-slate-500">
            Start your journey towards
            finding the right college
            and course.
          </p>
        </div>

        {/* =================================================
            REGISTER CARD
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
            {/* =================================================
                NAME
            ================================================= */}

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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* =================================================
                EMAIL + PHONE
            ================================================= */}

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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Phone Number
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    (optional)
                  </span>
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

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
                  className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Use at least 6
                characters.
              </p>
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

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
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {/* =================================================
                ROLE INFORMATION
            ================================================= */}

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  🎓
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Student Account
                  </p>

                  <p className="mt-1 text-sm text-blue-700 leading-6">
                    Your account will be
                    created as a student.
                    You can explore
                    colleges, use the
                    predictor and book
                    counselling sessions.
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
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an
              account?
            </p>

            <Link
              to="/login"
              className="inline-block mt-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Sign in instead
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By creating an account,
          you can access personalised
          admission guidance through
          Get Your Seat.
        </p>
      </div>
    </div>
  );
}