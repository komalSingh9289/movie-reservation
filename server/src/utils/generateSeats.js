export const generateSeats = (layout) => {
  const seats = [];

  layout.rows.forEach(row => {
    // ✅ correct way to read from Map
    const seatType = layout.seatTypes?.get(row) || "SILVER";

    for (let i = 1; i <= layout.cols; i++) {
      seats.push({
        seatId: `${row}${i}`,
        status: "AVAILABLE",
        type: seatType
      });
    }
  });

  return seats;
};
