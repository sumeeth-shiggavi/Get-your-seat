import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const API_BASE_URL =
  "http://localhost:5000";

const DAYS = 60;

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem(
    "token"
  );
};

const getInitialForm = () => ({
  exam: "KCET",
  title: "",
  summary: "",
  official_link: "",
  published_date:
    new Date()
      .toISOString()
      .split("T")[0],
  expiry_date: "",
  is_important: false,
  is_published: true,
});

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

const CounsellorNotices =
  () => {
    const navigate =
      useNavigate();

    const [
      user,
      setUser,
    ] = useState(null);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      deletingId,
      setDeletingId,
    ] = useState(null);

    const [
      publishingId,
      setPublishingId,
    ] = useState(null);

    const [
      notices,
      setNotices,
    ] = useState([]);

    const [
      form,
      setForm,
    ] = useState(
      getInitialForm()
    );

    const [
      editingId,
      setEditingId,
    ] = useState(null);

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      filterExam,
      setFilterExam,
    ] = useState("ALL");

    const [
      error,
      setError,
    ] = useState("");

    const [
      success,
      setSuccess,
    ] = useState("");

    // =================================================
    // AUTH CHECK
    // =================================================

    useEffect(() => {
      const storedUser =
        getStoredUser();

      const token =
        getStoredToken();

      if (
        !storedUser ||
        !token
      ) {
        navigate(
          "/counsellor-login",
          {
            replace: true,
          }
        );

        return;
      }

      if (
        storedUser.role !==
        "counsellor"
      ) {
        navigate(
          "/",
          {
            replace: true,
          }
        );

        return;
      }

      setUser(storedUser);
    }, [navigate]);

    // =================================================
    // FETCH NOTICES
    // =================================================

    const fetchNotices =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            getStoredToken();

          const response =
            await fetch(
              `${API_BASE_URL}/api/notices/manage`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response
              .json();

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

    useEffect(() => {
      if (user) {
        fetchNotices();
      }
    }, [user]);

    // =================================================
    // FORM HANDLING
    // =================================================

    const handleChange =
      (event) => {
        const {
          name,
          value,
          type,
          checked,
        } = event.target;

        setForm(
          (previous) => ({
            ...previous,
            [name]:
              type ===
              "checkbox"
                ? checked
                : value,
          })
        );

        setError("");
        setSuccess("");
      };

    const resetForm =
      () => {
        setForm(
          getInitialForm()
        );

        setEditingId(null);
        setError("");
        setSuccess("");
      };

    // =================================================
    // VALIDATION
    // =================================================

    const validateForm =
      () => {
        const title =
          form.title.trim();

        const summary =
          form.summary.trim();

        if (!form.exam) {
          return "Please select an exam.";
        }

        if (!title) {
          return "Notice title is required.";
        }

        if (title.length > 255) {
          return "Notice title must not exceed 255 characters.";
        }

        if (!summary) {
          return "Notice summary is required.";
        }

        if (
          form.official_link &&
          !/^https?:\/\//i.test(
            form.official_link.trim()
          )
        ) {
          return "Official link must start with http:// or https://.";
        }

        if (
          form.published_date &&
          form.expiry_date
        ) {
          const published =
            new Date(
              form.published_date
            );

          const expiry =
            new Date(
              form.expiry_date
            );

          if (
            expiry < published
          ) {
            return "Expiry date cannot be before the published date.";
          }
        }

        return null;
      };

    // =================================================
    // CREATE / UPDATE
    // =================================================

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
          validateForm();

        if (validationError) {
          setError(
            validationError
          );

          return;
        }

        try {
          setSaving(true);

          const token =
            getStoredToken();

          const isEditing =
            editingId !== null;

          const url = isEditing
            ? `${API_BASE_URL}/api/notices/${editingId}`
            : `${API_BASE_URL}/api/notices`;

          const method = isEditing
            ? "PUT"
            : "POST";

          const payload = {
            exam: form.exam,
            title:
              form.title.trim(),
            summary:
              form.summary.trim(),
            official_link:
              form.official_link.trim() ||
              null,
            published_date:
              form.published_date ||
              null,
            expiry_date:
              form.expiry_date ||
              null,
            is_important:
              Boolean(
                form.is_important
              ),
            is_published:
              Boolean(
                form.is_published
              ),
          };

          const response =
            await fetch(
              url,
              {
                method,
                headers: {
                  "Content-Type":
                    "application/json",
                  Authorization:
                    `Bearer ${token}`,
                },
                body: JSON.stringify(
                  payload
                ),
              }
            );

          const result =
            await response
              .json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Failed to save notice."
            );
          }

          setSuccess(
            isEditing
              ? "Notice updated successfully."
              : "Notice created successfully."
          );

          resetForm();

          await fetchNotices();
        } catch (err) {
          console.error(
            "Save notice error:",
            err
          );

          setError(
            err.message ||
              "Unable to save notice."
          );
        } finally {
          setSaving(false);
        }
      };

    // =================================================
    // EDIT
    // =================================================

    const handleEdit =
      (notice) => {
        setEditingId(
          notice.id
        );

        setForm({
          exam:
            notice.exam ||
            "KCET",

          title:
            notice.title ||
            "",

          summary:
            notice.summary ||
            "",

          official_link:
            notice.official_link ||
            "",

          published_date:
            notice.published_date
              ? String(
                  notice.published_date
                ).substring(
                  0,
                  10
                )
              : "",

          expiry_date:
            notice.expiry_date
              ? String(
                  notice.expiry_date
                ).substring(
                  0,
                  10
                )
              : "",

          is_important:
            Boolean(
              notice.is_important
            ),

          is_published:
            Boolean(
              notice.is_published
            ),
        });

        setError("");
        setSuccess("");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      };

    // =================================================
    // DELETE
    // =================================================

    const handleDelete =
      async (noticeId) => {
        const confirmed =
          window.confirm(
            "Are you sure you want to delete this notice?"
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingId(
            noticeId
          );

          setError("");
          setSuccess("");

          const token =
            getStoredToken();

          const response =
            await fetch(
              `${API_BASE_URL}/api/notices/${noticeId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response
              .json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Failed to delete notice."
            );
          }

          setSuccess(
            "Notice deleted successfully."
          );

          if (
            editingId ===
            noticeId
          ) {
            resetForm();
          }

          await fetchNotices();
        } catch (err) {
          console.error(
            "Delete notice error:",
            err
          );

          setError(
            err.message ||
              "Unable to delete notice."
          );
        } finally {
          setDeletingId(null);
        }
      };

    // =================================================
    // PUBLISH / UNPUBLISH
    // =================================================

    const handleTogglePublish =
      async (noticeId) => {
        try {
          setPublishingId(
            noticeId
          );

          setError("");
          setSuccess("");

          const token =
            getStoredToken();

          const response =
            await fetch(
              `${API_BASE_URL}/api/notices/${noticeId}/publish`,
              {
                method: "PATCH",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response
              .json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Failed to update notice status."
            );
          }

          setSuccess(
            result.message ||
              "Notice status updated successfully."
          );

          await fetchNotices();
        } catch (err) {
          console.error(
            "Toggle publish error:",
            err
          );

          setError(
            err.message ||
              "Unable to update notice status."
          );
        } finally {
          setPublishingId(
            null
          );
        }
      };

    // =================================================
    // FILTERED NOTICES
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
        search,
        filterExam,
      ]);

    const kcetNotices =
      filteredNotices.filter(
        (notice) =>
          notice.exam ===
          "KCET"
      );

    const neetNotices =
      filteredNotices.filter(
        (notice) =>
          notice.exam ===
          "NEET"
      );

    // =================================================
    // STATS
    // =================================================

    const totalNotices =
      notices.length;

    const publishedCount =
      notices.filter(
        (notice) =>
          notice.is_published
      ).length;

    const importantCount =
      notices.filter(
        (notice) =>
          notice.is_important
      ).length;

    const expiredCount =
      notices.filter(
        (notice) =>
          isExpired(
            notice.expiry_date
          )
      ).length;

    // =================================================
    // RENDER NOTICE CARD
    // =================================================

    const renderNoticeCard =
      (notice) => {
        const expired =
          isExpired(
            notice.expiry_date
          );

        return (
          <div
            key={notice.id}
            className="card"
            style={{
              padding:
                "1.25rem",
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "1rem",
              height:
                "100%",
            }}
          >
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
              <div>
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
                      marginLeft:
                        "0.5rem",
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

              <span
                className="badge"
                style={{
                  background:
                    notice.is_published
                      ? "#f0fdf4"
                      : "#f8fafc",
                  color:
                    notice.is_published
                      ? "#15803d"
                      : "#64748b",
                }}
              >
                {notice.is_published
                  ? "Published"
                  : "Draft"}
              </span>
            </div>

            <div>
              <h3
                style={{
                  margin:
                    "0 0 0.5rem",
                  fontSize:
                    "1.1rem",
                  color:
                    "#0f172a",
                  lineHeight:
                    1.35,
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
                    1.65,
                  fontSize:
                    "0.94rem",
                  whiteSpace:
                    "pre-line",
                }}
              >
                {notice.summary}
              </p>
            </div>

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
                    fontSize:
                      "0.75rem",
                    color:
                      "#94a3b8",
                    marginBottom:
                      "0.2rem",
                  }}
                >
                  Published
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                    color:
                      "#334155",
                    fontSize:
                      "0.86rem",
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
                    fontSize:
                      "0.75rem",
                    color:
                      "#94a3b8",
                    marginBottom:
                      "0.2rem",
                  }}
                >
                  Expiry
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                    color:
                      expired
                        ? "#dc2626"
                        : "#334155",
                    fontSize:
                      "0.86rem",
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

            {expired && (
              <div
                style={{
                  padding:
                    "0.65rem 0.8rem",
                  borderRadius:
                    "8px",
                  background:
                    "#fef2f2",
                  color:
                    "#b91c1c",
                  fontSize:
                    "0.82rem",
                  fontWeight:
                    600,
                }}
              >
                This notice has expired.
              </div>
            )}

            <div
              style={{
                marginTop:
                  "auto",
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap:
                  "0.5rem",
              }}
            >
              {notice.official_link && (
                <a
                  href={
                    notice.official_link
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{
                    flex:
                      "1 1 130px",
                    textAlign:
                      "center",
                    textDecoration:
                      "none",
                  }}
                >
                  Official Link
                </a>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  handleEdit(
                    notice
                  )
                }
                style={{
                  flex:
                    "1 1 90px",
                }}
              >
                Edit
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={
                  publishingId ===
                  notice.id
                }
                onClick={() =>
                  handleTogglePublish(
                    notice.id
                  )
                }
                style={{
                  flex:
                    "1 1 110px",
                }}
              >
                {publishingId ===
                notice.id
                  ? "Updating..."
                  : notice.is_published
                    ? "Unpublish"
                    : "Publish"}
              </button>

              <button
                type="button"
                className="btn"
                disabled={
                  deletingId ===
                  notice.id
                }
                onClick={() =>
                  handleDelete(
                    notice.id
                  )
                }
                style={{
                  flex:
                    "1 1 90px",
                  background:
                    "#fef2f2",
                  color:
                    "#dc2626",
                  border:
                    "1px solid #fecaca",
                }}
              >
                {deletingId ===
                notice.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        );
      };

    // =================================================
    // MAIN RENDER
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
              HEADER
          ========================================= */}

          <div
            style={{
              padding:
                "2rem 0 1.5rem",
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
                  "1rem",
                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "0.5rem",
                    marginBottom:
                      "0.5rem",
                  }}
                >
                  <Link
                    to="/counsellor-dashboard"
                    style={{
                      color:
                        "#2563eb",
                      textDecoration:
                        "none",
                      fontSize:
                        "0.85rem",
                      fontWeight:
                        600,
                    }}
                  >
                    Dashboard
                  </Link>

                  <span
                    style={{
                      color:
                        "#cbd5e1",
                    }}
                  >
                    /
                  </span>

                  <span
                    style={{
                      color:
                        "#64748b",
                      fontSize:
                        "0.85rem",
                    }}
                  >
                    Notices
                  </span>
                </div>

                <h1
                  style={{
                    margin:
                      0,
                    fontSize:
                      "clamp(1.7rem, 4vw, 2.35rem)",
                    color:
                      "#0f172a",
                  }}
                >
                  Notice Management
                </h1>

                <p
                  style={{
                    margin:
                      "0.5rem 0 0",
                    color:
                      "#64748b",
                    maxWidth:
                      "650px",
                    lineHeight:
                      1.6,
                  }}
                >
                  Create and manage official KCET and
                  NEET counselling notices for students.
                </p>
              </div>

              <Link
                to="/notices"
                className="btn btn-secondary"
                style={{
                  textDecoration:
                    "none",
                }}
              >
                View Public Notices
              </Link>
            </div>
          </div>

          {/* =========================================
              ALERTS
          ========================================= */}

          {error && (
            <div
              style={{
                marginBottom:
                  "1rem",
                padding:
                  "0.9rem 1rem",
                borderRadius:
                  "10px",
                background:
                  "#fef2f2",
                border:
                  "1px solid #fecaca",
                color:
                  "#b91c1c",
                fontWeight:
                  500,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom:
                  "1rem",
                padding:
                  "0.9rem 1rem",
                borderRadius:
                  "10px",
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                color:
                  "#15803d",
                fontWeight:
                  500,
              }}
            >
              {success}
            </div>
          )}

          {/* =========================================
              STATS
          ========================================= */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap:
                "1rem",
              marginBottom:
                "1.5rem",
            }}
          >
            <div
              className="card"
              style={{
                padding:
                  "1.15rem",
              }}
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "0.82rem",
                  marginBottom:
                    "0.35rem",
                }}
              >
                Total Notices
              </div>

              <div
                style={{
                  fontSize:
                    "1.7rem",
                  fontWeight:
                    800,
                  color:
                    "#0f172a",
                }}
              >
                {totalNotices}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding:
                  "1.15rem",
              }}
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "0.82rem",
                  marginBottom:
                    "0.35rem",
                }}
              >
                Published
              </div>

              <div
                style={{
                  fontSize:
                    "1.7rem",
                  fontWeight:
                    800,
                  color:
                    "#15803d",
                }}
              >
                {publishedCount}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding:
                  "1.15rem",
              }}
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "0.82rem",
                  marginBottom:
                    "0.35rem",
                }}
              >
                Important
              </div>

              <div
                style={{
                  fontSize:
                    "1.7rem",
                  fontWeight:
                    800,
                  color:
                    "#c2410c",
                }}
              >
                {importantCount}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding:
                  "1.15rem",
              }}
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "0.82rem",
                  marginBottom:
                    "0.35rem",
                }}
              >
                Expired
              </div>

              <div
                style={{
                  fontSize:
                    "1.7rem",
                  fontWeight:
                    800,
                  color:
                    "#dc2626",
                }}
              >
                {expiredCount}
              </div>
            </div>
          </div>

          {/* =========================================
              CREATE / EDIT FORM
          ========================================= */}

          <div
            className="card"
            style={{
              padding:
                "1.5rem",
              marginBottom:
                "1.5rem",
            }}
          >
            <div
              style={{
                marginBottom:
                  "1.25rem",
              }}
            >
              <h2
                style={{
                  margin:
                    0,
                  fontSize:
                    "1.2rem",
                  color:
                    "#0f172a",
                }}
              >
                {editingId
                  ? "Edit Notice"
                  : "Create New Notice"}
              </h2>

              <p
                style={{
                  margin:
                    "0.35rem 0 0",
                  color:
                    "#64748b",
                  fontSize:
                    "0.88rem",
                }}
              >
                Add official exam updates, counselling
                announcements, deadlines and important
                student information.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap:
                    "1rem",
                }}
              >
                <div>
                  <label
                    className="label"
                    htmlFor="exam"
                  >
                    Exam
                  </label>

                  <select
                    id="exam"
                    name="exam"
                    value={
                      form.exam
                    }
                    onChange={
                      handleChange
                    }
                    className="input"
                  >
                    <option value="KCET">
                      KCET
                    </option>

                    <option value="NEET">
                      NEET
                    </option>
                  </select>
                </div>

                <div
                  style={{
                    gridColumn:
                      "span 2",
                  }}
                >
                  <label
                    className="label"
                    htmlFor="title"
                  >
                    Notice Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    className="input"
                    placeholder="Example: KCET 2026 Counselling Registration Begins"
                    maxLength={255}
                  />
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    className="label"
                    htmlFor="summary"
                  >
                    Summary
                  </label>

                  <textarea
                    id="summary"
                    name="summary"
                    value={
                      form.summary
                    }
                    onChange={
                      handleChange
                    }
                    className="input"
                    rows={5}
                    placeholder="Explain the important details of the notice clearly for students..."
                    style={{
                      resize:
                        "vertical",
                      minHeight:
                        "120px",
                    }}
                  />
                </div>

                <div
                  style={{
                    gridColumn:
                      "span 2",
                  }}
                >
                  <label
                    className="label"
                    htmlFor="official_link"
                  >
                    Official Link
                  </label>

                  <input
                    id="official_link"
                    name="official_link"
                    type="url"
                    value={
                      form.official_link
                    }
                    onChange={
                      handleChange
                    }
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor="published_date"
                  >
                    Published Date
                  </label>

                  <input
                    id="published_date"
                    name="published_date"
                    type="date"
                    value={
                      form.published_date
                    }
                    onChange={
                      handleChange
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor="expiry_date"
                  >
                    Expiry Date
                  </label>

                  <input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={
                      form.expiry_date
                    }
                    onChange={
                      handleChange
                    }
                    className="input"
                  />
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap:
                    "1.25rem",
                  marginTop:
                    "1.25rem",
                  padding:
                    "1rem",
                  background:
                    "#f8fafc",
                  borderRadius:
                    "10px",
                }}
              >
                <label
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "0.55rem",
                    cursor:
                      "pointer",
                    color:
                      "#334155",
                    fontWeight:
                      600,
                    fontSize:
                      "0.9rem",
                  }}
                >
                  <input
                    type="checkbox"
                    name="is_important"
                    checked={
                      form.is_important
                    }
                    onChange={
                      handleChange
                    }
                  />
                  Mark as important
                </label>

                <label
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "0.55rem",
                    cursor:
                      "pointer",
                    color:
                      "#334155",
                    fontWeight:
                      600,
                    fontSize:
                      "0.9rem",
                  }}
                >
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={
                      form.is_published
                    }
                    onChange={
                      handleChange
                    }
                  />
                  Publish immediately
                </label>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap:
                    "0.75rem",
                  marginTop:
                    "1.25rem",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Notice"
                      : "Create Notice"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      resetForm
                    }
                    disabled={
                      saving
                    }
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* =========================================
              FILTERS
          ========================================= */}

          <div
            className="card"
            style={{
              padding:
                "1rem",
              marginBottom:
                "1.5rem",
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
                  gap:
                    "0.4rem",
                  flexWrap:
                    "wrap",
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
          </div>

          {/* =========================================
              NOTICES
          ========================================= */}

          {loading ? (
            <div
              className="card"
              style={{
                padding:
                  "3rem",
                textAlign:
                  "center",
                color:
                  "#64748b",
              }}
            >
              Loading notices...
            </div>
          ) : filteredNotices.length ===
            0 ? (
            <div
              className="card"
              style={{
                padding:
                  "3rem 1.5rem",
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
                No notices found
              </h3>

              <p
                style={{
                  margin:
                    0,
                  color:
                    "#64748b",
                }}
              >
                Create your first notice or change the
                current filters.
              </p>
            </div>
          ) : (
            <>
              {(filterExam ===
                "ALL" ||
                filterExam ===
                  "KCET") &&
                kcetNotices.length >
                  0 && (
                  <section
                    style={{
                      marginBottom:
                        "2rem",
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
                        marginBottom:
                          "1rem",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin:
                              0,
                            color:
                              "#0f172a",
                            fontSize:
                              "1.35rem",
                          }}
                        >
                          KCET Notices
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
                          {kcetNotices.length} notice
                          {kcetNotices.length !==
                          1
                            ? "s"
                            : ""}
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
                      {kcetNotices.map(
                        renderNoticeCard
                      )}
                    </div>
                  </section>
                )}

              {(filterExam ===
                "ALL" ||
                filterExam ===
                  "NEET") &&
                neetNotices.length >
                  0 && (
                  <section
                    style={{
                      marginBottom:
                        "2rem",
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
                        marginBottom:
                          "1rem",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin:
                              0,
                            color:
                              "#0f172a",
                            fontSize:
                              "1.35rem",
                          }}
                        >
                          NEET Notices
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
                          {neetNotices.length} notice
                          {neetNotices.length !==
                          1
                            ? "s"
                            : ""}
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
                      {neetNotices.map(
                        renderNoticeCard
                      )}
                    </div>
                  </section>
                )}
            </>
          )}
        </div>
      </div>
    );
  };

export default CounsellorNotices;