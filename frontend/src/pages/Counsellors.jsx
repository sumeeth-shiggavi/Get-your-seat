import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
};

function Counsellors() {
  const [user] = useState(getStoredUser);

  const [counsellors, setCounsellors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // =====================================================
  // FETCH COUNSELLORS
  // =====================================================

  useEffect(() => {
    const fetchCounsellors =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/counsellors`
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Failed to fetch counsellors."
            );
          }

          setCounsellors(
            result.data || []
          );
        } catch (err) {
          setError(
            err.message ||
              "Failed to fetch counsellors."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchCounsellors();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCounsellors =
    counsellors.filter(
      (counsellor) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        if (!searchText) {
          return true;
        }

        return (
          String(
            counsellor.full_name || ""
          )
            .toLowerCase()
            .includes(searchText) ||
          String(
            counsellor.specialization ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||
          String(
            counsellor.qualification ||
              ""
          )
            .toLowerCase()
            .includes(searchText)
        );
      }
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-10 text-white shadow-lg sm:px-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
              <span>🎓</span>
              Expert Admission Guidance
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find Your Counsellor
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Connect with verified admission
              counsellors and get personalised
              guidance for your college and
              course decisions.
            </p>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Available Counsellors
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search by name,
                specialisation or
                qualification.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search counsellors..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <div className="flex items-start gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                  <div className="mt-5 h-5 w-40 rounded bg-slate-200" />

                  <div className="mt-3 h-4 w-28 rounded bg-slate-200" />

                  <div className="mt-6 h-16 rounded-2xl bg-slate-100" />

                  <div className="mt-5 h-11 rounded-xl bg-slate-200" />
                </div>
              )
            )}
          </div>
        ) : filteredCounsellors.length ===
          0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🔎
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              No counsellors found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a different name,
              specialisation or
              qualification.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCounsellors.map(
              (counsellor) => {
                const counsellorId =
                  counsellor.id;

                const initials =
                  String(
                    counsellor.full_name ||
                      "C"
                  )
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(
                      (name) =>
                        name.charAt(0)
                    )
                    .join("")
                    .toUpperCase();

                return (
                  <article
                    key={counsellorId}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* CARD HEADER */}
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-sm">
                          {initials}
                        </div>

                        {counsellor.is_verified && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <h2 className="mt-5 text-xl font-bold text-slate-900">
                        {counsellor.full_name ||
                          "Counsellor"}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-blue-600">
                        {counsellor.specialization ||
                          "Admission Counselling"}
                      </p>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-6">
                      <div className="grid gap-3">
                        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                          <span className="text-lg">
                            🎓
                          </span>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Qualification
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {counsellor.qualification ||
                                "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                          <span className="text-lg">
                            ⭐
                          </span>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Experience
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {counsellor.experience_years ??
                                0}{" "}
                              {Number(
                                counsellor.experience_years
                              ) === 1
                                ? "year"
                                : "years"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                          <span className="text-lg">
                            💰
                          </span>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Consultation Fee
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {counsellor.consultation_fee !==
                              null &&
                              counsellor.consultation_fee !==
                                undefined
                                ? `₹${Number(
                                    counsellor.consultation_fee
                                  ).toLocaleString(
                                    "en-IN"
                                  )}`
                                : "Contact for details"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BIO */}
                      {counsellor.bio && (
                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                          {counsellor.bio}
                        </p>
                      )}

                      {/* BOOK BUTTON */}
                      {user?.role ===
                      "student" ? (
                        <a
                          href={`/counsellors/${counsellorId}/book`}
                          className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          Book Counselling
                          <span className="ml-2">
                            →
                          </span>
                        </a>
                      ) : (
                        <a
                          href="/login"
                          className="mt-6 flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          Login to Book
                        </a>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Counsellors;