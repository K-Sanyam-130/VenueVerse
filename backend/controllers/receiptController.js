const Receipt = require("../model/Receipt");
const path = require("path");

/**
 * Get all receipts for a specific club
 * Requires authentication
 */
exports.getReceiptsForClub = async (req, res) => {
    try {
        const clubName = req.user?.clubName;

        if (!clubName) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Club name not found",
            });
        }

        console.log(`🔍 Fetching receipts for club: "${clubName}"`);

        const receipts = await Receipt.find({ clubName }).sort({ approvalDate: -1 });

        console.log(`✅ Found ${receipts.length} receipts for ${clubName}`);

        res.json({
            success: true,
            receipts,
        });
    } catch (err) {
        console.error("❌ GET RECEIPTS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch receipts",
        });
    }
};

/**
 * Download a specific receipt PDF
 * Requires authentication and ownership verification
 */
exports.downloadReceipt = async (req, res) => {
    try {
        const receiptId = req.params.id;
        const clubName = req.user?.clubName;

        if (!clubName) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Club name not found",
            });
        }

        // Find receipt and verify ownership
        const receipt = await Receipt.findOne({
            _id: receiptId,
            clubName: clubName,
        });

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found or access denied",
            });
        }

        // Send the PDF file
        const filepath = receipt.pdfPath;
        const filename = path.basename(filepath);

        res.download(filepath, `Receipt_${receipt.eventName.replace(/\s+/g, "_")}.pdf`, (err) => {
            if (err) {
                console.error("❌ FILE DOWNLOAD ERROR:", err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Failed to download receipt",
                    });
                }
            }
        });
    } catch (err) {
        console.error("❌ DOWNLOAD RECEIPT ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to download receipt",
        });
    }
};
