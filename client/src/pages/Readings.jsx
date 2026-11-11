
import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Droplets,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Activity,
  RefreshCw
} from "lucide-react";
import api from "../services/api";

const SLOTS = [
  "Morning",
  "After breakfast",
  "After lunch",
  "After dinner"
];

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialForm = {
  reading_date: getToday(),
  time_slot: "Morning",
  value: ""
};

export default function Readings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchReadings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/readings");
      setReadings(response.data.readings || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load readings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (reading) => {
    setEditingId(reading.id);
    setForm({
      reading_date: reading.reading_date,
      time_slot: reading.time_slot,
      value: String(reading.value)
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const glucoseValue = Number(form.value);

    if (!Number.isInteger(glucoseValue) || glucoseValue < 40 || glucoseValue > 600) {
      setError("Glucose value must be an integer between 40 and 600 mg/dL.");
      return;
    }

    if (!form.reading_date || form.reading_date > getToday()) {
      setError("Please select a valid date that is not in the future.");
      return;
    }

    const payload = {
      reading_date: form.reading_date,
      time_slot: form.time_slot,
      value: glucoseValue
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
        setSuccess("Reading updated successfully.");
      } else {
        await api.post("/readings", payload);
        setSuccess("Reading added successfully.");
      }

      closeForm();
      await fetchReadings();

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save reading."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this glucose reading?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/readings/${id}`);

      setSuccess("Reading deleted successfully.");
      await fetchReadings();

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete reading."
      );
    }
  };

  const sortedReadings = [...readings].sort((a, b) => {
    const dateCompare = b.reading_date.localeCompare(a.reading_date);

    if (dateCompare !== 0) return dateCompare;

    return SLOTS.indexOf(a.time_slot) - SLOTS.indexOf(b.time_slot);
  });

  return (
    <div className="readings-page">

      <section className="readings-heading">
        <div>
          <p className="eyebrow">YOUR HEALTH JOURNEY</p>
          <h1>My readings<span>.</span></h1>
          <p className="heading-description">
            Track and manage your daily glucose measurements.
          </p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          <Plus size={18} />
          Add reading
        </button>
      </section>

      {error && !showForm && (
        <div className="reading-alert error-alert">{error}</div>
      )}

      {success && (
        <div className="reading-alert success-alert">{success}</div>
      )}

      <section className="reading-overview">
        <div className="overview-icon">
          <Activity size={21} />
        </div>
        <div>
          <span>Total saved readings</span>
          <strong>{readings.length}</strong>
        </div>
        <div className="overview-description">
          Your personal glucose history
        </div>
      </section>

      {showForm && (
        <div className="reading-modal-backdrop">
          <div className="reading-modal">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">
                  {editingId ? "UPDATE ENTRY" : "NEW ENTRY"}
                </p>
                <h2>{editingId ? "Edit reading" : "Add glucose reading"}</h2>
              </div>

              <button className="modal-close" onClick={closeForm} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="reading-form">

              <label>Reading date</label>
              <div className="form-input">
                <CalendarDays size={17} />
                <input
                  type="date"
                  value={form.reading_date}
                  max={getToday()}
                  onChange={(e) =>
                    setForm({ ...form, reading_date: e.target.value })
                  }
                  required
                />
              </div>

              <label>Time slot</label>
              <select
                value={form.time_slot}
                onChange={(e) =>
                  setForm({ ...form, time_slot: e.target.value })
                }
                required
              >
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>

              <label>Glucose value (mg/dL)</label>
              <div className="form-input">
                <Droplets size={17} />
                <input
                  type="number"
                  min="40"
                  max="600"
                  step="1"
                  placeholder="Enter glucose value"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: e.target.value })
                  }
                  required
                />
                <span className="input-unit">mg/dL</span>
              </div>

              <p className="form-hint">
                Enter a whole number between 40 and 600 mg/dL.
              </p>

              {error && (
                <div className="reading-alert error-alert">{error}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update reading"
                      : "Save reading"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="readings-table-panel">
        <div className="table-heading">
          <div>
            <p className="eyebrow">READING HISTORY</p>
            <h2>All readings</h2>
          </div>

          <button
            className="refresh-button"
            onClick={fetchReadings}
            disabled={loading}
            aria-label="Refresh readings"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="table-state">Loading your readings...</div>
        ) : sortedReadings.length === 0 ? (
          <div className="table-empty">
            <div className="empty-reading-icon">
              <Droplets size={27} />
            </div>
            <h3>No readings yet</h3>
            <p>Your glucose readings will appear here once you add them.</p>
            <button className="primary-button" onClick={openAddForm}>
              <Plus size={17} />
              Add your first reading
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="readings-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time slot</th>
                  <th>Glucose value</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedReadings.map((reading) => (
                  <tr key={reading.id}>
                    <td>
                      <span className="date-cell">{reading.reading_date}</span>
                    </td>

                    <td>
                      <span className="slot-cell">{reading.time_slot}</span>
                    </td>

                    <td>
                      <strong className="glucose-cell">
                        {reading.value}
                        <span>mg/dL</span>
                      </strong>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="action-button edit-action"
                          onClick={() => openEditForm(reading)}
                          aria-label="Edit reading"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="action-button delete-action"
                          onClick={() => handleDelete(reading.id)}
                          aria-label="Delete reading"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
