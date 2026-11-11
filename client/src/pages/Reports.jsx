
import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Calculator,
  CalendarDays,
  RefreshCw,
  Droplets,
  ChartNoAxesCombined,
  Clock3
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

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
};

const REPORTS = [
  { id: "daily", label: "Daily Report" },
  { id: "month-to-date", label: "Month to Date" },
  { id: "previous-month", label: "Previous Month" }
];

function MetricCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="report-metric-card">
      <div className={`report-metric-icon ${color}`}>
        <Icon size={21} />
      </div>

      <p>{label}</p>

      <h2>
        {value}
        {unit && <span>{unit}</span>}
      </h2>
    </div>
  );
}

export default function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [report, setReport] = useState(null);
  const [dailyReadings, setDailyReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "";

      if (reportType === "daily") {
        endpoint = `/reports/daily?date=${selectedDate}`;
      } else if (reportType === "month-to-date") {
        endpoint = "/reports/month-to-date";
      } else {
        endpoint = "/reports/previous-month";
      }

      const response = await api.get(endpoint);

      setReport(response.data);

      // Fetch individual readings for the selected daily report
      if (reportType === "daily") {
        const readingsResponse = await api.get("/readings");

        const filteredReadings = (
          readingsResponse.data.readings || []
        )
          .filter(
            (reading) => reading.reading_date === selectedDate
          )
          .sort(
            (a, b) =>
              SLOTS.indexOf(a.time_slot) -
              SLOTS.indexOf(b.time_slot)
          );

        setDailyReadings(filteredReadings);
      } else {
        setDailyReadings([]);
      }

    } catch (err) {
      setReport(null);
      setDailyReadings([]);

      setError(
        err.response?.data?.message ||
        "Unable to load the report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [reportType, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatMetric = (value) => {
    return value === null || value === undefined
      ? "—"
      : Number(value).toFixed(1);
  };

  const reportTitle = REPORTS.find(
    (item) => item.id === reportType
  )?.label;

  const hasReadings = report && report.count > 0;

  return (
    <div className="reports-page">

      {/* PAGE HEADER */}
      <section className="reports-heading">
        <div>
          <p className="eyebrow">YOUR HEALTH INSIGHTS</p>

          <h1>
            Analytics<span>.</span>
          </h1>

          <p className="heading-description">
            Understand your glucose history through your reports.
          </p>
        </div>

        <div className="reports-heading-icon">
          <ChartNoAxesCombined size={25} />
        </div>
      </section>

      {/* REPORT TABS */}
      <section className="report-tabs">
        {REPORTS.map((item) => (
          <button
            key={item.id}
            className={`report-tab ${
              reportType === item.id ? "selected" : ""
            }`}
            onClick={() => setReportType(item.id)}
          >
            {item.label}
          </button>
        ))}
      </section>

      {/* REPORT FILTER */}
      <section className="report-filter-panel">
        <div>
          <p className="eyebrow">REPORT PERIOD</p>

          <h2>{reportTitle}</h2>

          <p className="report-filter-description">
            {reportType === "daily"
              ? "Choose a date to view its glucose summary."
              : reportType === "month-to-date"
                ? "Your readings from the beginning of this month until today."
                : "Your complete report for the previous calendar month."}
          </p>
        </div>

        {reportType === "daily" && (
          <div className="report-date-input">
            <CalendarDays size={17} />

            <input
              type="date"
              value={selectedDate}
              max={getToday()}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        <button
          className="refresh-button"
          onClick={fetchReport}
          disabled={loading}
          aria-label="Refresh report"
        >
          <RefreshCw size={16} />
        </button>
      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="reading-alert error-alert">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="report-state">
          <div className="loading-spinner" />
          <p>Preparing your report...</p>
        </div>
      ) : report && (
        <>
          {/* REPORT PERIOD */}
          <section className="report-period-card">
            <div className="period-card-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>Report period</span>

              <strong>
                {report.date
                  ? report.date
                  : `${report.startDate} — ${report.endDate}`}
              </strong>
            </div>

            <div className="period-reading-count">
              <strong>{report.count}</strong>
              <span>Total readings</span>
            </div>
          </section>

          {/* SUMMARY METRICS */}
          <section className="report-metrics-grid">
            <MetricCard
              icon={TrendingUp}
              label="Highest reading"
              value={hasReadings ? report.high : "—"}
              unit={hasReadings ? "mg/dL" : ""}
              color="orange"
            />

            <MetricCard
              icon={TrendingDown}
              label="Lowest reading"
              value={hasReadings ? report.low : "—"}
              unit={hasReadings ? "mg/dL" : ""}
              color="blue"
            />

            <MetricCard
              icon={Calculator}
              label="Average reading"
              value={hasReadings ? formatMetric(report.average) : "—"}
              unit={hasReadings ? "mg/dL" : ""}
              color="purple"
            />

            <MetricCard
              icon={Droplets}
              label="Total readings"
              value={report.count}
              unit="readings"
              color="green"
            />
          </section>

          {/* DAILY INDIVIDUAL READINGS */}
          {reportType === "daily" && (
            <section className="daily-readings-panel">
              <div className="table-heading">
                <div>
                  <p className="eyebrow">DAILY HISTORY</p>
                  <h2>Individual readings</h2>
                </div>

                <span className="daily-count">
                  {dailyReadings.length} readings
                </span>
              </div>

              {dailyReadings.length > 0 ? (
                <div className="daily-reading-list">
                  {dailyReadings.map((reading, index) => (
                    <div
                      className="daily-reading-row"
                      key={reading.id}
                    >
                      <div className="daily-reading-info">
                        <div
                          className={`daily-reading-icon ${
                            ["purple", "blue", "green", "orange"][index]
                          }`}
                        >
                          <Activity size={17} />
                        </div>

                        <div>
                          <strong>{reading.time_slot}</strong>

                          <span>
                            <Clock3 size={12} />
                            {reading.reading_date}
                          </span>
                        </div>
                      </div>

                      <strong className="daily-reading-value">
                        {reading.value}
                        <span>mg/dL</span>
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="daily-empty">
                  <div className="report-empty-icon">
                    <Droplets size={25} />
                  </div>

                  <strong>No readings for this date</strong>

                  <p>
                    Your individual glucose readings will appear here
                    after you add them.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* EMPTY REPORT STATE */}
          {!hasReadings && (
            <section className="report-empty">
              <div className="report-empty-icon">
                <Activity size={29} />
              </div>

              <h3>No readings found</h3>

              <p>
                There are no saved glucose readings for this report period.
                Add readings to see your analytics here.
              </p>
            </section>
          )}

          {/* REPORT SUMMARY */}
          {hasReadings && (
            <section className="report-summary-panel">
              <div className="report-summary-icon">
                <Activity size={20} />
              </div>

              <div>
                <strong>Your report is ready.</strong>

                <p>
                  This report summarizes {report.count} saved glucose
                  {report.count === 1 ? " reading" : " readings"} for the
                  selected period.
                </p>
              </div>
            </section>
          )}
        </>
      )}

      {/* DISCLAIMER */}
      <p className="reports-disclaimer">
        Reports summarize recorded measurements. They do not provide a
        medical diagnosis.
      </p>

    </div>
  );
}
