import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Colleges() {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/colleges"
        );

        if (!response.ok) {
          throw new Error("Server returned an error");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch colleges"
          );
        }

        const collegeData = data.data || [];

        setColleges(collegeData);
        setFilteredColleges(collegeData);
      } catch (err) {
        console.error("College fetch error:", err);

        setError(
          err.message || "Unable to connect to backend"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...colleges];

    // Search
    if (search.trim()) {
      const searchText = search.toLowerCase();

      filtered = filtered.filter((college) => {
        return [
          college.name,
          college.short_name,
          college.city,
          college.state,
          college.college_type,
          college.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchText)
          );
      });
    }

    // State filter
    if (stateFilter) {
      filtered = filtered.filter(
        (college) =>
          college.state === stateFilter
      );
    }

    // College type filter
    if (typeFilter) {
      filtered = filtered.filter(
        (college) =>
          college.college_type === typeFilter
      );
    }

    setFilteredColleges(filtered);
  }, [
    search,
    stateFilter,
    typeFilter,
    colleges,
  ]);

  // Unique states
  const states = [
    ...new Set(
      colleges
        .map((college) => college.state)
        .filter(Boolean)
    ),
  ].sort();

  // Unique college types
  const collegeTypes = [
    ...new Set(
      colleges
        .map((college) => college.college_type)
        .filter(Boolean)
    ),
  ].sort();

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setStateFilter("");
    setTypeFilter("");
  };

  // Open college details
  const openCollege = (college) => {
    navigate("/college-details", {
      state: {
        college,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">

          <p className="text-gray-400 text-sm font-semibold tracking-widest">
            GET YOUR SEAT
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Explore Colleges
          </h1>

          <p className="text-gray-300 mt-4 max-w-2xl text-lg">
            Discover colleges based on location,
            college type and your preferences.
          </p>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">

          <div className="grid md:grid-cols-3 gap-5">

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search College
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search college or city..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State
              </label>

              <select
                value={stateFilter}
                onChange={(e) =>
                  setStateFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">
                  All States
                </option>

                {states.map((state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* College Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                College Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">
                  All Types
                </option>

                {collegeTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Results count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">

            <p className="text-gray-500">
              Showing{" "}
              <strong className="text-gray-900">
                {filteredColleges.length}
              </strong>{" "}
              college
              {filteredColleges.length !== 1
                ? "s"
                : ""}
            </p>

            {(search ||
              stateFilter ||
              typeFilter) && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 border-2 border-black rounded-xl font-semibold hover:bg-black hover:text-white transition"
              >
                Clear Filters
              </button>
            )}

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">

            <div className="text-5xl mb-5">
              🎓
            </div>

            <p className="text-gray-600 text-lg">
              Loading colleges...
            </p>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">

            <h2 className="font-bold text-lg">
              ⚠️ Unable to load colleges
            </h2>

            <p className="mt-2">
              {error}
            </p>

            <p className="text-sm mt-3">
              Make sure your backend is running
              on port 5000.
            </p>

          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          filteredColleges.length === 0 && (
            <div className="text-center py-20">

              <div className="text-5xl mb-5">
                🔍
              </div>

              <h2 className="text-2xl font-bold">
                No colleges found
              </h2>

              <p className="text-gray-500 mt-2">
                Try changing your search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* College Cards */}
        {!loading &&
          !error &&
          filteredColleges.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mt-8">

              {filteredColleges.map((college) => (
                <div
                  key={college.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl transition overflow-hidden"
                >

                  <div className="p-6">

                    {/* College name */}
                    <div className="flex gap-4">

                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                        🏫
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-xl font-bold text-gray-900">
                          {college.name}
                        </h2>

                        {college.short_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            {college.short_name}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* Location */}
                    <div className="mt-6">

                      <p className="text-sm text-gray-500">
                        📍 Location
                      </p>

                      <p className="font-semibold text-gray-900 mt-1">
                        {college.city},{" "}
                        {college.state}
                      </p>

                    </div>

                    {/* College Type */}
                    <div className="mt-5">

                      <p className="text-sm text-gray-500">
                        🏛️ College Type
                      </p>

                      <span className="inline-block mt-2 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                        {college.college_type ||
                          "Not specified"}
                      </span>

                    </div>

                    {/* Description */}
                    {college.description && (
                      <p className="text-gray-600 text-sm mt-5">
                        {college.description}
                      </p>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 border-t border-gray-200 p-5 flex flex-col sm:flex-row gap-3">

                    <button
                      onClick={() =>
                        openCollege(college)
                      }
                      className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                    >
                      View College →
                    </button>

                    {college.website && (
                      <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center border-2 border-gray-300 py-3 rounded-xl font-semibold hover:border-black hover:bg-white transition"
                      >
                        🌐 Website
                      </a>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

      </main>
    </div>
  );
}

export default Colleges;