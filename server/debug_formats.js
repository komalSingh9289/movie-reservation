
const now = new Date();
console.log("Current Time (Local):", now.toString());

// Test Case: Single digit month/day
const d1 = "2026-1-23";
const t1 = "10:00";
const dt1 = new Date(`${d1}T${t1}:00`);
console.log(`Test '${d1}T${t1}:00' ->`, dt1.toString());

// Test Case: 12-hour format?
const d2 = "2026-01-23";
const t2 = "01:00 PM";
const dt2 = new Date(`${d2}T${t2}:00`); // Likely invalid or weird
console.log(`Test '${d2}T${t2}:00' ->`, dt2.toString());

// Test Case: Show time is EXACTLY now
const dt3 = new Date();
// Just check basic comparison behavior
console.log("Now > Now?", now > now); // False
console.log("Now >= Now?", now >= now); // True

// Logic check:
// showStartTime > now
// If show is at 18:00. Now is 18:00:01.
// 18:00 > 18:00:01 -> False. Filtered out.
// If show is at 18:00. Now is 17:59.
// 18:00 > 17:59 -> True. Visible.
