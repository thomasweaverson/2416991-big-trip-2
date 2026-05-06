import AbstractView from '../framework/view/abstract-view';

const createNoPointsTemplate = (message) => `<p class="trip-events__msg">${message}</p>`;

export default class NoPointsView extends AbstractView {

  #message = null;

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return createNoPointsTemplate(this.#message);
  }
}
