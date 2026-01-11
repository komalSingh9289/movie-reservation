export const generateSeats = () => {
  const rows = ["A", "B", "C", "D"];
  const seats = [];

  rows.forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
      });
    }
  });

  return seats;
};
