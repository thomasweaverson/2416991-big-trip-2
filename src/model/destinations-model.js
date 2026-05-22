import { getMockDestinations } from '../mocks';

const mockDestinations = getMockDestinations();

export default class DestinationsModel {
  #destinations = [...mockDestinations];

  constructor({ destinationsApiService }) {
    destinationsApiService.destinations.then((destinations) => {
      console.log(destinations);
    });
  }

  get destinations() {
    return this.#destinations;
  }

  getDestination(id) {
    const result = this.#destinations.find((destination) => destination.id === id);

    return result ? { ...result } : {
      id: id,
      name: id.slice(3)
    };
  }
}
