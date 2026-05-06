import dayjs from 'dayjs';
import AbstractView from '../framework/view/abstract-view.js';

const createFilterTemplate = (points) => {
  const now = dayjs();
  const hasFutureDates = points.some((point) => dayjs(point.dateFrom).isAfter(now));
  const hasPresentDates = points.some((point) =>
    (dayjs(point.dateFrom).isBefore(now) || dayjs(point.dateFrom).isSame(now)) && dayjs(point.dateTo).isAfter(now)
  );
  const hasPastDates = points.some((point) => dayjs(point.dateTo).isBefore(now));

  return `
    <form class="trip-filters" action="#" method="get">
      <div class="trip-filters__filter">
        <input id="filter-everything" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="everything" checked="">
        <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
      </div>

      <div class="trip-filters__filter">
        <input id="filter-future" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="future" ${hasFutureDates ? '' : 'disabled'}>
        <label class="trip-filters__filter-label" for="filter-future">Future</label>
      </div>

      <div class="trip-filters__filter">
        <input id="filter-present" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="present" ${hasPresentDates ? '' : 'disabled'}>
        <label class="trip-filters__filter-label" for="filter-present">Present</label>
      </div>

      <div class="trip-filters__filter">
        <input id="filter-past" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="past" ${hasPastDates ? '' : 'disabled'}>
        <label class="trip-filters__filter-label" for="filter-past">Past</label>
      </div>

      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
};

export default class FilterView extends AbstractView {
  #points = null;
  constructor(points) {
    super();
    this.#points = points;
  }

  get template() {
    return createFilterTemplate(this.#points);
  }
}
