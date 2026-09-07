import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

export default function CounsellorLogin() {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showPassword, setShowPassword] =
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
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const email =
        form.email.trim();

      if (!email) {
        setError(
          "Please enter your email address."
        );
        return;
      }

      if (!form.password) {
        setError(
          "Please enter your password."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/counsellor-auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                email,
                password:
                  form.password,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to login."
          );
        }

        const token =
          result.token ||
          result.data?.token;

        const user =
          result.user ||
          result.data?.user;

        if (!token || !user) {
          throw new Error(
            "Login succeeded, but account information was not returned."
          );
        }

        localStorage.setItem(
          "token",
          token
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            role: "counsellor",
          })
        );

        navigate(
          "/counsellor-dashboard",
          {
            replace: true,
          }
        );
      } catch (requestError) {
        console.error(
          "Counsellor login error:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to login. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
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
            Counsellor Login
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to manage your
            counselling sessions and
            student appointments.
          </p>
        </div>

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              COUNSELLOR BADGE
          ================================================= */}

          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                🧑‍💼
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Counsellor Portal
                </p>

                <p className="text-xs text-blue-700 mt-0.5">
                  Verified counsellors
                  only
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
            {/* Email */}

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
                value={form.email}
                onChange={
                  handleChange
                }
                placeholder="counsellor@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password */}

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
                  autoComplete="current-password"
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading
                ? "Signing In..."
                : "Sign In as Counsellor"}
            </button>
          </form>

          {/* =================================================
              STUDENT LOGIN
          ================================================= */}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Are you a student?
            </p>

            <Link
              to="/login"
              className="inline-block mt-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Student Login
            </Link>
          </div>
        </div>

        {/* =================================================
            NOTE
        ================================================= */}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 leading-5">
            New counsellors must be
            verified by the
            administrator before
            accessing the counsellor
            portal.
          </p>
        </div>
      </div>
    </div>
  );
}