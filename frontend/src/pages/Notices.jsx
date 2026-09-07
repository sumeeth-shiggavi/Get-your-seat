import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Not specified";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const isExpired = (
  expiryDate
) => {
  if (!expiryDate) {
    return false;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const expiry =
    new Date(expiryDate);

  expiry.setHours(
    0,
    0,
    0,
    0
  );

  return expiry < today;
};

const Notices = () => {
  const [
    notices,
    setNotices,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filterExam,
    setFilterExam,
  ] = useState("ALL");

  const [
    search,
    setSearch,
  ] = useState("");

  // =================================================
  // FETCH PUBLIC NOTICES
  // =================================================

  useEffect(() => {
    const fetchNotices =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/notices`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Failed to fetch notices."
            );
          }

          setNotices(
            Array.isArray(
              result.data
            )
              ? result.data
              : []
          );
        } catch (err) {
          console.error(
            "Fetch notices error:",
            err
          );

          setError(
            err.message ||
              "Unable to load notices."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchNotices();
  }, []);

  // =================================================
  // FILTER NOTICES
  // =================================================

  const filteredNotices =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return notices.filter(
        (notice) => {
          const matchesExam =
            filterExam ===
              "ALL" ||
            notice.exam ===
              filterExam;

          const matchesSearch =
            !searchValue ||
            String(
              notice.title ||
                ""
            )
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            String(
              notice.summary ||
                ""
            )
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            String(
              notice.exam ||
                ""
            )
              .toLowerCase()
              .includes(
                searchValue
              );

          return (
            matchesExam &&
            matchesSearch
          );
        }
      );
    }, [
      notices,
      filterExam,
      search,
    ]);

  const importantNotices =
    filteredNotices.filter(
      (notice) =>
        notice.is_important
    );

  const regularNotices =
    filteredNotices.filter(
      (notice) =>
        !notice.is_important
    );

  // =================================================
  // NOTICE CARD
  // =================================================

  const renderNoticeCard =
    (notice) => {
      const expired =
        isExpired(
          notice.expiry_date
        );

      return (
        <article
          key={notice.id}
          className="card"
          style={{
            padding:
              "1.35rem",
            height:
              "100%",
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "1rem",
          }}
        >
          {/* Header */}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
              gap:
                "1rem",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap:
                  "0.5rem",
              }}
            >
              <span
                className="badge"
                style={{
                  background:
                    notice.exam ===
                    "KCET"
                      ? "#eff6ff"
                      : "#f0fdf4",
                  color:
                    notice.exam ===
                    "KCET"
                      ? "#1d4ed8"
                      : "#15803d",
                }}
              >
                {notice.exam}
              </span>

              {notice.is_important && (
                <span
                  className="badge"
                  style={{
                    background:
                      "#fff7ed",
                    color:
                      "#c2410c",
                  }}
                >
                  Important
                </span>
              )}
            </div>

            {expired && (
              <span
                className="badge"
                style={{
                  background:
                    "#fef2f2",
                  color:
                    "#dc2626",
                }}
              >
                Expired
              </span>
            )}
          </div>

          {/* Content */}

          <div>
            <h3
              style={{
                margin:
                  "0 0 0.6rem",
                color:
                  "#0f172a",
                fontSize:
                  "1.12rem",
                lineHeight:
                  1.4,
              }}
            >
              {notice.title}
            </h3>

            <p
              style={{
                margin:
                  0,
                color:
                  "#64748b",
                lineHeight:
                  1.7,
                fontSize:
                  "0.93rem",
                whiteSpace:
                  "pre-line",
              }}
            >
              {notice.summary}
            </p>
          </div>

          {/* Dates */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap:
                "0.75rem",
              padding:
                "0.85rem",
              background:
                "#f8fafc",
              borderRadius:
                "10px",
            }}
          >
            <div>
              <div
                style={{
                  color:
                    "#94a3b8",
                  fontSize:
                    "0.73rem",
                  marginBottom:
                    "0.2rem",
                }}
              >
                Published
              </div>

              <div
                style={{
                  color:
                    "#334155",
                  fontWeight:
                    600,
                  fontSize:
                    "0.84rem",
                }}
              >
                {formatDate(
                  notice.published_date
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  color:
                    "#94a3b8",
                  fontSize:
                    "0.73rem",
                  marginBottom:
                    "0.2rem",
                }}
              >
                Valid Until
              </div>

              <div
                style={{
                  color:
                    expired
                      ? "#dc2626"
                      : "#334155",
                  fontWeight:
                    600,
                  fontSize:
                    "0.84rem",
                }}
              >
                {notice.expiry_date
                  ? formatDate(
                      notice.expiry_date
                    )
                  : "No expiry"}
              </div>
            </div>
          </div>

          {/* Official Link */}

          {notice.official_link && (
            <div
              style={{
                marginTop:
                  "auto",
              }}
            >
              <a
                href={
                  notice.official_link
                }
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  width:
                    "100%",
                  textDecoration:
                    "none",
                }}
              >
                Visit Official Website
                <span
                  style={{
                    marginLeft:
                      "0.45rem",
                  }}
                >
                  ↗
                </span>
              </a>
            </div>
          )}
        </article>
      );
    };

  // =================================================
  // MAIN UI
  // =================================================

  return (
    <div
      className="page"
      style={{
        background:
          "#f8fafc",
        minHeight:
          "100vh",
      }}
    >
      <div className="container">
        {/* =========================================
            HERO
        ========================================= */}

        <section
          style={{
            padding:
              "3rem 0 2rem",
          }}
        >
          <div
            style={{
              maxWidth:
                "780px",
            }}
          >
            <div
              className="badge"
              style={{
                background:
                  "#eff6ff",
                color:
                  "#1d4ed8",
                marginBottom:
                  "0.8rem",
              }}
            >
              Official Exam Updates
            </div>

            <h1
              style={{
                margin:
                  "0 0 0.75rem",
                fontSize:
                  "clamp(2rem, 5vw, 3.2rem)",
                lineHeight:
                  1.1,
                color:
                  "#0f172a",
              }}
            >
              KCET & NEET
              <br />
              <span
                style={{
                  color:
                    "#2563eb",
                }}
              >
                Notice Board
              </span>
            </h1>

            <p
              style={{
                margin:
                  0,
                color:
                  "#64748b",
                fontSize:
                  "1.05rem",
                lineHeight:
                  1.7,
                maxWidth:
                  "680px",
              }}
            >
              Stay updated with important counselling
              announcements, registration dates,
              deadlines and examination updates.
            </p>
          </div>
        </section>

        {/* =========================================
            FILTERS
        ========================================= */}

        <section
          className="card"
          style={{
            padding:
              "1rem",
            marginBottom:
              "2rem",
          }}
        >
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "minmax(220px, 1fr) auto",
              gap:
                "0.75rem",
              alignItems:
                "center",
            }}
          >
            <div>
              <input
                type="search"
                className="input"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search notices..."
              />
            </div>

            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap:
                  "0.4rem",
              }}
            >
              {[
                "ALL",
                "KCET",
                "NEET",
              ].map(
                (exam) => (
                  <button
                    key={
                      exam
                    }
                    type="button"
                    className={
                      filterExam ===
                      exam
                        ? "btn btn-primary"
                        : "btn btn-secondary"
                    }
                    onClick={() =>
                      setFilterExam(
                        exam
                      )
                    }
                  >
                    {exam}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div
            style={{
              marginBottom:
                "1.5rem",
              padding:
                "1rem",
              background:
                "#fef2f2",
              border:
                "1px solid #fecaca",
              borderRadius:
                "10px",
              color:
                "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {/* =========================================
            LOADING
        ========================================= */}

        {loading ? (
          <div
            className="card"
            style={{
              padding:
                "4rem 1.5rem",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "2rem",
                marginBottom:
                  "0.75rem",
              }}
            >
              📢
            </div>

            <h3
              style={{
                margin:
                  "0 0 0.4rem",
                color:
                  "#0f172a",
              }}
            >
              Loading notices...
            </h3>

            <p
              style={{
                margin:
                  0,
                color:
                  "#64748b",
              }}
            >
              Please wait while we fetch the latest
              exam updates.
            </p>
          </div>
        ) : filteredNotices.length ===
          0 ? (
          /* =========================================
             EMPTY STATE
          ========================================= */

          <div
            className="card"
            style={{
              padding:
                "4rem 1.5rem",
              textAlign:
                "center",
              marginBottom:
                "3rem",
            }}
          >
            <div
              style={{
                fontSize:
                  "2.5rem",
                marginBottom:
                  "0.75rem",
              }}
            >
              🔎
            </div>

            <h2
              style={{
                margin:
                  "0 0 0.5rem",
                color:
                  "#0f172a",
                fontSize:
                  "1.3rem",
              }}
            >
              No notices found
            </h2>

            <p
              style={{
                margin:
                  "0 0 1.25rem",
                color:
                  "#64748b",
              }}
            >
              Try changing your search or exam filter.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setFilterExam(
                  "ALL"
                );
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* =======================================
                IMPORTANT NOTICES
            ======================================= */}

            {importantNotices.length >
              0 && (
              <section
                style={{
                  marginBottom:
                    "2.5rem",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "0.75rem",
                    marginBottom:
                      "1rem",
                  }}
                >
                  <div
                    style={{
                      width:
                        "40px",
                      height:
                        "40px",
                      borderRadius:
                        "10px",
                      background:
                        "#fff7ed",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize:
                        "1.15rem",
                    }}
                  >
                    ⚠️
                  </div>

                  <div>
                    <h2
                      style={{
                        margin:
                          0,
                        color:
                          "#0f172a",
                        fontSize:
                          "1.4rem",
                      }}
                    >
                      Important Notices
                    </h2>

                    <p
                      style={{
                        margin:
                          "0.2rem 0 0",
                        color:
                          "#64748b",
                        fontSize:
                          "0.85rem",
                      }}
                    >
                      Important updates you should not miss.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(300px, 1fr))",
                    gap:
                      "1rem",
                  }}
                >
                  {importantNotices.map(
                    renderNoticeCard
                  )}
                </div>
              </section>
            )}

            {/* =======================================
                REGULAR NOTICES
            ======================================= */}

            {regularNotices.length >
              0 && (
              <section
                style={{
                  marginBottom:
                    "3rem",
                }}
              >
                <div
                  style={{
                    marginBottom:
                      "1rem",
                  }}
                >
                  <h2
                    style={{
                      margin:
                        0,
                      color:
                        "#0f172a",
                      fontSize:
                        "1.4rem",
                    }}
                  >
                    Latest Notices
                  </h2>

                  <p
                    style={{
                      margin:
                        "0.3rem 0 0",
                      color:
                        "#64748b",
                      fontSize:
                        "0.85rem",
                    }}
                  >
                    Latest published updates from the
                    counselling team.
                  </p>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(300px, 1fr))",
                    gap:
                      "1rem",
                  }}
                >
                  {regularNotices.map(
                    renderNoticeCard
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* =========================================
            COUNSELLING CTA
        ========================================= */}

        {!loading && (
          <section
            className="card"
            style={{
              padding:
                "2rem",
              marginBottom:
                "3rem",
              background:
                "linear-gradient(135deg, #eff6ff, #f8fafc)",
              border:
                "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap:
                  "1.5rem",
                flexWrap:
                  "wrap",
              }}
            >
              <div
                style={{
                  maxWidth:
                    "650px",
                }}
              >
                <h2
                  style={{
                    margin:
                      "0 0 0.5rem",
                    color:
                      "#0f172a",
                    fontSize:
                      "1.4rem",
                  }}
                >
                  Need help with your counselling?
                </h2>

                <p
                  style={{
                    margin:
                      0,
                    color:
                      "#64748b",
                    lineHeight:
                      1.6,
                  }}
                >
                  Explore our verified counsellors and
                  get personalised guidance for your
                  admission journey.
                </p>
              </div>

              <Link
                to="/counsellors"
                className="btn btn-primary"
                style={{
                  textDecoration:
                    "none",
                  whiteSpace:
                    "nowrap",
                }}
              >
                Find a Counsellor
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Notices;