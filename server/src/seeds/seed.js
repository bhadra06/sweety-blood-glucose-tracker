
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
  try {
    console.log("Starting Sweety database seeding...");

    const demoName = "Sweety Demo";
    const demoEmail = "demo@sweety.com";
    const demoPassword = "Demo@12345";

    // Hash the demo password
    const passwordHash = await bcrypt.hash(demoPassword, 12);

    // Create demo user if it does not already exist
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [demoName, demoEmail, passwordHash]
    );

    const userId = userResult.rows[0].id;

    console.log("Demo user created/found:", demoEmail);

    // Sample readings from previous days
    const sampleReadings = [
      ["2026-11-07", "Morning", 110],
      ["2026-11-07", "After breakfast", 125],
      ["2026-11-08", "Morning", 105],
      ["2026-11-08", "After lunch", 135],
      ["2026-11-09", "Morning", 115],
      ["2026-11-09", "After dinner", 128],
      ["2026-11-10", "Morning", 108],
      ["2026-11-10", "After breakfast", 122]
    ];

    let insertedCount = 0;

    for (const [date, slot, value] of sampleReadings) {
      const result = await pool.query(
        `INSERT INTO readings
         (user_id, reading_date, time_slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot)
         DO NOTHING
         RETURNING id`,
        [userId, date, slot, value]
      );

      insertedCount += result.rowCount;
    }

    console.log(`${insertedCount} new sample readings inserted.`);
    console.log("-----------------------------------");
    console.log("SEEDING COMPLETED SUCCESSFULLY");
    console.log("Demo email:", demoEmail);
    console.log("Demo password:", demoPassword);
    console.log("-----------------------------------");

  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();
