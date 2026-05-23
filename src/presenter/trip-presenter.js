import { remove, render, RenderPosition } from '../framework/render.js';
import { FilterType, SortItem, UpdateType, UserAction } from '../utils/const.js';
import { filter } from '../utils/filter.js';

import { sortPoints } from '../utils/sort.js';
import LoadingView from '../view/loading-view.js';
import NoPointsView from '../view/no-points-view.js';
import PointsListView from '../view/points-list-view.js';
import SortView from '../view/sort-view.js';
import NewPointPresenter from './new-point-presenter.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  #tripContainer = null;
  #pointsListComponent = null;
  #loadingComponent = new LoadingView();
  #offersModel = null;
  #destinationsModel = null;
  #pointsModel = null;
  #newPointModel = null;
  #filterModel = null;
  #sortComponent = null;
  #currentSortType = SortItem.DEFAULT.name;
  #noPointsComponent = null;
  #currentFilter = FilterType.EVERYTHING;
  #pointPresenters = new Map();
  #newPointPresenter = null;

  #points = [];
  #handleNewPointDestroy = null;
  #isLoading = true;

  constructor({
    tripContainer,
    offersModel,
    destinationsModel,
    pointsModel,
    filterModel,
    onNewPointDestroy
  }) {
    this.#tripContainer = tripContainer;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#handleNewPointDestroy = onNewPointDestroy;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#currentFilter = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#currentFilter](points);
    return sortPoints(filteredPoints, this.#currentSortType);
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortItem.DEFAULT.name;
    this.#filterModel.filter = FilterType.EVERYTHING;

    if (this.points.length === 0) {
      if (this.#noPointsComponent) {
        remove(this.#noPointsComponent);
      }
      this.#renderPointsList();
    }

    this.#newPointPresenter.init(this.#pointsListComponent.element);
  }

  #newPointDestroyHandler = () => {
    this.#handleNewPointDestroy();

    if (this.points.length === 0) {
      this.#renderNoPoints();
    }
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({
          resetSortType: true
        });
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#newPointPresenter = new NewPointPresenter({
          offers: this.#offersModel.offers,
          destinations: this.#destinationsModel.destinations,
          onDataChange: this.#handleViewAction,
          onDestroy: this.#newPointDestroyHandler
        });
        this.#renderBoard();
        break;
    }
  };

  #renderLoading() {
    render(this.#loadingComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;

    this.#clearPoints();
    this.#renderPoints();
  };

  #renderNoPoints() {
    this.#noPointsComponent = new NoPointsView({
      currentFilter: this.#currentFilter
    });
    render(this.#noPointsComponent, this.#tripContainer);
  }

  #renderPointsList() {
    const previousPointsListComponent = this.#pointsListComponent;
    this.#pointsListComponent = new PointsListView();

    if (previousPointsListComponent !== null) {
      remove(previousPointsListComponent);
    }

    render(this.#pointsListComponent, this.#tripContainer);
  }

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointsListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderPoints() {
    this.points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderPointsList();
    this.#renderPoints();
  }

  #clearPoints() {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#clearPoints();
    remove(this.#sortComponent);
    remove(this.#pointsListComponent);

    if (resetSortType) {
      this.#currentSortType = SortItem.DEFAULT.name;
    }

    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
    }
  }
}
