import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(weekday);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const generateDayJs = (date) => {
  if (date) {
    return dayjs(date);
  } else {
    return dayjs();
  }
};
