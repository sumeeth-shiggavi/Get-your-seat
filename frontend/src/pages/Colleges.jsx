import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

export default function Colleges() {
  const [colleges, setColleges] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [stateFilter, setStateFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  // =====================================================
  // FETCH COLLEGES
  // =====================================================

  useEffect(() => {
    const fetchColleges =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/colleges`
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Failed to fetch colleges."
            );
          }

          const data =
            Array.isArray(result)
              ? result
              : result.data || [];

          setColleges(data);
        } catch (err) {
          console.error(
            "Fetch colleges error:",
            err
          );

          setError(
            err.message ||
              "Unable to load colleges."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchColleges();
  }, []);

  // =====================================================
  // UNIQUE FILTER OPTIONS
  // =====================================================

  const states = useMemo(() => {
    return [
      ...new Set(
        colleges
          .map(
            (college) =>
              college.state
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [colleges]);

  const collegeTypes = useMemo(() => {
    return [
      ...new Set(
        colleges
          .map(
            (college) =>
              college.college_type
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [colleges]);

  // =====================================================
  // FILTER COLLEGES
  // =====================================================

  const filteredColleges =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return colleges.filter(
        (college) => {
          const matchesSearch =
            !query ||
            [
              college.name,
              college.short_name,
              college.city,
              college.state,
              college.college_type,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(query)
              );

          const matchesState =
            !stateFilter ||
            college.state ===
              stateFilter;

          const matchesType =
            !typeFilter ||
            college.college_type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesState &&
            matchesType
          );
        }
      );
    }, [
      colleges,
      search,
      stateFilter,
      typeFilter,
    ]);

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setStateFilter("");
    setTypeFilter("");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              College Directory
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Explore colleges that
              could be right for you.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-7">
              Search colleges by name, location and
              institution type. Open a college to explore
              its courses, branches and admission information.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <section className="border-b border-slate-200 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="grid lg:grid-cols-[1fr_220px_220px_auto] gap-3">

            {/* Search */}

            <div className="relative">

              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />
                <path d="m21 21-4.3-4.3" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search college, city or state..."
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            {/* State */}

            <select
              value={stateFilter}
              onChange={(event) =>
                setStateFilter(
                  event.target.value
                )
              }
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">
                All States
              </option>

              {states.map(
                (state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                )
              )}
            </select>

            {/* Type */}

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">
                All Types
              </option>

              {collegeTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>

            {/* Reset */}

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="h-11 px-5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Reset
            </button>

          </div>

          <div className="mt-4 flex items-center justify-between">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredColleges.length}
              </span>{" "}
              college
              {filteredColleges.length !==
                1
                ? "s"
                : ""}
            </p>

            {(search ||
              stateFilter ||
              typeFilter) && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          COLLEGE LIST
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Loading */}

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100" />

                  <div className="mt-5 h-5 w-3/4 rounded bg-slate-100" />

                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />

                  <div className="mt-6 h-4 w-full rounded bg-slate-100" />

                  <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
                </div>
              )
            )}

          </div>
        )}

        {/* Error */}

        {!loading &&
          error && (
            <div className="max-w-xl mx-auto text-center bg-white border border-red-100 rounded-2xl p-8">

              <div className="mx-auto w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">

                <svg
                  width="22"
                  height="22"
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
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>

              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Unable to load colleges
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Try Again
              </button>

            </div>
          )}

        {/* Empty */}

        {!loading &&
          !error &&
          filteredColleges.length ===
            0 && (
            <div className="max-w-xl mx-auto text-center py-16">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">

                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>

              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No colleges found
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Try changing your search or removing
                one of the filters.
              </p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* Colleges */}

        {!loading &&
          !error &&
          filteredColleges.length >
            0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredColleges.map(
                (college) => (
                  <article
                    key={
                      college.id
                    }
                    className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 transition"
                  >

                    {/* Top */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
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

                      {college.college_type && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold whitespace-nowrap">
                          {
                            college.college_type
                          }
                        </span>
                      )}

                    </div>

                    {/* Name */}

                    <h2 className="mt-5 text-lg font-bold leading-6 text-slate-900 group-hover:text-blue-600 transition">
                      {college.name ||
                        "College"}
                    </h2>

                    {college.short_name && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {
                          college.short_name
                        }
                      </p>
                    )}

                    {/* Location */}

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0"
                      >
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle
                          cx="12"
                          cy="10"
                          r="2.5"
                        />
                      </svg>

                      <span>
                        {[
                          college.city,
                          college.state,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ", "
                          ) ||
                          "Location unavailable"}
                      </span>

                    </div>

                    {/* Description */}

                    {college.description && (
                      <p className="mt-4 text-sm leading-6 text-slate-500 line-clamp-3">
                        {
                          college.description
                        }
                      </p>
                    )}

                    {/* Bottom */}

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">

                      <Link
                        to={`/colleges/${college.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Details

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

                      {college.website && (
                        <a
                          href={
                            college.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-slate-400 hover:text-slate-600"
                        >
                          Website
                        </a>
                      )}

                    </div>

                  </article>
                )
              )}

            </div>
          )}

      </main>

      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      <section className="border-t border-slate-200 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="rounded-2xl bg-slate-900 px-6 py-8 sm:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div>

              <p className="text-sm font-semibold text-blue-400">
                Not sure where to start?
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Let your rank guide your options.
              </h2>

              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Use the college predictor to discover
                colleges and courses based on your
                admission rank.
              </p>

            </div>

            <Link
              to="/predictor"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
            >
              Open Predictor

              <svg
                width="17"
                height="17"
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

        </div>

      </section>

    </div>
  );
}