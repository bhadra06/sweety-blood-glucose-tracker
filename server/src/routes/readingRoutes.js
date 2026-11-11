const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading
} = require("../controllers/readingController");

// All reading routes require authentication
router.use(authMiddleware);

// CRUD routes
router.post("/", addReading);
router.get("/", getReadings);
router.get("/:id", getReadingById);
router.put("/:id", updateReading);
router.delete("/:id", deleteReading);

module.exports = router;