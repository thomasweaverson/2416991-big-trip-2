import { remove, render, replace } from '../framework/render';
import FilterView from '../view/filter-view';

export default class FilterPresenter {
  #filterContainer = null;

  #filterComponent = null;

  #appModel = null;
  #filterModel = null;

  constructor({ filterContainer, appModel, filterModel }) {
    this.#filterContainer = filterContainer;
    this.#appModel = appModel;
    this.#filterModel = filterModel;

    this.#appModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  init = () => {
    const prevFilterComponent = this.#filterComponent;
    this.#filterComponent = new FilterView({
      points: this.#appModel.points,
      currentFilter: this.#filterModel.filter,
      onFilterChange: this.#filterTypeChangeHandler
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  };

  #modelEventHandler = () => {
    this.init();
  };

  #filterTypeChangeHandler = (filter) => {
    if (this.#filterModel.filter === filter) {
      return;
    }

    this.#filterModel.filter = filter;
  };
}
