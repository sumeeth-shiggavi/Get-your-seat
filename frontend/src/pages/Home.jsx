import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExams } from "../services/api";

function Home() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExams = async () => {
      try {
        const result = await getExams();

        if (result.success) {
          setExams(result.data || []);
        } else {
          setError("Unable to load exams");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  const handleExplore = (exam) => {
    const examPath = exam.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    navigate(`/predictor/${examPath}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="max-w-3xl">

            <p className="text-blue-200 font-semibold tracking-widest text-sm">
              GET YOUR SEAT
            </p>

            <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
              Find Your Dream College
            </h1>

            <p className="text-blue-100 text-lg md:text-xl mt-6 leading-8">
              Discover the right college based on your entrance
              exam, rank, category and preferences.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={() => navigate("/colleges")}
                className="bg-white text-blue-700 px-7 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
              >
                Explore Colleges
              </button>

              <button
                onClick={() => {
                  if (exams.length > 0) {
                    handleExplore(exams[0]);
                  }
                }}
                className="border border-white text-white px-7 py-3 rounded-xl font-bold hover:bg-white hover:text-blue-700 transition"
              >
                College Predictor
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* Exams */}
      <main className="max-w-7xl mx-auto px-6 py-16">

        <div className="text-center mb-12">

          <p className="text-blue-600 font-semibold">
            ENTRANCE EXAMS
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Choose Your Exam
          </h2>

          <p className="text-gray-600 mt-4">
            Select an entrance exam to predict the colleges
            you may be eligible for.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-gray-600">
              Loading entrance exams...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-700 rounded-xl p-5 text-center">
            {error}
          </div>
        )}

        {/* Exam Cards */}
        {!loading && !error && exams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition"
              >

                <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-5">
                  {exam.name.substring(0, 2).toUpperCase()}
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  {exam.name}
                </h3>

                <p className="text-gray-500 mt-3 min-h-[48px]">
                  {exam.full_name ||
                    exam.description ||
                    "Entrance examination"}
                </p>

                <button
                  type="button"
                  onClick={() => handleExplore(exam)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mt-6 hover:bg-blue-700 transition"
                >
                  Predict Colleges →
                </button>

              </div>
            ))}

          </div>
        )}

        {/* No Exams */}
        {!loading && !error && exams.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>

            <h3 className="text-xl font-bold">
              No exams available
            </h3>

            <p className="text-gray-500 mt-2">
              Please check your backend database.
            </p>
          </div>
        )}

        {/* Quick Links */}
        <section className="mt-20">

          <div className="grid md:grid-cols-3 gap-6">

            <button
              onClick={() => navigate("/colleges")}
              className="bg-white border border-gray-200 rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">🏫</div>

              <h3 className="text-xl font-bold">
                Explore Colleges
              </h3>

              <p className="text-gray-500 mt-2">
                Search colleges by state, city and college type.
              </p>

              <p className="text-blue-600 font-semibold mt-4">
                View Colleges →
              </p>
            </button>

            <button
              onClick={() => navigate("/counsellors")}
              className="bg-white border border-gray-200 rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">👨‍🏫</div>

              <h3 className="text-xl font-bold">
                Find Counsellors
              </h3>

              <p className="text-gray-500 mt-2">
                Get guidance from admission counsellors.
              </p>

              <p className="text-blue-600 font-semibold mt-4">
                Find Counsellors →
              </p>
            </button>

            <button
              onClick={() => navigate("/about")}
              className="bg-white border border-gray-200 rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">ℹ️</div>

              <h3 className="text-xl font-bold">
                About Get Your Seat
              </h3>

              <p className="text-gray-500 mt-2">
                Learn how our college prediction system works.
              </p>

              <p className="text-blue-600 font-semibold mt-4">
                Learn More →
              </p>
            </button>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          © 2026 Get Your Seat. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default Home;