import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const emptyForm = {
  exam: "KCET",
  title: "",
  summary: "",
  official_link: "",
  published_date: "",
  expiry_date: "",
  is_important: false,
  is_published: true,
};

function CounsellorNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/notices/manage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notices."
        );
      }

      setNotices(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const url = editingId
        ? `${API_BASE_URL}/notices/${editingId}`
        : `${API_BASE_URL}/notices`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          published_date:
            form.published_date || null,
          expiry_date:
            form.expiry_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save notice."
        );
      }

      setSuccess(
        editingId
          ? "Notice updated successfully."
          : "Notice created successfully."
      );

      resetForm();
      await fetchNotices();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);

    setForm({
      exam: notice.exam || "KCET",
      title: notice.title || "",
      summary: notice.summary || "",
      official_link:
        notice.official_link || "",
      published_date:
        notice.published_date
          ? notice.published_date.substring(
              0,
              10
            )
          : "",
      expiry_date:
        notice.expiry_date
          ? notice.expiry_date.substring(
              0,
              10
            )
          : "",
      is_important:
        notice.is_important || false,
      is_published:
        notice.is_published ?? true,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/notices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete notice."
        );
      }

      setSuccess(
        "Notice deleted successfully."
      );

      await fetchNotices();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/notices/${id}/publish`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update notice status."
        );
      }

      setSuccess(data.message);

      await fetchNotices();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      `${date.substring(0, 10)}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const kcetNotices = notices.filter(
    (notice) => notice.exam === "KCET"
  );

  const neetNotices = notices.filter(
    (notice) => notice.exam === "NEET"
  );

  const NoticeCard = ({ notice }) => (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-primary">
              {notice.exam}
            </span>

            {notice.is_important && (
              <span className="badge badge-warning">
                Important
              </span>
            )}

            <span
              className={
                notice.is_published
                  ? "badge badge-success"
                  : "badge"
              }
            >
              {notice.is_published
                ? "Published"
                : "Unpublished"}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {notice.title}
          </h3>

          <p className="text-sm text-slate-600 leading-6 whitespace-pre-line">
            {notice.summary}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-700">
                Published:
              </span>{" "}
              {formatDate(
                notice.published_date
              )}
            </div>

            <div>
              <span className="font-semibold text-slate-700">
                Expires:
              </span>{" "}
              {formatDate(
                notice.expiry_date
              )}
            </div>
          </div>

          {notice.official_link && (
            <a
              href={notice.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View Official Notification →
            </a>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            handleEdit(notice)
          }
          className="btn btn-secondary"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            handleTogglePublish(notice.id)
          }
          className="btn btn-outline"
        >
          {notice.is_published
            ? "Unpublish"
            : "Publish"}
        </button>

        <button
          type="button"
          onClick={() =>
            handleDelete(notice.id)
          }
          className="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-app py-8 md:py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="badge badge-primary mb-3">
                Counsellor Portal
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Notice Management
              </h1>

              <p className="mt-2 text-slate-600 max-w-2xl">
                Create and manage official KCET and
                NEET admission updates for students.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setForm(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                }
              }}
              className="btn btn-primary"
            >
              {showForm
                ? "Close Form"
                : "+ Create Notice"}
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <div className="card mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId
                  ? "Edit Notice"
                  : "Create New Notice"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a short and clear government
                admission update.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* EXAM + TITLE */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    Exam
                  </label>

                  <select
                    name="exam"
                    value={form.exam}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="KCET">
                      KCET
                    </option>

                    <option value="NEET">
                      NEET
                    </option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Notice Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="Example: KCET 2026 Counselling Registration Begins"
                    required
                  />
                </div>
              </div>

              {/* SUMMARY */}
              <div>
                <label className="label">
                  Summary
                </label>

                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  className="input min-h-[130px] resize-y"
                  placeholder="Briefly explain the notification, important dates and instructions..."
                  required
                />
              </div>

              {/* LINK */}
              <div>
                <label className="label">
                  Official Government Link
                </label>

                <input
                  type="url"
                  name="official_link"
                  value={form.official_link}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://..."
                />

                <p className="mt-1 text-xs text-slate-500">
                  Add the official KCET/NEET website
                  notification link whenever available.
                </p>
              </div>

              {/* DATES */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    Published Date
                  </label>

                  <input
                    type="date"
                    name="published_date"
                    value={form.published_date}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiry_date"
                    value={form.expiry_date}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              {/* OPTIONS */}
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_important"
                    checked={form.is_important}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Mark as important
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Publish immediately
                  </span>
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Notice"
                    : "Create Notice"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* NOTICE LIST */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="text-slate-500">
              Loading notices...
            </div>
          </div>
        ) : notices.length === 0 ? (
          <div className="card text-center py-14">
            <div className="text-4xl mb-4">
              📢
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              No notices yet
            </h2>

            <p className="mt-2 text-slate-500">
              Create your first KCET or NEET
              admission notice.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* KCET */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    KCET Notices
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Karnataka Common Entrance Test
                  </p>
                </div>

                <span className="badge">
                  {kcetNotices.length}{" "}
                  {kcetNotices.length === 1
                    ? "Notice"
                    : "Notices"}
                </span>
              </div>

              {kcetNotices.length === 0 ? (
                <div className="card text-center py-8 text-slate-500">
                  No KCET notices available.
                </div>
              ) : (
                <div className="grid gap-5">
                  {kcetNotices.map(
                    (notice) => (
                      <NoticeCard
                        key={notice.id}
                        notice={notice}
                      />
                    )
                  )}
                </div>
              )}
            </section>

            {/* NEET */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    NEET Notices
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    National Eligibility cum
                    Entrance Test
                  </p>
                </div>

                <span className="badge">
                  {neetNotices.length}{" "}
                  {neetNotices.length === 1
                    ? "Notice"
                    : "Notices"}
                </span>
              </div>

              {neetNotices.length === 0 ? (
                <div className="card text-center py-8 text-slate-500">
                  No NEET notices available.
                </div>
              ) : (
                <div className="grid gap-5">
                  {neetNotices.map(
                    (notice) => (
                      <NoticeCard
                        key={notice.id}
                        notice={notice}
                      />
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CounsellorNotices;