import AbstractView from '../framework/view/abstract-view.js';

const createMessageTemplate = (message) => `<p class="trip-events__msg">${message}</p>`;

export default class MessageView extends AbstractView {
  #message = '';
  constructor({ message }) {
    super();
    this.#message = message;
  }

  get template() {
    return createMessageTemplate(this.#message);
  }
}
