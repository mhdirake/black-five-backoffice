import moment from "moment";
import momentTz from "moment-timezone";

export const getTimeFromNow = (date) => {
  if (!date || !moment.isMoment(date)) return "";

  const iranNow = momentTz.tz("Asia/Tehran");
  const target = momentTz.tz(date.format("YYYY-MM-DD HH:mm:ss"), "Asia/Tehran");
  const duration = moment.duration(target.diff(iranNow));

  const totalMinutes = Math.floor(duration.asMinutes());
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes <= 0) return "زمان گذشته";
  if (days > 0) return `${days} روز و ${hours} ساعت دیگر`;
  if (hours > 0) return `${hours} ساعت و ${minutes} دقیقه دیگر`;
  return `${minutes} دقیقه دیگر`;
};
