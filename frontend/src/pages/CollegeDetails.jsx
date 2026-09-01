import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CollegeDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const college = location.state?.college;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      if (!college?.id) {
        setError("College information not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/college-details/${college.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load college details"
          );
        }

        setDetails(data.data);
      } catch (err) {
        console.error("College details error:", err);
        setError(
          err.message || "Unable to connect to server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [college]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">
          Loading college details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Unable to Load College
          </h1>

          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <button
            onClick={() => navigate("/colleges")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  const collegeInfo = details?.college;
  const courses = details?.courses || [];
  const cutoffs = details?.cutoffs || [];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">

          <button
            onClick={() => navigate("/colleges")}
            className="mb-6 text-gray-300 hover:text-white"
          >
            ← Back to Colleges
          </button>

          <h1 className="text-4xl font-bold">
            {collegeInfo?.name}
          </h1>

          <p className="text-gray-300 mt-3 text-lg">
            📍 {collegeInfo?.city}, {collegeInfo?.state}
          </p>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* College Information */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            College Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-gray-500">College Name</p>
              <p className="font-semibold text-lg">
                {collegeInfo?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Short Name</p>
              <p className="font-semibold text-lg">
                {collegeInfo?.short_name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">City</p>
              <p className="font-semibold text-lg">
                {collegeInfo?.city || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">State</p>
              <p className="font-semibold text-lg">
                {collegeInfo?.state || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">College Type</p>
              <p className="font-semibold text-lg">
                {collegeInfo?.college_type || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Website</p>

              {collegeInfo?.website ? (
                <a
                  href={collegeInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Visit Official Website →
                </a>
              ) : (
                <p className="font-semibold">
                  N/A
                </p>
              )}
            </div>

          </div>

          {collegeInfo?.description && (
            <div className="mt-8">
              <p className="text-gray-500 mb-2">
                Description
              </p>

              <p className="text-gray-700 leading-relaxed">
                {collegeInfo.description}
              </p>
            </div>
          )}

        </section>

        {/* Courses and Branches */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Courses & Branches
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-500">
              No course information available.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-4 border">
                      Course
                    </th>

                    <th className="text-left p-4 border">
                      Branch
                    </th>

                    <th className="text-left p-4 border">
                      Branch Code
                    </th>

                    <th className="text-left p-4 border">
                      Total Seats
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.college_course_id}
                      className="hover:bg-gray-50"
                    >

                      <td className="p-4 border font-semibold">
                        {course.course_name || "N/A"}
                      </td>

                      <td className="p-4 border">
                        {course.branch_name || "N/A"}
                      </td>

                      <td className="p-4 border">
                        {course.branch_code || "N/A"}
                      </td>

                      <td className="p-4 border">
                        {course.total_seats ?? "N/A"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Cutoffs */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Previous Cutoffs
          </h2>

          {cutoffs.length === 0 ? (
            <p className="text-gray-500">
              No cutoff information available.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="bg-gray-100">

                    <th className="text-left p-4 border">
                      Year
                    </th>

                    <th className="text-left p-4 border">
                      Category
                    </th>

                    <th className="text-left p-4 border">
                      Quota
                    </th>

                    <th className="text-left p-4 border">
                      Opening Rank
                    </th>

                    <th className="text-left p-4 border">
                      Closing Rank
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {cutoffs.map((cutoff) => (
                    <tr
                      key={cutoff.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="p-4 border font-semibold">
                        {cutoff.year}
                      </td>

                      <td className="p-4 border">
                        {cutoff.category || "N/A"}
                      </td>

                      <td className="p-4 border">
                        {cutoff.quota || "N/A"}
                      </td>

                      <td className="p-4 border">
                        {cutoff.opening_rank ?? "N/A"}
                      </td>

                      <td className="p-4 border font-semibold">
                        {cutoff.closing_rank ?? "N/A"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Bottom Button */}
        <div className="text-center">

          <button
            onClick={() => navigate("/colleges")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            ← Explore More Colleges
          </button>

        </div>

      </main>
    </div>
  );
}

export default CollegeDetails;