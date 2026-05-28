import { remove, render, replace } from '../framework/render';
import FilterView from '../view/filter-view';

export default class FilterPresenter {
  #filterContainer = null;
  #appModel = null;
  #filterModel = null;
  #filterComponent = null;

  constructor({ filterContainer, appModel, filterModel }) {
    this.#filterContainer = filterContainer;
    this.#appModel = appModel;
    this.#filterModel = filterModel;
  }

  init({ isLoadingError = false } = {}) {
    const prevFilterComponent = this.#filterComponent;
    this.#filterComponent = new FilterView({
      points: this.#appModel.points,
      currentFilter: this.#filterModel.filter,
      onFilterChange: this.#handleFilterTypeChange,
      isLoadingError
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
