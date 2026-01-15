const mongoose = require("mongoose");
const Admin = require("./model/Admin");
const dotenv = require("dotenv");

dotenv.config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

const updateAdminNames = async () => {
    try {
        // Get all admins
        const admins = await Admin.find({});

        console.log(`\n📋 Found ${admins.length} admin(s) to update\n`);

        // Update each admin with a name if they don't have one
        for (const admin of admins) {
            if (!admin.name) {
                // Extract department name from email
                // e.g., CSEdept@bmsce.ac.in -> CSE Department
                let name = "Admin";

                if (admin.email) {
                    const emailPrefix = admin.email.split("@")[0];

                    // Try to extract department name
                    if (emailPrefix.toLowerCase().includes("cse")) {
                        name = "CSE Department";
                    } else if (emailPrefix.toLowerCase().includes("ise")) {
                        name = "ISE Department";
                    } else if (emailPrefix.toLowerCase().includes("ece")) {
                        name = "ECE Department";
                    } else if (emailPrefix.toLowerCase().includes("mech")) {
                        name = "Mechanical Department";
                    } else if (emailPrefix.toLowerCase().includes("civil")) {
                        name = "Civil Department";
                    } else if (emailPrefix.toLowerCase().includes("eee")) {
                        name = "EEE Department";
                    } else if (emailPrefix.toLowerCase().includes("admin")) {
                        name = "VenueVerse Admin";
                    } else {
                        // Capitalize first letter of email prefix
                        name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
                    }
                }

                admin.name = name;
                await admin.save();
                console.log(`✅ Updated admin: ${admin.email} -> Name: ${name}`);
            } else {
                console.log(`⏭️  Skipped (already has name): ${admin.email} -> ${admin.name}`);
            }
        }

        console.log("\n✅ All admins updated successfully!");
        console.log("\n📝 Note: You can manually update admin names in the database if needed.\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating admins:", error);
        process.exit(1);
    }
};

updateAdminNames();
