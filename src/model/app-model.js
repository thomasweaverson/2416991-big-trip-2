import Observable from '../framework/observable';
import { UpdateType } from '../utils/const';

export default class AppModel extends Observable {
  #appApiService = null;
  #points = [];
  #offers = [];
  #destinations = [];

  constructor({ appApiService }) {
    super();
    this.#appApiService = appApiService;
  }

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  getSelectedOffers(type, idList) {
    const offersOfType = this.#getOffersByType(type);
    const selectedOffers = offersOfType.filter((offer) => idList.includes(offer.id));

    return selectedOffers;
  }

  getDestination(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  async init() {
    try {
      await Promise.all([
        this.#loadOffers(),
        this.#loadDestinations(),
        this.#loadPoints(),
      ]);
      this._notify(UpdateType.INIT);
    } catch (error) {
      this._notify(UpdateType.ERROR);
    }
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#appApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType, updatedPoint);
    } catch (error) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#appApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch (error) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    try {
      await this.#appApiService.deletePoint(update);

      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType, update);
    } catch (error) {
      throw new Error('Can\'t delete point');
    }
  }

  async #loadOffers() {
    const offers = await this.#appApiService.offers;
    this.#offers = offers;
  }

  async #loadDestinations() {
    const destinations = await this.#appApiService.destinations;
    this.#destinations = destinations;
  }

  async #loadPoints() {
    const points = await this.#appApiService.points;
    this.#points = points.map(this.#adaptToClient);
  }

  #getOffersByType(type) {
    if (!this.#offers.length) {
      return [];
    }
    return this.#offers.find((offer) => offer.type === type).offers;
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      isFavorite: point.is_favorite,
    };

    delete adaptedPoint.base_price;
    delete adaptedPoint.date_from;
    delete adaptedPoint.date_to;
    delete adaptedPoint.is_favorite;

    return adaptedPoint;
  }
}
