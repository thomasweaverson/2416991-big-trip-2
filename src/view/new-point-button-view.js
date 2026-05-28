import AbstractView from '../framework/view/abstract-view';

const createNewPointButtonTemplate = () => (
  '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>'
);

export default class NewPointButtonView extends AbstractView {
  #handleClick = null;
  constructor({ onClick }) {
    super();
    this.#handleClick = onClick;

    this.element.addEventListener('click', this.#handleClick);
  }

  enable() {
    this.element.disabled = false;
  }

  disable() {
    this.element.disabled = true;
  }

  get template() {
    return createNewPointButtonTemplate();
  }
}
