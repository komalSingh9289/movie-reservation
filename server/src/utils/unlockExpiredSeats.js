import Show from "../models/show.js";
import Movie from "../models/movies.js";
import { parseDurationToMs } from "./parseDuration.js";

export const unlockExpiredSeats = async () => {
    try {
        const now = new Date();
        const lockExpiryTime = 5 * 60 * 1000; // 5 minutes

        // Fetch shows that have any non-AVAILABLE seats
        const shows = await Show.find({
            "seats.status": { $in: ["LOCKED", "BOOKED"] }
        }).populate("movie");

        if (shows.length > 0) {
            // console.log(`[Cron] Checking ${shows.length} shows for seat unlocking...`);
        }

        for (const show of shows) {
            let hasChanges = false;

            // 🔹 Show end time calculation
            const showStartTime = new Date(`${show.date}T${show.time}:00`);
            const durationMs = parseDurationToMs(show.movie.duration);
            const showEndTime = new Date(showStartTime.getTime() + durationMs);

            // 🛑 CASE 1: Show finished - Clear ALL seats
            if (now > showEndTime) {
                // console.log(`[Cron] Show finished: ${show.movie.title} at ${show.date} ${show.time}. Clearing all seats.`);
                show.seats.forEach(seat => {
                    if (seat.status !== "AVAILABLE") {
                        seat.status = "AVAILABLE";
                        seat.lockedBy = null;
                        seat.lockedAt = null;
                        hasChanges = true;
                    }
                });
            } else {
                // 🟡 CASE 2: Lock expired
                show.seats.forEach(seat => {
                    if (seat.status === "LOCKED" && seat.lockedAt) {
                        const isExpired =
                            now.getTime() - new Date(seat.lockedAt).getTime() > lockExpiryTime;

                        if (isExpired) {
                            // console.log(`[Cron] Lock expired for seat ${seat.seatId} in show ${show._id}`);
                            seat.status = "AVAILABLE";
                            seat.lockedBy = null;
                            seat.lockedAt = null;
                            hasChanges = true;
                        }
                    }
                });
            }

            if (hasChanges) {
                await show.save();
                console.log(`[Cron] Success: Updated seats for show ${show._id} (${show.movie.title})`);
            }
        }
    } catch (error) {
        console.error("[Cron] Error unlocking seats:", error);
    }
};
