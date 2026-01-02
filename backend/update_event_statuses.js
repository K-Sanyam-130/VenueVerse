const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Event = require("./model/Event");

dotenv.config();

const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const updateEventStatuses = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const today = normalizeDate(new Date());
        console.log("📅 Today's date:", today);

        // 🟤 MARK past events as PAST
        const pastResult = await Event.updateMany(
            {
                status: "APPROVED",
                date: { $lt: today }
            },
            { $set: { eventType: "PAST" } }
        );
        console.log(`🟤 PAST events updated: ${pastResult.modifiedCount}`);

        // 🟢 SET LIVE for today's events
        const liveResult = await Event.updateMany(
            {
                status: "APPROVED",
                date: today
            },
            { $set: { eventType: "LIVE" } }
        );
        console.log(`🔴 LIVE events updated: ${liveResult.modifiedCount}`);

        // 🔵 SET UPCOMING for future events
        const upcomingResult = await Event.updateMany(
            {
                status: "APPROVED",
                date: { $gt: today }
            },
            { $set: { eventType: "UPCOMING" } }
        );
        console.log(`🔵 UPCOMING events updated: ${upcomingResult.modifiedCount}`);

        console.log("\n✅ Event statuses updated successfully!");
        console.log(`Total updated: ${pastResult.modifiedCount + liveResult.modifiedCount + upcomingResult.modifiedCount} events`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating events:", err);
        process.exit(1);
    }
};

updateEventStatuses();
