import { remove, render, RenderPosition } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { FilterType, Message, SortItem, TimeLimit, UpdateType, UserAction } from '../utils/const.js';
import { filter } from '../utils/filter.js';

import { sortPoints } from '../utils/sort.js';
import MessageView from '../view/message-view.js';
import PointsListView from '../view/points-list-view.js';
import SortView from '../view/sort-view.js';
import NewPointPresenter from './new-point-presenter.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  #tripContainer = null;
  #pointsListComponent = null;
  #loadingComponent = new MessageView({ message: Message.loading });
  #loadingErrorComponent = new MessageView({ message: Message.error });
  #appModel = null;
  #filterModel = null;
  #sortComponent = null;
  #currentSortType = SortItem.DEFAULT.name;
  #noPointsComponent = null;
  #currentFilter = FilterType.EVERYTHING;
  #pointPresenters = new Map();
  #newPointPresenter = null;

  #points = [];
  #newPointButtonComponent = null;
  #isLoading = true;

  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({
    tripContainer,
    appModel,
    filterModel,
    newPointButtonComponent
  }) {
    this.#tripContainer = tripContainer;
    this.#appModel = appModel;
    this.#filterModel = filterModel;
    this.#newPointButtonComponent = newPointButtonComponent;

    this.#appModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#currentFilter = this.#filterModel.filter;
    const points = this.#appModel.points;
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
    this.#newPointButtonComponent.enable();

    if (this.points.length === 0) {
      this.#renderNoPoints();
    }
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#appModel.updatePoint(updateType, update);
          this.#pointPresenters.get(update.id).resetView();
        } catch (error) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#appModel.addPoint(updateType, update);
        } catch (error) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#appModel.deletePoint(updateType, update);
        } catch (error) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
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
          offers: this.#appModel.offers,
          destinations: this.#appModel.destinations,
          onDataChange: this.#handleViewAction,
          onDestroy: this.#newPointDestroyHandler
        });
        this.#renderBoard();
        break;
      case UpdateType.ERROR:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderLoadingError();
        break;
    }
  };

  #renderLoading() {
    render(this.#loadingComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderLoadingError() {
    render(this.#loadingErrorComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
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
    this.#noPointsComponent = new MessageView({
      message: Message[this.#currentFilter]
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
      appModel: this.#appModel,
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
