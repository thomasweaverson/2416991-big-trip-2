import AbstractView from '../framework/view/abstract-view';

const createTripInfoTemplate = ({ total, duration, title }) => `
  <section class="trip-main__trip-info  trip-info">
    <div class="trip-info__main">

      <h1 class="trip-info__title">${title}</h1>

      <p class="trip-info__dates">${duration}</p>

      </div>

    <p class="trip-info__cost">
      Total: € <span class="trip-info__cost-value">${total}</span>
    </p>
  </section>
`;

export default class TripInfoView extends AbstractView {
  #title = '';
  #duration = '';
  #total = 0;
  constructor({ title, duration, total }) {
    super();
    this.#title = title;
    this.#duration = duration;
    this.#total = total;
  }

  get template() {
    return createTripInfoTemplate({
      total: this.#total,
      duration: this.#duration,
      title: this.#title,
    });
  }
}
