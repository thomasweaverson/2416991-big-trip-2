import dayjs from 'dayjs';
import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../utils/const.js';
import { capitalize } from '../utils/utils.js';

const isFilterDisabled = (filterType, points) => {

  const now = dayjs();
  switch (filterType) {
    case FilterType.EVERYTHING:
      return points.length === 0;
    case FilterType.FUTURE:
      return !points.some((point) => dayjs(point.dateFrom).isAfter(now));
    case FilterType.PAST:
      return !points.some((point) => dayjs(point.dateTo).isBefore(now));
    case FilterType.PRESENT:
      return !points.some((point) =>
        (dayjs(point.dateFrom).isBefore(now) || dayjs(point.dateFrom).isSame(now)) && dayjs(point.dateTo).isAfter(now)
      );
    default:
      return false;
  }
};

const createFilterItemTemplate = (filterType, isChecked, points) => `
  <div class="trip-filters__filter">
    <input id="filter-${filterType}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${filterType}" ${isChecked ? 'checked' : ''} ${isFilterDisabled(filterType, points) ? 'disabled' : ''}>
    <label class="trip-filters__filter-label" for="filter-${filterType}">${capitalize(filterType)}</label>
  </div>
`;

const createFilterTemplate = (points, currentFilter) => {
  const filterItems = Object.values(FilterType)
    .map((item) => createFilterItemTemplate(item, item === currentFilter, points))
    .join('\n');

  return `
    <form class="trip-filters" action="#" method="get">
      ${filterItems}

      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
};

export default class FilterView extends AbstractView {
  #points = null;
  #currentFilter = null;
  #handleFilterChange = null;

  constructor({ points, currentFilter, onFilterChange }) {
    super();
    this.#points = points;
    this.#currentFilter = currentFilter;
    this.#handleFilterChange = onFilterChange;

    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#points, this.#currentFilter);
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterChange(evt.target.value);
  };
}
