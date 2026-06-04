import AbstractView from '../framework/view/abstract-view';

const createNewPointButtonTemplate = () => (
  '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>'
);

export default class NewPointButtonView extends AbstractView {
  #clickHandler = null;

  constructor({ onClick }) {
    super();
    this.#clickHandler = onClick;

    this.element.addEventListener('click', this.#clickHandler);
  }

  get template() {
    return createNewPointButtonTemplate();
  }

  enable = () => {
    this.element.disabled = false;
  };

  disable = () => {
    this.element.disabled = true;
  };

}
