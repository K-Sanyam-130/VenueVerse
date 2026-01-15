const express = require("express");
const router = express.Router();

const {
    getReceiptsForClub,
    downloadReceipt,
} = require("../controllers/receiptController");

const auth = require("../middleware/auth");

/**
 * Get all receipts for the logged-in club
 * Requires club authentication
 */
router.get("/club", auth, getReceiptsForClub);

/**
 * Download a specific receipt PDF
 * Requires club authentication and ownership verification
 */
router.get("/download/:id", auth, downloadReceipt);

module.exports = router;
