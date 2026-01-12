export const generateSeats = (capacity = 40) => {
  const seats = [];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = 10;

  const totalRows = Math.ceil(capacity / seatsPerRow);

  for (let r = 0; r < totalRows; r++) {
    const rowLetter = rows[r] || `Row-${r + 1}`;
    for (let s = 1; s <= seatsPerRow; s++) {
      if (seats.length >= capacity) break;
      seats.push({
        seatNumber: `${rowLetter}${s}`,
      });
    }
  }

  return seats;
};
