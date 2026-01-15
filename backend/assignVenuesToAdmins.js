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

// Venue assignments for different admin departments
const venueAssignments = {
    // Example assignments - customize based on your actual admins
    "CSEdept@bmsce.ac.in": ["CSE Lab", "CSE Lab 2", "AIML Lab 1"],
    "ISEdept@bmsce.ac.in": ["ISE Lab", "ISE Lab 2"],
    "ECEdept@bmsce.ac.in": ["ECE Lab", "ECE Lab 2"],
    "PGdept@bmsce.ac.in": ["PG Lab First Floor"],
    "admin@venueverse.com": ["Audi 1", "Audi 2", "BSN Hall", "Indoor Stadium"],
};

const assignVenuesByEmail = async () => {
    try {
        const admins = await Admin.find({});

        console.log(`\n📋 Found ${admins.length} admin(s)\n`);

        for (const admin of admins) {
            const assignedVenues = venueAssignments[admin.email] || [];

            if (assignedVenues.length > 0) {
                admin.venues = assignedVenues;
                await admin.save();
                console.log(`✅ ${admin.name || admin.email}:`);
                console.log(`   Assigned ${assignedVenues.length} venue(s): ${assignedVenues.join(", ")}\n`);
            } else {
                console.log(`⏭️  ${admin.name || admin.email}: No venues assigned (Super Admin mode)\n`);
            }
        }

        console.log("\n✅ Venue assignment complete!");
        console.log("\n📝 Notes:");
        console.log("  - Admins with no venues can see ALL events (Super Admin)");
        console.log("  - Admins with venues only see events for their venues");
        console.log("  - You can manually add/remove venues from the Admin Profile page\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error assigning venues:", error);
        process.exit(1);
    }
};

assignVenuesByEmail();
