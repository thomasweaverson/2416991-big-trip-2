export default class OffersModel {
  #offers = [];
  #offersApiService = null;

  constructor({ offersApiService }) {
    this.#offersApiService = offersApiService;
  }

  async init() {
    try {
      const offers = await this.#offersApiService.offers;
      this.#offers = offers;
    } catch (error) {
      this.#offers = [];
    }
  }

  get offers() {
    return this.#offers;
  }

  getSelectedOffers(type, idList) {
    const offersOfType = this.#getOffersByType(type);
    const selectedOffers = offersOfType.filter((offer) => idList.includes(offer.id));

    return selectedOffers;
  }

  #getOffersByType(type) {
    if (!this.#offers.length) {
      return [];
    }
    return this.#offers.find((offer) => offer.type === type).offers;
  }
}
