import { remove, render, replace } from '../framework/render';
import FilterView from '../view/filter-view';

export default class FilterPresenter {
  #filterContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #filterComponent = null;

  constructor({ filterContainer, pointsModel, filterModel }) {
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
  }

  init() {
    const prevFilterComponent = this.#filterComponent;
    this.#filterComponent = new FilterView({
      points: this.#pointsModel.points,
      currentFilter: this.#filterModel.filter,
      onFilterChange: this.#handleFilterTypeChange
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.filter = filterType;
  };
}
