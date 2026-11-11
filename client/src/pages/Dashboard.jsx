
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Activity,
  Droplets,
  CalendarDays,
  TrendingUp,
  Clock3,
  RefreshCw
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import api from "../services/api";

const SLOTS = [
  "Morning",
  "After breakfast",
  "After lunch",
  "After dinner"
];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function StatCard({ icon: Icon, label, value, unit, note, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>

      <p className="stat-label">{label}</p>

      <div className="stat-value-row">
        <h2>{value}</h2>
        {unit && <span>{unit}</span>}
      </div>

      <div className="stat-note">
        <ArrowUpRight size={14} />
        <span>{note}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = formatDate(new Date());

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/readings");

      setReadings(response.data.readings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your glucose readings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const todayReadings = useMemo(
    () => readings.filter((reading) => reading.reading_date === today),
    [readings, today]
  );

  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => {
      const dateCompare = b.reading_date.localeCompare(a.reading_date);

      if (dateCompare !== 0) return dateCompare;

      return SLOTS.indexOf(a.time_slot) - SLOTS.indexOf(b.time_slot);
    });
  }, [readings]);

  const latestReading = useMemo(() => {
    return [...readings].sort((a, b) => {
      const dateCompare = b.reading_date.localeCompare(a.reading_date);

      if (dateCompare !== 0) return dateCompare;

      return SLOTS.indexOf(b.time_slot) - SLOTS.indexOf(a.time_slot);
    })[0] || null;
  }, [readings]);

  const average = todayReadings.length
    ? (
        todayReadings.reduce((sum, reading) => sum + reading.value, 0) /
        todayReadings.length
      ).toFixed(1)
    : "—";

  const trackingDays = new Set(
    readings.map((reading) => reading.reading_date)
  ).size;

  const chartData = useMemo(() => {
    return [...todayReadings]
      .sort(
        (a, b) =>
          SLOTS.indexOf(a.time_slot) - SLOTS.indexOf(b.time_slot)
      )
      .map((reading) => ({
        time: reading.time_slot,
        value: reading.value
      }));
  }, [todayReadings]);

  const recentReadings = sortedReadings.slice(0, 4);

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="loading-spinner" />
        <p>Loading your health overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state">
        <p>{error}</p>
        <button className="primary-button" onClick={fetchReadings}>
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">YOUR HEALTH OVERVIEW</p>
          <h1>Good morning<span>.</span></h1>
          <p className="heading-description">
            Here's how your glucose journey is looking today.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/readings")}
        >
          <Plus size={18} />
          Add reading
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={Droplets}
          label="Latest glucose"
          value={latestReading ? latestReading.value : "—"}
          unit={latestReading ? "mg/dL" : ""}
          note={latestReading ? latestReading.reading_date : "No readings yet"}
          color="purple"
        />

        <StatCard
          icon={Activity}
          label="Daily average"
          value={average}
          unit={todayReadings.length ? "mg/dL" : ""}
          note={`${todayReadings.length} readings today`}
          color="blue"
        />

        <StatCard
          icon={TrendingUp}
          label="Total readings"
          value={todayReadings.length}
          unit="readings"
          note="Today's progress"
          color="green"
        />

        <StatCard
          icon={CalendarDays}
          label="Tracking days"
          value={trackingDays}
          unit="days"
          note="Days with saved readings"
          color="orange"
        />
      </section>

      <section className="dashboard-grid">

        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">GLUCOSE HISTORY</p>
              <h2>Your glucose trend</h2>
              <p className="panel-description">
                Your readings recorded today.
              </p>
            </div>

            <span className="period-button">
              Today
              <CalendarDays size={15} />
            </span>
          </div>

          <div className="chart-summary">
            <h2>{average} <span>mg/dL</span></h2>
            <span className="chart-status">Today's average</span>
          </div>

          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="glucoseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8E87F5"
                        stopOpacity={0.30}
                      />
                      <stop
                        offset="95%"
                        stopColor="#8E87F5"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 5"
                    vertical={false}
                    stroke="#ECECF3"
                  />

                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9999AA", fontSize: 10 }}
                  />

                  <YAxis
                    domain={[0, "auto"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9999AA", fontSize: 10 }}
                    width={35}
                  />

                  <Tooltip
                    formatter={(value) => [`${value} mg/dL`, "Glucose"]}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #ECECF3"
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8E87F5"
                    strokeWidth={3}
                    fill="url(#glucoseGradient)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <Activity size={30} />
                <strong>No readings for today</strong>
                <span>Add a reading to see your glucose trend.</span>
              </div>
            )}
          </div>
        </div>

        <div className="panel readings-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR HISTORY</p>
              <h2>Recent readings</h2>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("/readings")}
            >
              View all
            </button>
          </div>

          {recentReadings.length > 0 ? (
            <div className="readings-list">
              {recentReadings.map((reading, index) => (
                <div className="reading-item" key={reading.id}>
                  <div
                    className={`reading-dot ${
                      ["purple", "blue", "green", "orange"][index]
                    }`}
                  />

                  <div className="reading-info">
                    <strong>{reading.time_slot}</strong>
                    <span>
                      <Clock3 size={12} />
                      {reading.reading_date}
                    </span>
                  </div>

                  <div className="reading-value">
                    <strong>{reading.value}</strong>
                    <span>mg/dL</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-readings">
              <Droplets size={27} />
              <strong>No readings yet</strong>
              <span>Your saved readings will appear here.</span>
            </div>
          )}

          <button
            className="secondary-button"
            onClick={() => navigate("/readings")}
          >
            <Plus size={16} />
            Add new reading
          </button>
        </div>
      </section>

      <section className="bottom-message">
        <div className="message-icon">
          <Activity size={20} />
        </div>
        <div>
          <strong>Small steps make a healthier you.</strong>
          <p>Stay consistent with your daily glucose tracking.</p>
        </div>
      </section>

      <p className="dashboard-disclaimer">
        Your dashboard reflects readings saved to your account.
      </p>

    </div>
  );
}
