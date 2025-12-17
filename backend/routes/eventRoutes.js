const express = require("express");
const {
  registerEvent,
  getAllEvents,
  updateEventStatus
} = require("../controllers/eventController");

const router = express.Router();

router.post("/add", registerEvent);
router.get("/all", getAllEvents);
router.put("/update/:id", updateEventStatus);

module.exports = router;
