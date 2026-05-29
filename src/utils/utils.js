const capitalize = (word) => word && word[0].toUpperCase() + word.slice(1).toLowerCase();

const MAX_PRICE = 100000;

const isCorrectNumber = (value) =>
  !isNaN(+value) && value !== '' &&
  String(+value) === String(value) &&
  Number.isInteger(+value);

const isPointDataValid = (point, destination, destinations) => {
  const isBasePriceValid = isCorrectNumber(point.basePrice) && point.basePrice > 0 && point.basePrice <= MAX_PRICE;
  const isDestinationValid =
    destinations.some((destinationItem) => destinationItem.id === destination.id) &&
    destinations.some((destinationItem) => destinationItem.id === point.destination);

  return isBasePriceValid && isDestinationValid;
};

export { capitalize, isPointDataValid };

