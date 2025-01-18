/* eslint-disable @typescript-eslint/no-explicit-any */
export const timeLeft = (paidAtTimestamp: any, extra: number = 0) => {
  if (paidAtTimestamp === "Not Paid" || paidAtTimestamp == null) {
    return "-";
  }

  const paidAtTime = paidAtTimestamp * 1000;

  const threeDaysLater = paidAtTime + extra;

  const currentTime = Date.now();
  if (currentTime > threeDaysLater) {
    return "Time Elapsed";
  }

  const timeDiff = threeDaysLater - currentTime;

  const days = Math.floor(timeDiff / 86400000);
  const hours = Math.floor((timeDiff % 86400000) / 3600000);
  const minutes = Math.floor((timeDiff % 3600000) / 60000);
  const seconds = Math.floor((timeDiff % 60000) / 1000);

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(
    2,
    "0"
  )}s`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const forHoldPeriod = (holdPeriodTime: any) => {
  if (holdPeriodTime === "Not Paid" || holdPeriodTime == null) {
    return "-";
  }

  const paidAtTime = holdPeriodTime * 1000;

  const currentTime = Date.now();
  if (currentTime > paidAtTime) {
    return "Time Elapsed";
  }

  const timeDiff = paidAtTime - currentTime;

  const days = Math.floor(timeDiff / 86400000);
  const hours = Math.floor((timeDiff % 86400000) / 3600000);
  const minutes = Math.floor((timeDiff % 3600000) / 60000);
  const seconds = Math.floor((timeDiff % 60000) / 1000);

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(
    2,
    "0"
  )}s`;
};
