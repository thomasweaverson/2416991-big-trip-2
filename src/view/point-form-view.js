import flatpickr from 'flatpickr';
import he from 'he';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { POINT_TYPES } from '../utils/const.js';
import { formatToDateInput } from '../utils/date.js';
import { capitalize } from '../utils/text.js';

import 'flatpickr/dist/flatpickr.min.css';
import { isPointDataValid } from '../utils/utils.js';

const createTypeItemTemplate = (type, id) => `
  <div class="event__type-item">
    <input id="event-type-${type}-${id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${id}" data-type="${type}">${capitalize(type)}</label>
  </div>
`;

const createTypeListTemplate = (id) => `
  <div class="event__type-list">
    <fieldset class="event__type-group">
      <legend class="visually-hidden">Event type</legend>
      ${POINT_TYPES.map((type) => createTypeItemTemplate(type, id)).join('')}
    </fieldset>
  </div>
`;

const createTypeWrapperTemplate = (type, id) =>
  `
    <div class="event__type-wrapper">
      <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
        <span class="visually-hidden">Choose event type</span>
        <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
      </label>
      <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">

      ${createTypeListTemplate(id)}

    </div>
  `;

const createDestinationInputTemplate = ({
  id,
  type,
  currentDestination,
  destinations
}) => `
        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-${id}">
            ${type}
          </label>

          <input
            class="event__input event__input--destination"
            id="event-destination-${id}"
            type="text"
            name="event-destination"
            value="${he.encode(currentDestination.name)}"
            list="destination-list-${id}"
          >

          <datalist id="destination-list-${id}">
            ${destinations.map((destination) => `<option value="${destination.name}"></option>`).join('')}
          </datalist>
        </div>
      `;

const createDateInterfaceTemplate = (dateFrom, dateTo, id) => `
  <div class="event__field-group  event__field-group--time">
    <label class="visually-hidden" for="event-start-time-${id}">From</label>
    <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${dateFrom ? formatToDateInput(dateFrom) : ''}">
    —
    <label class="visually-hidden" for="event-end-time-${id}">To</label>
    <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${dateTo ? formatToDateInput(dateTo) : ''}">
  </div>
`;

const createPriceTemplate = (basePrice, id) => `
  <div class="event__field-group  event__field-group--price">
    <label class="event__label" for="event-price-${id}">
      <span class="visually-hidden">Price</span>
      €
    </label>
    <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${he.encode(String(basePrice))}">
  </div>
`;

const createButtonTemplate = ({ isResetButton, isNewPoint, isDisabled }) => {
  if (isResetButton) {
    return `
      <button class="event__reset-btn" type="reset">${isNewPoint ? 'Cancel' : 'Delete'}</button>
    `;
  }

  return `
    <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>Save</button>
  `;
};

const createRollupButtonTemplate = () => `
  <button class="event__rollup-btn" type="button">
    <span class="visually-hidden">Open event</span>
  </button>
`;

const createOfferTemplate = (offer, isChecked) => `
  <div class="event__offer-selector">
    <input
      class="event__offer-checkbox visually-hidden"
      id="${offer.id}"
      type="checkbox"
      name="event-offer-${offer.id}"
      ${isChecked ? 'checked' : ''}
      data-offer-id="${offer.id}"
    >
    <label class="event__offer-label" for="${offer.id}">
      <span class="event__offer-title">${offer.title}</span>
      +€&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </label>
  </div>
`;

const createOffersTemplate = (offers, selectedOffersId) => {
  if (offers.length === 0) {
    return '';
  }

  return `
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${offers.map((offer) => createOfferTemplate(offer, selectedOffersId.includes(offer.id))).join('')}
            </div>
          </section>
`;
};

const createPhotoTapeTemplate = (pictures) => {
  if (pictures.length === 0) {
    return '';
  }

  return `
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
      </div>
    </div>
  `;
};

const createDestinationTemplate = (destination) => {
  if (!destination || (!destination.pictures && !destination.description)) {
    return '';
  }

  const descriptionTemplate = destination.description && `
    <p class="event__destination-description">${destination.description}</p>
  `;

  const photoTapeTemplate = destination.pictures && createPhotoTapeTemplate(destination.pictures);

  return `
  <section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    ${descriptionTemplate}
    ${photoTapeTemplate}
  </section>
  `;
};


