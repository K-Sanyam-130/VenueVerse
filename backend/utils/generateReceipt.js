const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate a professional receipt PDF for approved events
 * @param {Object} receiptData - Receipt information
 * @returns {Promise<string>} - Path to generated PDF file
 */
exports.generateReceiptPDF = async (receiptData) => {
    const {
        eventName,
        clubName,
        memberEmail,
        approvedBy,
        approvalDate,
        venue,
        date,
        timeSlot,
        eventId,
    } = receiptData;

    // Create receipts directory if it doesn't exist
    const receiptsDir = path.join(__dirname, "..", "receipts");
    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `receipt_${eventId}_${timestamp}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({
                size: "A4",
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });

            // Pipe to file
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // ============================================
            // HEADER SECTION - Title Banner
            // ============================================

            // Blue background header
            doc
                .rect(0, 0, 595, 100)
                .fill("#2563eb");

            // Title
            doc
                .fontSize(28)
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .text("EVENT APPROVAL RECEIPT", 50, 30, { align: "center" })
                .moveDown(0.3);

            // Subtitle
            doc
                .fontSize(11)
                .fillColor("#e0e7ff")
                .font("Helvetica")
                .text("VenueVerse - Event Management System", { align: "center" });

            // Reset to white background
            doc.fillColor("#000000");

            // Move down after header
            doc.y = 120;
            doc.moveDown(1);

            // ============================================
            // EVENT DETAILS SECTION
            // ============================================

            // Section title with background
            doc
                .rect(50, doc.y, 495, 35)
                .fill("#f3f4f6");

            doc
                .fontSize(16)
                .fillColor("#1f2937")
                .font("Helvetica-Bold")
                .text("Event Details", 60, doc.y + 10);

            doc.moveDown(2);

            const detailsStartY = doc.y;
            const labelX = 70;
            const valueX = 240;
            const lineHeight = 28;

            // Helper function to add detail row
            const addDetailRow = (label, value, yPos) => {
                // Label
                doc
                    .fontSize(11)
                    .fillColor("#6b7280")
                    .font("Helvetica")
                    .text(label, labelX, yPos);

                // Value
                doc
                    .fontSize(11)
                    .fillColor("#111827")
                    .font("Helvetica-Bold")
                    .text(value, valueX, yPos, { width: 300 });
            };

            // Event details rows
            addDetailRow("Event Name:", eventName, detailsStartY);
            addDetailRow("Club Name:", clubName, detailsStartY + lineHeight);
            addDetailRow("Member Email:", memberEmail, detailsStartY + lineHeight * 2);
            addDetailRow("Event Date:", date, detailsStartY + lineHeight * 3);
            addDetailRow("Time Slot:", timeSlot, detailsStartY + lineHeight * 4);
            addDetailRow("Venue:", venue, detailsStartY + lineHeight * 5);

            doc.y = detailsStartY + lineHeight * 6;
            doc.moveDown(2);

            // ============================================
            // APPROVAL INFORMATION SECTION
            // ============================================

            // Section title with background
            doc
                .rect(50, doc.y, 495, 35)
                .fill("#f3f4f6");

            doc
                .fontSize(16)
                .fillColor("#1f2937")
                .font("Helvetica-Bold")
                .text("Approval Information", 60, doc.y + 10);

            doc.moveDown(2);

            const approvalStartY = doc.y;

            // Format approval date and time
            const approvalDateTime = new Date(approvalDate);
            const formattedDate = approvalDateTime.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            const formattedTime = approvalDateTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });

            // Approval details with icon-like bullets
            const addApprovalRow = (icon, label, value, yPos) => {
                // Icon/Bullet
                doc
                    .circle(labelX, yPos + 5, 3)
                    .fill("#10b981");

                // Label
                doc
                    .fontSize(11)
                    .fillColor("#6b7280")
                    .font("Helvetica")
                    .text(label, labelX + 15, yPos);

                // Value - Highlight admin email prominently
                const isAdminEmail = label.includes("Approved By");
                doc
                    .fontSize(isAdminEmail ? 12 : 11)
                    .fillColor(isAdminEmail ? "#2563eb" : "#111827")
                    .font(isAdminEmail ? "Helvetica-Bold" : "Helvetica-Bold")
                    .text(value, valueX, yPos, { width: 300 });
            };

            addApprovalRow("✓", "Approved By:", approvedBy, approvalStartY);
            addApprovalRow("✓", "Approval Date:", formattedDate, approvalStartY + lineHeight);
            addApprovalRow("✓", "Approval Time:", formattedTime, approvalStartY + lineHeight * 2);

            doc.y = approvalStartY + lineHeight * 3;
            doc.moveDown(2);

            // ============================================
            // SIGNATURE SECTION
            // ============================================

            // Section title with background
            doc
                .rect(50, doc.y, 495, 35)
                .fill("#f3f4f6");

            doc
                .fontSize(16)
                .fillColor("#1f2937")
                .font("Helvetica-Bold")
                .text("Department Authorization", 60, doc.y + 10);

            doc.moveDown(2);

            const signatureY = doc.y;

            // Signature boxes with better styling
            // Authorized Signature box
            doc
                .strokeColor("#d1d5db")
                .lineWidth(2)
                .roundedRect(70, signatureY, 200, 90, 5)
                .stroke();

            doc
                .fontSize(10)
                .fillColor("#6b7280")
                .font("Helvetica")
                .text("Authorized Signature", 70, signatureY + 95, {
                    width: 200,
                    align: "center",
                });

            // Date box
            doc
                .strokeColor("#d1d5db")
                .lineWidth(2)
                .roundedRect(325, signatureY, 200, 90, 5)
                .stroke();

            doc
                .fontSize(10)
                .fillColor("#6b7280")
                .font("Helvetica")
                .text("Date", 325, signatureY + 95, { width: 200, align: "center" });

            // ============================================
            // FOOTER SECTION
            // ============================================

            doc.y = 720;

            // Decorative line
            doc
                .strokeColor("#e5e7eb")
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke();

            doc.moveDown(0.5);

            // Footer text
            doc
                .fontSize(9)
                .fillColor("#9ca3af")
                .font("Helvetica")
                .text(
                    "This is an auto-generated receipt from VenueVerse Event Management System.",
                    50,
                    doc.y,
                    { align: "center", width: 495 }
                );

            doc
                .fontSize(8)
                .fillColor("#d1d5db")
                .text(
                    `Receipt ID: ${eventId} | Generated: ${new Date().toLocaleString("en-IN")}`,
                    50,
                    doc.y + 12,
                    { align: "center", width: 495 }
                );

            // Finalize PDF
            doc.end();

            stream.on("finish", () => {
                resolve(filepath);
            });

            stream.on("error", (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};
