export default class DestinationsModel {
  #destinationsApiService = null;
  #destinations = [];

  constructor({ destinationsApiService }) {
    this.#destinationsApiService = destinationsApiService;
  }

  async init() {
    try {
      const destinations = await this.#destinationsApiService.destinations;
      this.#destinations = destinations;
    } catch (error) {
      this.#destinations = [];
    }
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
