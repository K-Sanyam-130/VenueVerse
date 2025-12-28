require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./model/User");
const Event = require("./model/Event");

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. List all Clubs
        const clubs = await User.find({ role: "club" });
        console.log("\n--- CLUBS ---");
        clubs.forEach(c => console.log(`ID: ${c._id}, Name: ${c.name}, Email: ${c.email}`));

        // 2. List all Events
        const events = await Event.find({});
        console.log("\n--- EVENTS ---");
        if (events.length === 0) {
            console.log("No events found in DB.");
        } else {
            events.forEach(e => {
                console.log(`ID: ${e._id}, Name: ${e.eventName}, Club: ${e.clubName}, Status: ${e.status}, Published: ${e.isPublished}`);
            });
        }

        // 3. Check for mismatches
        console.log("\n--- ANALYSIS ---");
        for (const club of clubs) {
            const approvedEvents = events.filter(e => e.clubName === club.name && e.status === "APPROVED" && e.isPublished);
            console.log(`Club '${club.name}' has ${approvedEvents.length} APPROVED & PUBLISHED events.`);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error("Error:", err);
        mongoose.connection.close();
    }
};

verifyData();
