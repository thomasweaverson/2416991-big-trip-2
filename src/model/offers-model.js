import { getMockOffers } from '../mocks';

const mockOffers = getMockOffers();

export default class OffersModel {
  #offers = [...mockOffers];

  constructor({ offersApiService }) {
    offersApiService.offers.then((offers) => {
      console.log(offers);
    });
  }

  get offers() {
    return this.#offers;
  }

  getOffersByType(type) {
    return this.#offers.find((offer) => offer.type === type).offers;
  }

  getSelectedOffers(type, idList) {
    const offersOfType = this.getOffersByType(type);
    const selectedOffers = offersOfType.filter((offer) => idList.includes(offer.id));

    return selectedOffers;
  }
}
