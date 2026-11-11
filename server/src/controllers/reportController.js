
const pool = require("../config/db");

// Reusable function to calculate glucose statistics
const getReport = async (userId, startDate, endDate) => {
  const query = `
    SELECT
      MAX(value) AS high,
      MIN(value) AS low,
      ROUND(AVG(value)::numeric, 1) AS average,
      COUNT(*)::integer AS count
    FROM readings
    WHERE user_id = $1
      AND reading_date >= $2::date
      AND reading_date < $3::date
  `;

  const result = await pool.query(query, [
    userId,
    startDate,
    endDate
  ]);

  const row = result.rows[0];

  return {
    high: row.high === null ? null : Number(row.high),
    low: row.low === null ? null : Number(row.low),
    average: row.average === null ? null : Number(row.average),
    count: row.count
  };
};

// 1. Daily report
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format."
      });
    }

    const result = await pool.query(
      "SELECT $1::date = $1::date AS valid, TO_CHAR($1::date, 'YYYY-MM-DD') AS formatted_date",
      [date]
    );

    if (!result.rows[0].valid || result.rows[0].formatted_date !== date) {
      return res.status(400).json({
        message: "Invalid calendar date."
      });
    }

    const nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const endDate = nextDate.toISOString().slice(0, 10);

    const report = await getReport(req.user.id, date, endDate);

    return res.status(200).json({
      reportType: "daily",
      date,
      ...report
    });
  } catch (error) {
    console.error("Daily report error:", error.message);
    return res.status(500).json({
      message: "Failed to generate daily report."
    });
  }
};

// 2. Month-to-date report
const getMonthToDateReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(date_trunc('month', CURRENT_DATE), 'YYYY-MM-DD') AS start_date,
        TO_CHAR(CURRENT_DATE + 1, 'YYYY-MM-DD') AS end_date
    `);

    const { start_date, end_date } = result.rows[0];

    const report = await getReport(
      req.user.id,
      start_date,
      end_date
    );

    return res.status(200).json({
      reportType: "month-to-date",
      startDate: start_date,
      endDate: end_date,
      ...report
    });
  } catch (error) {
    console.error("Month-to-date report error:", error.message);
    return res.status(500).json({
      message: "Failed to generate month-to-date report."
    });
  }
};

// 3. Previous full month report
const getPreviousMonthReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(
          date_trunc('month', CURRENT_DATE) - INTERVAL '1 month',
          'YYYY-MM-DD'
        ) AS start_date,
        TO_CHAR(
          date_trunc('month', CURRENT_DATE),
          'YYYY-MM-DD'
        ) AS end_date
    `);

    const { start_date, end_date } = result.rows[0];

    const report = await getReport(
      req.user.id,
      start_date,
      end_date
    );

    return res.status(200).json({
      reportType: "previous-month",
      startDate: start_date,
      endDate: end_date,
      ...report
    });
  } catch (error) {
    console.error("Previous month report error:", error.message);
    return res.status(500).json({
      message: "Failed to generate previous month report."
    });
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport
};
