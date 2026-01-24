
const now = new Date();
console.log("Current Time (Local):", now.toString());

// Test Date String
const dateStr = "2026-01-23";
const timeStr = "18:00";

// Old Method
const oldMethodDate = new Date(`${dateStr}T${timeStr}:00`);
console.log("Old Method Parsing:", oldMethodDate.toString());

// New Method
const [year, month, day] = dateStr.split('-').map(Number);
const [hours, minutes] = timeStr.split(':').map(Number);
const newMethodDate = new Date(year, month - 1, day, hours, minutes);
console.log("New Method Parsing:", newMethodDate.toString());

// Comparison
console.log("Are they same?", oldMethodDate.getTime() === newMethodDate.getTime());

if (oldMethodDate.getTime() !== newMethodDate.getTime()) {
    console.log("DIFFERENCE DETECTED! Use new method.");
} else {
    console.log("No difference in parsing (Environment assumes Local for ISO string).");
}

/*
Explanation:
If 'Old Method' assumes UTC, it will print a time offset by timezone.
If 'New Method' produces Local, it will print local time matching inputs.
*/
