const today = new Date();
today.setHours(0, 0, 0, 0);

const testDates = [
    { date: "2023-01-01", expected: false, desc: "Past date" },
    { date: today.toISOString().split('T')[0], expected: true, desc: "Today" },
    { date: "2030-01-01", expected: true, desc: "Future date" }
];

console.log("Testing Date Logic:");
console.log("Today is:", today.toDateString());

testDates.forEach(test => {
    const eventDate = new Date(test.date);
    eventDate.setHours(0, 0, 0, 0);

    const isUpcoming = eventDate.getTime() >= today.getTime();
    const passed = isUpcoming === test.expected;

    console.log(`[${passed ? "PASS" : "FAIL"}] ${test.desc} (${test.date}): Is Upcoming? ${isUpcoming}`);
});
