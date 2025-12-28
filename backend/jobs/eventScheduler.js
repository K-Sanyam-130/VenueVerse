const cron = require("node-cron");
const Event = require("../model/Event");

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 🕛 Runs every day at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🕛 Running daily event scheduler...");

    const today = normalizeDate(new Date());

    // 🔴 DELETE past events
    const deleteResult = await Event.deleteMany({
      status: "APPROVED",
      date: { $lt: today }
    });

    console.log(`🗑️ Deleted ${deleteResult.deletedCount} past events`);

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

  } catch (err) {
    console.error("❌ Event scheduler error:", err);
  }
});

module.exports = {};
