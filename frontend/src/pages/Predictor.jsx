import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Predictor() {
  const { exam } = useParams();
  const navigate = useNavigate();

  const examNames = {
    neet: "NEET",
    kcet: "KCET",
    "jee-main": "JEE Main",
    "jee-advanced": "JEE Advanced",
  };

  const examName = examNames[exam] || exam.toUpperCase();

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getChanceLevel = (studentRank, closingRank) => {
    const rankNumber = Number(studentRank);
    const closingNumber = Number(closingRank);

    if (!closingNumber) {
      return "Moderate";
    }

    if (rankNumber <= closingNumber * 0.6) {
      return "Safe";
    }

    if (rankNumber <= closingNumber) {
      return "Moderate";
    }

    return "Dream";
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!rank || !category || !state) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        "http://localhost:5000/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam: examName,
            rank: Number(rank),
            category,
            state,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Prediction failed"
        );
      }

      const updatedResults = data.data.map((college) => ({
        ...college,
        chance: getChanceLevel(
          rank,
          college.closing_rank
        ),
      }));

      setResults(updatedResults);

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  const getChanceStyle = (chance) => {
    if (chance === "Safe") {
      return "bg-green-100 text-green-700 border-green-300";
    }

    if (chance === "Moderate") {
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }

    return "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">

          <h1 className="text-4xl font-bold text-gray-900">
            {examName} College Predictor
          </h1>

          <p className="text-gray-600 mt-3">
            Enter your rank and preferences to discover
            colleges you may be eligible for.
          </p>

        </div>

        {/* Predictor Form */}
        <form
          onSubmit={handlePredict}
          className="bg-white rounded-2xl shadow-md p-8"
        >

          {/* Rank */}
          <label className="block mb-2 font-semibold">
            Your Rank
          </label>

          <input
            type="number"
            min="1"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="Enter your rank"
            className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Category */}
          <label className="block mb-2 font-semibold">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select Category
            </option>

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

          {/* State */}
          <label className="block mb-2 font-semibold">
            Preferred State
          </label>

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select State
            </option>

            <option value="Karnataka">
              Karnataka
            </option>

            <option value="Maharashtra">
              Maharashtra
            </option>

            <option value="Delhi">
              Delhi
            </option>

            <option value="Tamil Nadu">
              Tamil Nadu
            </option>
          </select>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Finding Colleges..."
              : "Predict My Colleges"}
          </button>

        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-10">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Recommended Colleges
                </h2>

                <p className="text-gray-500 mt-1">
                  Based on your rank and preferences
                </p>
              </div>

              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                {results.length} Colleges
              </span>

            </div>

            <div className="grid gap-6">

              {results.map((college, index) => (

                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                >

                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    <div>

                      <h3 className="text-xl font-bold text-gray-900">
                        {college.college_name}
                      </h3>

                      <p className="text-gray-500 mt-2">
                        📍 {college.city}, {college.state}
                      </p>

                    </div>

                    {/* Chance */}
                    <span
                      className={`inline-block border px-4 py-2 rounded-full font-bold ${getChanceStyle(
                        college.chance
                      )}`}
                    >
                      {college.chance}
                    </span>

                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-sm">
                        Course
                      </p>

                      <p className="font-semibold mt-1">
                        {college.course_name}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-sm">
                        Branch
                      </p>

                      <p className="font-semibold mt-1">
                        {college.branch_name}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-sm">
                        Opening Rank
                      </p>

                      <p className="font-semibold mt-1">
                        {college.opening_rank}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-sm">
                        Closing Rank
                      </p>

                      <p className="font-semibold mt-1">
                        {college.closing_rank}
                      </p>
                    </div>

                  </div>

                  {/* Button */}
                  <div className="mt-6">

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/college-details", {
                          state: {
                            college: {
                              id: college.college_id,
                              name: college.college_name,
                              city: college.city,
                              state: college.state,
                            },
                          },
                        })
                      }
                      className="w-full md:w-auto bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                    >
                      View College Details →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          results.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
              Enter your details and click
              <strong> Predict My Colleges </strong>
              to see your recommendations.
            </div>
          )}

      </div>

    </div>
  );
}

export default Predictor;