
const pool = require("../config/db");

// Allowed glucose time slots
const VALID_SLOTS = [
  "Morning",
  "After breakfast",
  "After lunch",
  "After dinner"
];

// Validate date format and actual calendar date
const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// Check whether date is in the future
const isFutureDate = async (date) => {
  const result = await pool.query(
    "SELECT $1::date > CURRENT_DATE AS is_future",
    [date]
  );

  return result.rows[0].is_future;
};

// Validate reading input
const validateReading = async (date, timeSlot, value) => {
  if (value === undefined || value === null || value === "") {
    return "Please enter a glucose value.";
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 40 ||
    value > 600
  ) {
    return "Value must be between 40 and 600 mg/dl.";
  }

  if (!isValidDate(date)) {
    return "Please enter a valid date.";
  }

  if (await isFutureDate(date)) {
    return "Date cannot be in the future.";
  }

  if (!VALID_SLOTS.includes(timeSlot)) {
    return "Please select a valid time slot.";
  }

  return null;
};

// ADD READING
const addReading = async (req, res) => {
  const { reading_date, time_slot, value } = req.body;
  const userId = req.user.id;

  try {
    const validationError = await validateReading(
      reading_date,
      time_slot,
      value
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        "SELECT id FROM users WHERE id = $1 FOR UPDATE",
        [userId]
      );

      const countResult = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM readings
         WHERE user_id = $1 AND reading_date = $2`,
        [userId, reading_date]
      );

      if (countResult.rows[0].count >= 4) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "You can add only 4 readings per day."
        });
      }

      const existingReading = await client.query(
        `SELECT id FROM readings
         WHERE user_id = $1
         AND reading_date = $2
         AND time_slot = $3`,
        [userId, reading_date, time_slot]
      );

      if (existingReading.rows.length > 0) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: `You already have a ${time_slot} reading for this date.`
        });
      }

      const result = await client.query(
        `INSERT INTO readings
         (user_id, reading_date, time_slot, value)
         VALUES ($1, $2, $3, $4)
         RETURNING
           id,
           user_id,
           TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
           time_slot,
           value,
           created_at,
           updated_at`,
        [userId, reading_date, time_slot, value]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Glucose reading added successfully.",
        reading: result.rows[0]
      });

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Add reading error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: `You already have a ${time_slot} reading for this date.`
      });
    }

    return res.status(500).json({
      message: "Unable to add glucose reading."
    });
  }
};

// GET ALL READINGS FOR LOGGED-IN USER
const getReadings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value,
         created_at,
         updated_at
       FROM readings
       WHERE user_id = $1
       ORDER BY reading_date DESC,
       CASE time_slot
         WHEN 'Morning' THEN 1
         WHEN 'After breakfast' THEN 2
         WHEN 'After lunch' THEN 3
         WHEN 'After dinner' THEN 4
       END`,
      [req.user.id]
    );

    return res.status(200).json({
      count: result.rows.length,
      readings: result.rows
    });

  } catch (error) {
    console.error("Get readings error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve readings."
    });
  }
};

// GET SINGLE READING
const getReadingById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value,
         created_at,
         updated_at
       FROM readings
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found."
      });
    }

    return res.status(200).json({
      reading: result.rows[0]
    });

  } catch (error) {
    console.error("Get reading error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve reading."
    });
  }
};

// UPDATE READING
const updateReading = async (req, res) => {
  const { reading_date, time_slot, value } = req.body;
  const userId = req.user.id;
  const readingId = req.params.id;

  try {
    const validationError = await validateReading(
      reading_date,
      time_slot,
      value
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        "SELECT id FROM users WHERE id = $1 FOR UPDATE",
        [userId]
      );

      const existing = await client.query(
        `SELECT id FROM readings
         WHERE id = $1 AND user_id = $2`,
        [readingId, userId]
      );

      if (existing.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "Reading not found."
        });
      }

      const countResult = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM readings
         WHERE user_id = $1
         AND reading_date = $2
         AND id <> $3`,
        [userId, reading_date, readingId]
      );

      if (countResult.rows[0].count >= 4) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "You can add only 4 readings per day."
        });
      }

      const duplicate = await client.query(
        `SELECT id FROM readings
         WHERE user_id = $1
         AND reading_date = $2
         AND time_slot = $3
         AND id <> $4`,
        [userId, reading_date, time_slot, readingId]
      );

      if (duplicate.rows.length > 0) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: `You already have a ${time_slot} reading for this date.`
        });
      }

      const result = await client.query(
        `UPDATE readings
         SET reading_date = $1,
             time_slot = $2,
             value = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND user_id = $5
         RETURNING
           id,
           user_id,
           TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
           time_slot,
           value,
           created_at,
           updated_at`,
        [reading_date, time_slot, value, readingId, userId]
      );

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Glucose reading updated successfully.",
        reading: result.rows[0]
      });

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Update reading error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: `You already have a ${time_slot} reading for this date.`
      });
    }

    return res.status(500).json({
      message: "Unable to update glucose reading."
    });
  }
};

// DELETE READING
const deleteReading = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found."
      });
    }

    return res.status(200).json({
      message: "Glucose reading deleted successfully."
    });

  } catch (error) {
    console.error("Delete reading error:", error.message);

    return res.status(500).json({
      message: "Unable to delete glucose reading."
    });
  }
};

module.exports = {
  addReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading
};
