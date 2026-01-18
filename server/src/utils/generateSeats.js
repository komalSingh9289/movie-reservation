export const generateSeats = (layout) => {
  const seats = [];

  layout.rows.forEach(row => {
    for (let i = 1; i <= layout.cols; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        status: "available"
      });
    }
  });

  return seats;
};
