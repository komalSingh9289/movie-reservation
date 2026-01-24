
// Simulate the environment
const now = new Date();
console.log("Current Time (Local):", now.toString());
console.log("Current Time (ISO):", now.toISOString());

// Simulate a show that is "old" (e.g. 1 hour ago)
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
// Format as stored in DB
const dateStr = oneHourAgo.getFullYear() + '-' + String(oneHourAgo.getMonth() + 1).padStart(2, '0') + '-' + String(oneHourAgo.getDate()).padStart(2, '0');
const timeStr = String(oneHourAgo.getHours()).padStart(2, '0') + ':' + String(oneHourAgo.getMinutes()).padStart(2, '0');

console.log(`Mock Old Show: Date=${dateStr}, Time=${timeStr}`);

// Logic from controller
const showDate = dateStr;
const showTime = timeStr;

// Combined string parsing
const showStartTime = new Date(`${showDate}T${showTime}:00`);
console.log("Parsed Show Start Time:", showStartTime.toString());

const isVisible = showStartTime > now;
console.log("Is Visible (Start > Now):", isVisible);

// Case 2: Show is tomorrow
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const tDateStr = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrow.getDate()).padStart(2, '0');
const tTimeStr = "10:00";
console.log(`Mock Future Show: Date=${tDateStr}, Time=${tTimeStr}`);
const tStartTime = new Date(`${tDateStr}T${tTimeStr}:00`);
console.log("Parsed Future Show Start Time:", tStartTime.toString());
console.log("Is Visible:", tStartTime > now);

// Case 3: Show is today, but UTC date string vs Local date string issue?
// If now is 24th Jan 02:00 IST (UTC 23rd Jan 20:30)
// And show is 23rd Jan 10:00 IST.
// UTC Date String for query: now.toISOString().split('T')[0] -> "2026-01-23"
// Query for date >= "2026-01-23". Returns the show.
// Filter: Show(23rd 10:00 IST) vs Now(24th 02:00 IST).
// 23rd < 24th. Should be filtered OUT.

// What if the user is running this?
