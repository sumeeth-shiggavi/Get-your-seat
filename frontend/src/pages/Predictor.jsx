import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

export default function Predictor() {
  const [exams, setExams] =
    useState([]);

  const [loadingExams, setLoadingExams] =
    useState(true);

  const [form, setForm] =
    useState({
      exam_id: "",
      rank: "",
      category: "General",
      quota: "All India",
    });

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searched, setSearched] =
    useState(false);

  // =====================================================
  // FETCH EXAMS
  // =====================================================

  useEffect(() => {
    const fetchExams =
      async () => {
        try {
          setLoadingExams(true);

          const response =
            await fetch(
              `${API_BASE_URL}/api/exams`
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Failed to fetch exams."
            );
          }

          const data =
            Array.isArray(result)
              ? result
              : result.data || [];

          setExams(data);
        } catch (err) {
          console.error(
            "Fetch exams error:",
            err
          );

          setError(
            err.message ||
              "Unable to load exams."
          );
        } finally {
          setLoadingExams(false);
        }
      };

    fetchExams();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // SUBMIT PREDICTION
  // =====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSearched(true);

      const rankNumber =
        Number(form.rank);

      if (
        !form.exam_id
      ) {
        setError(
          "Please select an examination."
        );

        return;
      }

      if (
        !form.rank ||
        !Number.isInteger(
          rankNumber
        ) ||
        rankNumber <= 0
      ) {
        setError(
          "Please enter a valid positive rank."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_BASE_URL}/api/predict`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                exam_id:
                  Number(
                    form.exam_id
                  ),
                rank:
                  rankNumber,
                category:
                  form.category,
                quota:
                  form.quota,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Prediction failed."
          );
        }

        const data =
          Array.isArray(result)
            ? result
            : result.data ||
              result.results ||
              [];

        setResults(data);
      } catch (err) {
        console.error(
          "Prediction error:",
          err
        );

        setResults([]);

        setError(
          err.message ||
            "Unable to generate predictions."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setForm({
      exam_id: "",
      rank: "",
      category: "General",
      quota: "All India",
    });

    setResults([]);
    setError("");
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              College Predictor
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Find colleges based on
              your rank.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-7">
              Enter your examination details and rank to
              discover colleges and courses that may match
              your admission chances.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">

          {/* =================================================
              FORM
          ================================================= */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 lg:sticky lg:top-24">

            <div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 16 4-5 3 3 5-7" />
                </svg>

              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Enter your details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We will compare your rank with available
                cutoff information.
              </p>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >

              {/* Exam */}

              <div>

                <label
                  htmlFor="exam_id"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Examination
                </label>

                <select
                  id="exam_id"
                  name="exam_id"
                  value={
                    form.exam_id
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loadingExams
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                >

                  <option value="">
                    {loadingExams
                      ? "Loading exams..."
                      : "Select examination"}
                  </option>

                  {exams.map(
                    (exam) => (
                      <option
                        key={
                          exam.id
                        }
                        value={
                          exam.id
                        }
                      >
                        {exam.name ||
                          exam.code}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Rank */}

              <div>

                <label
                  htmlFor="rank"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Your Rank
                </label>

                <input
                  id="rank"
                  name="rank"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.rank
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 1245"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Category */}

              <div>

                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >

                  <option value="General">
                    General
                  </option>

                  <option value="OBC">
                    OBC
                  </option>

                  <option value="SC">
                    SC
                  </option>

                  <option value="ST">
                    ST
                  </option>

                  <option value="EWS">
                    EWS
                  </option>

                </select>

              </div>

              {/* Quota */}

              <div>

                <label
                  htmlFor="quota"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Quota
                </label>

                <select
                  id="quota"
                  name="quota"
                  value={
                    form.quota
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >

                  <option value="All India">
                    All India
                  </option>

                  <option value="State">
                    State
                  </option>

                  <option value="Home State">
                    Home State
                  </option>

                  <option value="Other State">
                    Other State
                  </option>

                </select>

              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Buttons */}

              <div className="flex gap-3 pt-1">

                <button
                  type="submit"
                  disabled={
                    loading ||
                    loadingExams
                  }
                  className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Checking..."
                    : "Find Colleges"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleReset
                  }
                  className="px-4 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Reset
                </button>

              </div>

            </form>

            {/* Disclaimer */}

            <div className="mt-6 pt-5 border-t border-slate-100">

              <p className="text-xs leading-5 text-slate-400">
                Predictions are based on available cutoff
                information and should be used as a
                guidance tool, not as a guarantee of admission.
              </p>

            </div>

          </section>

          {/* =================================================
              RESULTS
          ================================================= */}

          <section>

            {!searched && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">

                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m7 16 4-5 3 3 5-7" />
                  </svg>

                </div>

                <h2 className="mt-6 text-xl font-bold text-slate-900">
                  Your predicted colleges will appear here
                </h2>

                <p className="mt-3 max-w-lg mx-auto text-sm leading-6 text-slate-500">
                  Enter your exam and rank on the left to
                  see colleges that match your admission
                  profile.
                </p>

              </div>
            )}

            {searched &&
              loading && (
                <div className="space-y-4">

                  {Array.from({
                    length: 4,
                  }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse"
                      >

                        <div className="flex gap-4">

                          <div className="w-12 h-12 rounded-xl bg-slate-100" />

                          <div className="flex-1">

                            <div className="h-5 w-2/3 bg-slate-100 rounded" />

                            <div className="mt-3 h-4 w-1/3 bg-slate-100 rounded" />

                            <div className="mt-5 h-4 w-full bg-slate-100 rounded" />

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            {searched &&
              !loading &&
              !error &&
              results.length ===
                0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">

                  <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">

                    <svg
                      width="28"
                      height="28"
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
                      <path d="M8 12h8" />
                    </svg>

                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    No matching colleges found
                  </h2>

                  <p className="mt-2 max-w-lg mx-auto text-sm leading-6 text-slate-500">
                    We couldn't find colleges matching the
                    information provided. Try another rank,
                    category or quota.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleReset
                    }
                    className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Try Again
                  </button>

                </div>
              )}

            {searched &&
              !loading &&
              !error &&
              results.length >
                0 && (
                <div>

                  {/* Results header */}

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">

                    <div>

                      <p className="text-sm font-semibold text-blue-600">
                        Prediction Results
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        Colleges you may consider
                      </h2>

                    </div>

                    <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      {results.length}{" "}
                      {results.length ===
                      1
                        ? "match"
                        : "matches"}
                    </span>

                  </div>

                  {/* Result cards */}

                  <div className="space-y-4">

                    {results.map(
                      (
                        college,
                        index
                      ) => {

                        const collegeId =
                          college.college_id ??
                          college.id;

                        const collegeName =
                          college.college_name ||
                          college.name ||
                          "College";

                        const courseName =
                          college.course_name ||
                          college.course ||
                          "Course information unavailable";

                        const branchName =
                          college.branch_name ||
                          college.branch ||
                          "";

                        const openingRank =
                          college.opening_rank;

                        const closingRank =
                          college.closing_rank;

                        const rank =
                          Number(
                            form.rank
                          );

                        let chance =
                          "Possible";

                        let chanceClass =
                          "bg-amber-50 text-amber-700";

                        if (
                          closingRank &&
                          rank <=
                            Number(
                              closingRank
                            ) * 0.7
                        ) {
                          chance =
                            "Good Chance";

                          chanceClass =
                            "bg-green-50 text-green-700";
                        } else if (
                          closingRank &&
                          rank <=
                            Number(
                              closingRank
                            )
                        ) {
                          chance =
                            "Possible";

                          chanceClass =
                            "bg-amber-50 text-amber-700";
                        } else {
                          chance =
                            "Reach";

                          chanceClass =
                            "bg-red-50 text-red-700";
                        }

                        return (
                          <article
                            key={
                              college.id ||
                              `${collegeId}-${index}`
                            }
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 transition"
                          >

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">

                              <div className="flex items-start gap-4">

                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                  {String(
                                    index +
                                      1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </div>

                                <div>

                                  <h3 className="text-lg font-bold text-slate-900">
                                    {
                                      collegeName
                                    }
                                  </h3>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {[
                                      college.city,
                                      college.state,
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ", "
                                      )}
                                  </p>

                                </div>

                              </div>

                              <span
                                className={`self-start px-3 py-1.5 rounded-full text-xs font-bold ${chanceClass}`}
                              >
                                {chance}
                              </span>

                            </div>

                            <div className="mt-6 grid sm:grid-cols-2 gap-4">

                              <div className="rounded-xl bg-slate-50 p-4">

                                <p className="text-xs text-slate-400">
                                  Course
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {
                                    courseName
                                  }
                                </p>

                              </div>

                              <div className="rounded-xl bg-slate-50 p-4">

                                <p className="text-xs text-slate-400">
                                  Branch
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {branchName ||
                                    "Not specified"}
                                </p>

                              </div>

                            </div>

                            {(openingRank ||
                              closingRank) && (
                              <div className="mt-4 flex flex-wrap gap-3">

                                {openingRank && (
                                  <div className="px-3 py-2 rounded-lg border border-slate-200 text-xs">
                                    <span className="text-slate-400">
                                      Opening:
                                    </span>{" "}
                                    <span className="font-semibold text-slate-700">
                                      {
                                        openingRank
                                      }
                                    </span>
                                  </div>
                                )}

                                {closingRank && (
                                  <div className="px-3 py-2 rounded-lg border border-slate-200 text-xs">
                                    <span className="text-slate-400">
                                      Closing:
                                    </span>{" "}
                                    <span className="font-semibold text-slate-700">
                                      {
                                        closingRank
                                      }
                                    </span>
                                  </div>
                                )}

                              </div>
                            )}

                            {collegeId && (
                              <div className="mt-5 pt-5 border-t border-slate-100">

                                <Link
                                  to={`/colleges/${collegeId}`}
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  View College Details

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

                              </div>
                            )}

                          </article>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

          </section>

        </div>

      </main>

      {/* =================================================
          BOTTOM INFORMATION
      ================================================= */}

      <section className="border-t border-slate-200 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid md:grid-cols-3 gap-6">

            <InfoCard
              number="01"
              title="Based on cutoffs"
              text="Predictions use available historical cutoff information for the selected exam."
            />

            <InfoCard
              number="02"
              title="Compare your options"
              text="Look beyond a single college and explore multiple possible choices."
            />

            <InfoCard
              number="03"
              title="Need help?"
              text="Connect with a verified counsellor if you want personalised admission guidance."
              link="/counsellors"
            />

          </div>

        </div>

      </section>

    </div>
  );
}

// =====================================================
// INFORMATION CARD
// =====================================================

function InfoCard({
  number,
  title,
  text,
  link,
}) {
  const content = (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 h-full">

      <span className="text-xs font-bold text-blue-600">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      {link && (
        <span className="inline-flex mt-4 text-sm font-semibold text-blue-600">
          Find a Counsellor →
        </span>
      )}

    </div>
  );

  if (link) {
    return (
      <Link
        to={link}
        className="block hover:shadow-lg hover:shadow-slate-900/5 transition rounded-2xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}