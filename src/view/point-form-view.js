import flatpickr from 'flatpickr';
import he from 'he';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { BLANK_DESTINATION, POINT_TYPES } from '../utils/const.js';
import { formatToDateInput, MIN_DIFFERENCE_IN_MINUTES } from '../utils/date.js';
import { capitalize } from '../utils/utils.js';

import 'flatpickr/dist/flatpickr.min.css';
import { createElement, RenderPosition } from '../framework/render.js';
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
            autocomplete="off"
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

const createButtonTemplate = ({ isResetButton, isNewPoint, isDisabled, isSaving, isDeleting }) => {
  let resetButtonText = 'Cancel';

  if (!isNewPoint) {
    resetButtonText = isDeleting ? 'Deleting...' : 'Delete';
  }

  const submitButtonText = isSaving ? 'Saving...' : 'Save';

  if (isResetButton) {
    return `
      <button class="event__reset-btn" type="reset">${resetButtonText}</button>
    `;
  }

  return `
    <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${submitButtonText}</button>
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
  if (!destination || (!destination.pictures.length && !destination.description)) {
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
    isDisabled,
    offers: selectedOffersId,
    isSaving,
    isDeleting
  } = point;

  const offersOfCurrentType = offers.find((offer) => offer.type === type)?.offers || [];

  const isValid = isPointDataValid(point, currentDestination, destinations);
  const calculatedDisabled = isDisabled || !isValid;

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${createTypeWrapperTemplate(type, id)}
          ${createDestinationInputTemplate({ id, type, currentDestination, destinations })}
          ${createDateInterfaceTemplate(dateFrom, dateTo, id)}
          ${createPriceTemplate(basePrice, id)}
          ${createButtonTemplate({ isResetButton: false, isDisabled: calculatedDisabled, isSaving, isDeleting, isNewPoint })}
          ${createButtonTemplate({ isResetButton: true, isNewPoint, isSaving, isDeleting })}
          ${!isNewPoint ? createRollupButtonTemplate() : ''}
        </header>
        <section class="event__details">
          ${createOffersTemplate(offersOfCurrentType, selectedOffersId)}
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

  #datePickers = [];
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
    this._setState(PointFormView.parsePointToState(point));
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
      isNewPoint: this.#isNewPoint,
    });
  }

  removeElement = () => {
    super.removeElement();

    if (this.#datePickers.length > 0) {
      this.#datePickers.forEach((datePicker) => datePicker.destroy());
      this.#datePickers = [];
    }
  };

  reset = (point) => {
    this.updateElement(point);
  };

  _restoreHandlers = () => {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('form').addEventListener('reset', this.#formResetHandler);

    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this.#rollupClickHandler);
    }

    this.element.querySelector('.event__type-list').addEventListener('click', this.#typeClickHandler);
    this.element.querySelector('.event__input--destination').addEventListener('input', this.#destinationInputHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceChangeHandler);

    const availableOffers = this.element.querySelector('.event__available-offers');
    if (availableOffers) {
      availableOffers.addEventListener('click', this.#offerClickHandler);
    }

    this.#setDatePickers();
  };

  #setDatePickers = () => {
    let maxDate;
    if (this._state.dateTo) {
      maxDate = new Date(this._state.dateTo);
      maxDate.setMinutes(maxDate.getMinutes() - MIN_DIFFERENCE_IN_MINUTES);
    }

    let minDate;
    if (this._state.dateFrom) {
      minDate = new Date(this._state.dateFrom);
      minDate.setMinutes(minDate.getMinutes() + MIN_DIFFERENCE_IN_MINUTES);
    }

    this.#datePickers = [
      flatpickr(this.element.querySelector('.event__input--time[name="event-start-time"]'), {
        enableTime: true,
        'time_24hr': true,
        dateFormat: 'd/m/y H:i',
        maxDate: maxDate,
        onChange: this.#dateFromChangeHandler
      }),
      flatpickr(this.element.querySelector('.event__input--time[name="event-end-time"]'), {
        enableTime: true,
        'time_24hr': true,
        dateFormat: 'd/m/y H:i',
        minDate: minDate,
        onChange: this.#dateToChangeHandler
      })
    ];
  };

  #setDisableStateSubmitButton = () => {
    const submitButton = this.element.querySelector('.event__save-btn');
    const currentDestination = this.#getCurrentDestination();
    const isSubmitDisabled = !isPointDataValid(this._state, currentDestination, this.#destinations);
    const isFormDisabled = this._state.isDisabled;

    submitButton.disabled = isSubmitDisabled || isFormDisabled;
  };

  #getCurrentDestination = () => {
    const currentDestination = this.#destinations.find((item) => item.id === this._state.destination);
    if (currentDestination) {
      return currentDestination;
    }

    return {
      ...BLANK_DESTINATION,
    };
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(PointFormView.parseStateToPoint(this._state));
  };

  #formResetHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormReset();
  };

  #rollupClickHandler = () => {
    this.#handleRollupClick();
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

  #destinationInputHandler = (evt) => {
    evt.preventDefault();
    const destinationName = evt.target.value;

    const destination = this.#destinations.find((item) => item.name === destinationName);

    if (!destination) {
      const destinationContainer = this.element.querySelector('.event__section--destination');
      destinationContainer?.remove();
      this._setState({
        destination: null
      });
    } else {
      this._setState({
        destination: destination.id
      });
      const destinationsTemplate = createDestinationTemplate(destination);
      const destinationsElement = createElement(destinationsTemplate);

      const pointDetailsContainer = this.element.querySelector('.event__details');

      if (destinationsElement) {
        pointDetailsContainer.insertAdjacentElement(RenderPosition.BEFOREEND, destinationsElement);
      }
    }
    this.#setDisableStateSubmitButton();
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate
    });

    const minDate = new Date(userDate);
    minDate.setMinutes(minDate.getMinutes() + MIN_DIFFERENCE_IN_MINUTES);

    this.#datePickers[1].set('minDate', minDate);
    this.#setDisableStateSubmitButton();
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate
    });

    const maxDate = new Date(userDate);
    maxDate.setMinutes(maxDate.getMinutes() - MIN_DIFFERENCE_IN_MINUTES);

    this.#datePickers[0].set('maxDate', maxDate);
    this.#setDisableStateSubmitButton();
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: evt.target.value
    });

    this.#setDisableStateSubmitButton();
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

  static parsePointToState = (point) => ({
    ...point,
    isDisabled: false,
    isSaving: false,
    isDeleting: false
  });

  static parseStateToPoint = (state) => {
    const point = { ...state };

    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  };
}
