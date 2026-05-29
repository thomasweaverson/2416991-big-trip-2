import dayjs from 'dayjs';
import AbstractView from '../framework/view/abstract-view.js';
import { calculateEventDuration, formatToTime } from '../utils/date.js';
import { capitalize } from '../utils/utils.js';

const createOfferTemplate = ({ title, price }) => (
  `
    <li class="event__offer">
      <span class="event__offer-title">${title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${price}</span>
    </li>
  `
);

const createPointTemplate = ({ point, destination, selectedOffers }) => {
  const { type, dateFrom, dateTo, basePrice, isFavorite } = point;
  const dateTimeFrom = dayjs(dateFrom).format('YYYY-MM-DD');
  const dateHumanFromMonthDay = dayjs(dateFrom).format('MMM DD');
  const scheduleTimeFrom = formatToTime(dateFrom);
  const scheduleTimeTo = formatToTime(dateTo);

  const eventDuration = calculateEventDuration(dateFrom, dateTo);

  const selectedOffersTemplate = selectedOffers ? selectedOffers.map((item) => createOfferTemplate(item)).join('\n') : '';

  return `
  <li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${dateTimeFrom}">${dateHumanFromMonthDay}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon - ${type}">
      </div>
      <h3 class="event__title">${capitalize(type)} ${destination.name}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${dateFrom}">${scheduleTimeFrom}</time>
          —
          <time class="event__end-time" datetime="${dateTo}">${scheduleTimeTo}</time>
        </p>
        <p class="event__duration">${eventDuration}</p>
      </div>
      <p class="event__price">
        €&nbsp;<span class="event__price-value">${basePrice}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${selectedOffersTemplate}
      </ul>
      <button class="event__favorite-btn  ${isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"></path>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>
  `;
};

export default class PointView extends AbstractView {
  #point = null;
  #destination = null;
  #selectedOffers = null;
  #handleRollupClick = null;
  #handleFavoriteClick = null;

  constructor({ point, destination, selectedOffers, onRollupClick, onFavoriteClick }) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#selectedOffers = selectedOffers;
    this.#handleRollupClick = onRollupClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollupClickHandler);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createPointTemplate({
      point: this.#point,
      destination: this.#destination,
      selectedOffers: this.#selectedOffers
    });
  }

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };

  #rollupClickHandler = () => {
    this.#handleRollupClick();
  };
}