const createPointFormTemplate = ({
  point,
  offers,
  currentDestination,
  destinations,
  isNewPoint
}) => {

  const {
    basePrice,
    dateFrom,
    dateTo,
    id,
    type,
  } = point;

  const offersOfCurrentType = offers.find((offer) => offer.type === type)?.offers || [];

  const isSubmitDisabled = !isPointDataValid(point, currentDestination, destinations);

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${createTypeWrapperTemplate(type, id)}
          ${createDestinationInputTemplate({ id, type, currentDestination, destinations })}
          ${createDateInterfaceTemplate(dateFrom, dateTo, id)}
          ${createPriceTemplate(basePrice, id)}
          ${createButtonTemplate({ isResetButton: false, isDisabled: isSubmitDisabled })}
          ${createButtonTemplate({ isResetButton: true, isNewPoint })}
          ${!isNewPoint ? createRollupButtonTemplate() : ''}
        </header>
        <section class="event__details">
          ${createOffersTemplate(offersOfCurrentType, point.offers)}
          ${createDestinationTemplate(currentDestination)}
        </section>
      </form>
    </li>
  `;
};

export default class PointFormView extends AbstractStatefulView {
  #offers = null;
  #destinations = null;
  #handleFormSubmit = null;
  #handleFormReset = null;
  #handleRollupClick = null;
  #datepickers = [];
  #isNewPoint = false;

  constructor({
    point,
    offers,
    destinations,
    onFormSubmit,
    onFormReset,
    onRollupClick,
    isNewPoint = false
  }) {
    super();
    this._setState(point);
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormReset = onFormReset;
    this.#handleRollupClick = onRollupClick;
    this.#isNewPoint = isNewPoint;
    this._restoreHandlers();
  }

  get template() {

    return createPointFormTemplate({
      point: this._state,
      offers: this.#offers,
      currentDestination: this.#getCurrentDestination(),
      destinations: this.#destinations,
      isNewPoint: this.#isNewPoint
    });
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickers.length > 0) {
      this.#datepickers.forEach((datepicker) => datepicker.destroy());
      this.#datepickers = [];
    }
  }

  reset(point) {
    this.updateElement(point);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('form').addEventListener('reset', this.#handleFormReset);

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this.#handleRollupClick);
    }

    this.element.querySelector('.event__type-list').addEventListener('click', this.#typeClickHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceChangeHandler);

    const availableOffers = this.element.querySelector('.event__available-offers');
    if (availableOffers) {
      availableOffers.addEventListener('click', this.#offerClickHandler);
    }

    this.#setDatePickers();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this._state);
  };

  #typeClickHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    const type = evt.target.dataset.type;
    if (this._state.type === type) {
      this.updateElement({});
      return;
    }
    this.updateElement({
      type,
      offers: []
    });
  };

  #destinationChangeHandler = (evt) => {
    const destinationName = evt.target.value;
    const destination = this.#destinations.find((item) => item.name === destinationName);

    const destinationId = destination ? destination.id : `id-${destinationName}`;

    this.updateElement({
      destination: destinationId
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate
    });

    this.#datepickers[1].set('minDate', userDate);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate
    });

    this.#datepickers[0].set('maxDate', userDate);
  };

  #setDatePickers() {
    this.#datepickers = [
      flatpickr(this.element.querySelector('.event__input--time[name="event-start-time"]'), {
        enableTime: true,
        'time_24hr': true,
        dateFormat: 'd/m/y H:i',
        maxDate: this._state.dateTo,
        onChange: this.#dateFromChangeHandler
      }),
      flatpickr(this.element.querySelector('.event__input--time[name="event-end-time"]'), {
        enableTime: true,
        'time_24hr': true,
        dateFormat: 'd/m/y H:i',
        minDate: this._state.dateFrom,
        onChange: this.#dateToChangeHandler
      })
    ];
  }

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: evt.target.value
    });

    const submitButton = this.element.querySelector('.event__save-btn');
    const currentDestination = this.#getCurrentDestination();
    const isSubmitDisabled = !isPointDataValid(this._state, currentDestination, this.#destinations);
    submitButton.disabled = isSubmitDisabled;
  };

  #offerClickHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    const offerId = evt.target.dataset.offerId;
    if (this._state.offers.includes(offerId)) {
      this._setState({
        offers: this._state.offers.filter((item) => item !== offerId)
      });
    } else {
      this._setState({
        offers: [...this._state.offers, offerId]
      });
    }
  };

  #getCurrentDestination() {
    const currentDestination = this.#destinations.find((item) => item.id === this._state.destination);
    if (currentDestination) {
      return currentDestination;
    }
    return {
      id: this._state.destination,
      name: this._state.destination.slice(3)
    };
  }
}
