import { render } from '../render.js';
import NewPointFormView from '../view/new-point-form-view.js';
import PointView from '../view/point-view.js';
import PointsListView from '../view/points-list-view.js';
import SortView from '../view/sort-view.js';

export default class TripPresenter {
  pointsListComponent = new PointsListView();

  constructor({tripContainer}) {
    this.tripContainer = tripContainer;
  }

  init() {
    render(new SortView(), this.tripContainer);
    render(this.pointsListComponent, this.tripContainer);
    render(new NewPointFormView(), this.pointsListComponent.getElement());

    for (let i = 0; i < 3; i++) {
      render(new PointView(), this.pointsListComponent.getElement());
    }
  }
}
