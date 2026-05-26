import dayjs from 'dayjs';

const MIN_DIFFERENCE_IN_MINUTES = 5;

const pad = (num) => String(num).padStart(2, '0');

const formatToTime = (date) => dayjs(date).format('HH:mm');

const calculateEventDuration = (startDateIso, endDateIso) => {
  const diffMinutes = dayjs(endDateIso).diff(dayjs(startDateIso), 'minutes');

  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  const minutes = diffMinutes % 60;

  const parts = [];
  if (days) {
    parts.push(`${pad(days)}D`);
  }
  if (hours || days) {
    parts.push(`${pad(hours)}H`);
  }
  parts.push(`${pad(minutes)}M`);

  return parts.join(' ');
};

const formatToDateInput = (date) => dayjs(date).format('DD/MM/YY HH:mm');

const isDatesEqual = (pointA, pointB) => {
  const isDateFromSame = dayjs(pointA.dateFrom).isSame(dayjs(pointB.dateFrom));
  const isDateToSame = dayjs(pointA.dateTo).isSame(dayjs(pointB.dateTo));

  return isDateFromSame && isDateToSame;
};

export { calculateEventDuration, formatToDateInput, formatToTime, isDatesEqual, MIN_DIFFERENCE_IN_MINUTES };

