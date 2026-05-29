const capitalize = (word) => word && word[0].toUpperCase() + word.slice(1).toLowerCase();

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

export { isPointDataValid, capitalize };

