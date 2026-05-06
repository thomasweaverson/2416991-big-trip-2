import { render } from '../framework/render';
import FilterView from '../view/filter-view';

export default class FilterPresenter {
  #pointsModel = null;
  #filterContainer = null;
  constructor({ filterContainer, pointsModel }) {
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    render(new FilterView(this.#pointsModel.points), this.#filterContainer);
  }
}
