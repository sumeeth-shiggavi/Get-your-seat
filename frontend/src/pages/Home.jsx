import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getExams } from "../services/api";

const API_BASE_URL = "http://localhost:5000/api";

function Home() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // NOTICE BOARD STATE
  // =====================================================

  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] =
    useState(true);
  const [noticeError, setNoticeError] =
    useState("");

  const [activeNoticeTab, setActiveNoticeTab] =
    useState("KCET");

  // =====================================================
  // LOAD EXAMS
  // =====================================================

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
        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  // =====================================================
  // LOAD NOTICES
  // =====================================================

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setNoticeLoading(true);
        setNoticeError("");

        const response = await fetch(
          `${API_BASE_URL}/notices`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load notices."
          );
        }

        setNotices(result.data || []);
      } catch (err) {
        console.error(
          "Notice loading error:",
          err
        );

        setNoticeError(
          "Unable to load admission updates."
        );
      } finally {
        setNoticeLoading(false);
      }
    };

    loadNotices();
  }, []);

  // =====================================================
  // EXPLORE EXAM
  // =====================================================

  const handleExplore = (exam) => {
    const examPath = exam.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    navigate(
      `/predictor/${examPath}`
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      `${date.substring(0, 10)}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FILTER NOTICES
  // =====================================================

  const filteredNotices =
    notices.filter(
      (notice) =>
        notice.exam === activeNoticeTab
    );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =================================================
          HERO
      ================================================= */}

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
              Discover the right college based
              on your entrance exam, rank,
              category and preferences.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={() =>
                  navigate("/colleges")
                }
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

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* =================================================
            EXAMS
        ================================================= */}

        <div className="text-center mb-12">

          <p className="text-blue-600 font-semibold">
            ENTRANCE EXAMS
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Choose Your Exam
          </h2>

          <p className="text-gray-600 mt-4">
            Select an entrance exam to predict
            the colleges you may be eligible for.
          </p>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="text-center py-16">

            <div className="text-5xl mb-4">
              🎓
            </div>

            <p className="text-gray-600">
              Loading entrance exams...
            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-700 rounded-xl p-5 text-center">
            {error}
          </div>
        )}

        {/* =================================================
            EXAM CARDS
        ================================================= */}

        {!loading &&
          !error &&
          exams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition"
                >

                  <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-5">
                    {exam.name
                      .substring(0, 2)
                      .toUpperCase()}
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
                    onClick={() =>
                      handleExplore(exam)
                    }
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mt-6 hover:bg-blue-700 transition"
                  >
                    Predict Colleges →
                  </button>

                </div>
              ))}

            </div>
          )}

        {/* =================================================
            NO EXAMS
        ================================================= */}

        {!loading &&
          !error &&
          exams.length === 0 && (
            <div className="text-center py-16">

              <div className="text-5xl mb-4">
                📚
              </div>

              <h3 className="text-xl font-bold">
                No exams available
              </h3>

              <p className="text-gray-500 mt-2">
                Please check your backend
                database.
              </p>

            </div>
          )}

        {/* =================================================
            OFFICIAL ADMISSION UPDATES
        ================================================= */}

        <section className="mt-20">

          {/* SECTION HEADER */}

          <div className="text-center mb-10">

            <p className="text-blue-600 font-semibold tracking-wide">
              OFFICIAL UPDATES
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Admission Notices
            </h2>

            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Stay updated with the latest KCET
              and NEET admission notifications.
            </p>

          </div>

          {/* NOTICE BOARD */}

          <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">

            {/* TABS */}

            <div className="border-b border-gray-200 bg-gray-50">

              <div className="flex">

                <button
                  type="button"
                  onClick={() =>
                    setActiveNoticeTab("KCET")
                  }
                  className={`flex-1 px-6 py-4 text-sm md:text-base font-bold transition ${
                    activeNoticeTab === "KCET"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  KCET Notices
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveNoticeTab("NEET")
                  }
                  className={`flex-1 px-6 py-4 text-sm md:text-base font-bold transition ${
                    activeNoticeTab === "NEET"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  NEET Notices
                </button>

              </div>

            </div>

            {/* NOTICE CONTENT */}

            <div className="p-5 md:p-7">

              {/* LOADING */}

              {noticeLoading && (
                <div className="py-12 text-center">

                  <div className="text-4xl mb-3">
                    📢
                  </div>

                  <p className="text-gray-500">
                    Loading admission updates...
                  </p>

                </div>
              )}

              {/* ERROR */}

              {!noticeLoading &&
                noticeError && (
                  <div className="py-10 text-center">

                    <div className="text-4xl mb-3">
                      ⚠️
                    </div>

                    <p className="text-red-600 font-medium">
                      {noticeError}
                    </p>

                    <p className="text-gray-500 text-sm mt-2">
                      Please try again later.
                    </p>

                  </div>
                )}

              {/* NO NOTICES */}

              {!noticeLoading &&
                !noticeError &&
                filteredNotices.length ===
                  0 && (
                  <div className="py-12 text-center">

                    <div className="text-4xl mb-3">
                      📋
                    </div>

                    <h3 className="text-lg font-bold text-gray-800">
                      No {activeNoticeTab} notices
                    </h3>

                    <p className="text-gray-500 text-sm mt-2">
                      New admission notifications
                      will appear here.
                    </p>

                  </div>
                )}

              {/* NOTICE LIST */}

              {!noticeLoading &&
                !noticeError &&
                filteredNotices.length >
                  0 && (
                  <div className="space-y-4">

                    {filteredNotices.map(
                      (notice) => (
                        <article
                          key={notice.id}
                          className={`rounded-2xl border p-5 md:p-6 transition hover:shadow-md ${
                            notice.is_important
                              ? "border-amber-200 bg-amber-50/40"
                              : "border-gray-200 bg-white"
                          }`}
                        >

                          {/* TOP ROW */}

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                            <div className="flex-1">

                              <div className="flex flex-wrap items-center gap-2 mb-3">

                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                  {notice.exam}
                                </span>

                                {notice.is_important && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                    ⭐ Important
                                  </span>
                                )}

                              </div>

                              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                {notice.title}
                              </h3>

                              <p className="text-gray-600 mt-3 leading-7 whitespace-pre-line">
                                {notice.summary}
                              </p>

                            </div>

                          </div>

                          {/* BOTTOM INFORMATION */}

                          <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                              <span>
                                <strong className="text-gray-700">
                                  Published:
                                </strong>{" "}
                                {formatDate(
                                  notice.published_date
                                )}
                              </span>

                              {notice.expiry_date && (
                                <span>
                                  <strong className="text-gray-700">
                                    Valid until:
                                  </strong>{" "}
                                  {formatDate(
                                    notice.expiry_date
                                  )}
                                </span>
                              )}

                            </div>

                            {notice.official_link && (
                              <a
                                href={
                                  notice.official_link
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                              >
                                Official Notification →
                              </a>
                            )}

                          </div>

                        </article>
                      )
                    )}

                  </div>
                )}

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK LINKS
        ================================================= */}

        <section className="mt-20">

          <div className="grid md:grid-cols-3 gap-6">

            {/* COLLEGES */}

            <button
              onClick={() =>
                navigate("/colleges")
              }
              className="bg-white border border-gray-200 rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition"
            >

              <div className="text-4xl mb-4">
                🏫
              </div>

              <h3 className="text-xl font-bold">
                Explore Colleges
              </h3>

              <p className="text-gray-500 mt-2">
                Search colleges by state,
                city and college type.
              </p>

              <p className="text-blue-600 font-semibold mt-4">
                View Colleges →
              </p>

            </button>

            {/* COUNSELLORS */}

            <button
              onClick={() =>
                navigate("/counsellors")
              }
              className="bg-white border border-gray-200 rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition"
            >

              <div className="text-4xl mb-4">
                👨‍🏫
              </div>

              <h3 className="text-xl font-bold">
                Find Counsellors
              </h3>

              <p className="text-gray-500 mt-2">
                Get guidance from admission
                counsellors.
              </p>

              <p className="text-blue-600 font-semibold mt-4">
                Find Counsellors →
              </p>

            </button>

            {/* ABOUT */}

            <button
              onClick={() =>
                navigate("/about")
              }
              className="bg-white border border-gray-200 rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition"
            >

              <div className="text-4xl mb-4">
                ℹ️
              </div>

              <h3 className="text-xl font-bold">
                About Get Your Seat
              </h3>

              <p className="text-gray-500 mt-2">
                Learn how our college prediction
                system works.
              </p>

              <p className="text-blue-600 font-semibold mt-4">
                Learn More →
              </p>

            </button>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-gray-900 text-gray-400">

        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          © 2026 Get Your Seat. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default Home;