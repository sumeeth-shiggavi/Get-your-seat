import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

export default function CollegeDetails() {
  const { id } =
    useParams();

  const [college, setCollege] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH COLLEGE DETAILS
  // =====================================================

  useEffect(() => {
    const fetchCollegeDetails =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/college-details/${id}`
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Failed to fetch college details."
            );
          }

          const data =
            result.data ||
            result.college ||
            result;

          setCollege(data);
        } catch (err) {
          console.error(
            "College details error:",
            err
          );

          setError(
            err.message ||
              "Unable to load college details."
          );
        } finally {
          setLoading(false);
        }
      };

    if (id) {
      fetchCollegeDetails();
    }
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />

          <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 animate-pulse">

            <div className="flex flex-col md:flex-row gap-6">

              <div className="w-20 h-20 rounded-2xl bg-slate-200" />

              <div className="flex-1">

                <div className="h-8 w-2/3 bg-slate-200 rounded" />

                <div className="mt-4 h-4 w-1/3 bg-slate-200 rounded" />

                <div className="mt-3 h-4 w-1/2 bg-slate-200 rounded" />

              </div>

            </div>

          </div>

          <div className="mt-6 grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 h-72 bg-white border border-slate-200 rounded-2xl animate-pulse" />

            <div className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse" />

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !college) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">

          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">

            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>

          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            College not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "We couldn't find the requested college."}
          </p>

          <Link
            to="/colleges"
            className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Back to Colleges
          </Link>

        </div>

      </div>
    );
  }

  // =====================================================
  // NORMALISE DATA
  // =====================================================

  const courses =
    college.courses ||
    college.college_courses ||
    college.course_details ||
    [];

  const website =
    college.website;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <div className="flex items-center gap-2 text-sm">

            <Link
              to="/colleges"
              className="text-slate-400 hover:text-blue-600 transition"
            >
              Colleges
            </Link>

            <span className="text-slate-300">
              /
            </span>

            <span className="text-slate-600 font-medium truncate">
              {college.name ||
                "College Details"}
            </span>

          </div>

        </div>

      </section>

      {/* =================================================
          COLLEGE HERO
      ================================================= */}

      <section className="bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">

            <div className="flex flex-col sm:flex-row gap-6">

              {/* College Icon */}

              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-5h6v5" />
                  <path d="M9 9h.01" />
                  <path d="M12 9h.01" />
                  <path d="M15 9h.01" />
                  <path d="M9 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M15 12h.01" />
                </svg>

              </div>

              <div>

                {college.short_name && (
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                    {
                      college.short_name
                    }
                  </p>
                )}

                <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 max-w-3xl">
                  {college.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">

                  <span className="inline-flex items-center gap-2">

                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                      />
                    </svg>

                    {[
                      college.city,
                      college.state,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                      "Location unavailable"}

                  </span>

                  {college.college_type && (
                    <span className="inline-flex items-center gap-2">

                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 19h16" />
                        <path d="M6 17V5h12v12" />
                        <path d="M9 8h6" />
                        <path d="M9 11h6" />
                      </svg>

                      {
                        college.college_type
                      }

                    </span>
                  )}

                </div>

              </div>

            </div>

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition whitespace-nowrap"
              >
                Visit Official Website

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14 21 3" />
                  <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
                </svg>

              </a>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">

            {/* About */}

            {college.description && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />
                      <path d="M12 11v5" />
                      <path d="M12 8h.01" />
                    </svg>

                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    About the College
                  </h2>

                </div>

                <p className="mt-5 text-sm sm:text-base leading-7 text-slate-600 whitespace-pre-line">
                  {
                    college.description
                  }
                </p>

              </section>
            )}

            {/* Courses */}

            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="p-6 sm:p-8 border-b border-slate-100">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>

                    <h2 className="text-xl font-bold text-slate-900">
                      Courses & Branches
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Available academic programmes at this college.
                    </p>

                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    {courses.length}{" "}
                    {courses.length ===
                    1
                      ? "course"
                      : "courses"}
                  </span>

                </div>

              </div>

              {courses.length >
              0 ? (
                <div className="divide-y divide-slate-100">

                  {courses.map(
                    (
                      course,
                      index
                    ) => (
                      <div
                        key={
                          course.id ||
                          index
                        }
                        className="p-6 sm:px-8 hover:bg-slate-50 transition"
                      >

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">

                          <div className="flex items-start gap-4">

                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-bold text-sm">
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div>

                              <h3 className="font-semibold text-slate-900">
                                {
                                  course.course_name ||
                                  course.name ||
                                  course.course ||
                                  "Course"
                                }
                              </h3>

                              {(course.branch_name ||
                                course.branch ||
                                course.branch_name) && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    course.branch_name ||
                                    course.branch
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2 sm:justify-end">

                            {course.total_seats !==
                              undefined &&
                              course.total_seats !==
                                null && (
                                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                                  {
                                    course.total_seats
                                  }{" "}
                                  seats
                                </span>
                              )}

                            {course.exam_name && (
                              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                                {
                                  course.exam_name
                                }
                              </span>
                            )}

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="p-10 text-center">

                  <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">

                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M4 19h16" />
                      <path d="M6 17V5h12v12" />
                      <path d="M9 8h6" />
                      <path d="M9 11h6" />
                    </svg>

                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Course information is not available yet.
                  </p>

                </div>
              )}

            </section>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6">

            {/* Quick Information */}

            <section className="bg-white border border-slate-200 rounded-2xl p-6">

              <h2 className="text-lg font-bold text-slate-900">
                College Information
              </h2>

              <div className="mt-5 space-y-4">

                <InfoRow
                  label="College Type"
                  value={
                    college.college_type
                  }
                />

                <InfoRow
                  label="City"
                  value={
                    college.city
                  }
                />

                <InfoRow
                  label="State"
                  value={
                    college.state
                  }
                />

                <InfoRow
                  label="Courses"
                  value={
                    courses.length ||
                    "Not available"
                  }
                />

              </div>

            </section>

            {/* Predictor CTA */}

            <section className="rounded-2xl bg-slate-900 p-6">

              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">

                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 16 4-5 3 3 5-7" />
                </svg>

              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                Check your admission chances
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                See whether this college could be a
                good match for your rank.
              </p>

              <Link
                to="/predictor"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Open College Predictor

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </Link>

            </section>

            {/* Back */}

            <Link
              to="/colleges"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              ← Back to All Colleges
            </Link>

          </aside>

        </div>

      </main>

    </div>
  );
}

// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-700 text-right">
        {value ||
          "Not available"}
      </span>

    </div>
  );
}