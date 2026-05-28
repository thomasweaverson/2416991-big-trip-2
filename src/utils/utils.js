import { isDatesEqual } from './date';

const capitalize = (word) => word && word[0].toUpperCase() + word.slice(1).toLowerCase();

const isPointsEqual = (pointA, pointB) => {

  const isBasePriceEqual = pointA.basePrice === pointB.basePrice;
  const isDatesSame = isDatesEqual(pointA, pointB);

  const isDestinationEqual = pointA.destination === pointB.destination;
  const isFavoriteEqual = pointA.isFavorite === pointB.isFavorite;
  const isOffersEqual = pointA.offers.length === pointB.offers.length && pointA.offers.every((offer) => pointB.offers.includes(offer));
  const isTypeEqual = pointA.type === pointB.type;

  return isBasePriceEqual && isDatesSame && isDestinationEqual && isFavoriteEqual && isOffersEqual && isTypeEqual;
};

const isCorrectNumber = (value) =>
  !isNaN(+value) && value !== '' &&
  String(+value) === String(value) &&
  Number.isInteger(+value);

const isPointDataValid = (point, destination, destinations) => {
  const isBasePriceValid = isCorrectNumber(point.basePrice) && point.basePrice > 0 && point.basePrice <= 100000;
  const isDestinationValid =
    destinations.some((destinationItem) => destinationItem.id === destination.id) &&
    destinations.some((destinationItem) => destinationItem.id === point.destination);

  return isBasePriceValid && isDestinationValid;
};

export { isPointDataValid, isPointsEqual, capitalize };

