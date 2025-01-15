/* eslint-disable @typescript-eslint/no-explicit-any */
export const timeLeft = (paidAtTimestamp: any) => {
  if (paidAtTimestamp === "Not Paid" || paidAtTimestamp == null) {
    return "Not Paid";
  }

  // Convert paidAtTimestamp to milliseconds
  const paidAtTime = paidAtTimestamp * 1000;

  const threeDaysLater = paidAtTime + 259200000;

  const currentTime = Date.now();
  if (currentTime > threeDaysLater) {
    return "Time Elapse";
  }

  const timeDiff = threeDaysLater - currentTime;

  const days = Math.floor(timeDiff / 86400000);
  const hours = Math.floor((timeDiff % 86400000) / 3600000);
  const minutes = Math.floor((timeDiff % 3600000) / 60000);

  return `${String(days).padStart(2, "0")}:${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(2, "0")}`;
};
