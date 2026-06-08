import dayjs from 'dayjs';

const MAX_PRICE = 100000;

const capitalize = (word) => word && word[0].toUpperCase() + word.slice(1).toLowerCase();

const isCorrectNumber = (value) =>
  !isNaN(+value) && value !== '' &&
  String(+value) === String(value) &&
  Number.isInteger(+value);

const isPointDataValid = (point, destination, destinations) => {
  const isBasePriceValid = isCorrectNumber(point.basePrice) && point.basePrice > 0 && point.basePrice <= MAX_PRICE;

  const isDestinationValid =
    destinations.some((destinationItem) => destinationItem.id === destination.id) &&
    destinations.some((destinationItem) => destinationItem.id === point.destination);

  const isDateToValid = dayjs(point.dateTo).isValid();
  const isDateFromValid = dayjs(point.dateFrom).isValid();
  const isDateValid = isDateToValid && isDateFromValid && dayjs(point.dateTo).isAfter(dayjs(point.dateFrom));

  return isBasePriceValid && isDestinationValid && isDateValid;
};

export { capitalize, isPointDataValid };

