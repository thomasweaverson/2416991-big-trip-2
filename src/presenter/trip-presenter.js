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

  #messageComponent = null;

  #appModel = null;
  #filterModel = null;
  #sortComponent = null;
  #currentSortType = SortItem.DEFAULT.name;
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
      if (this.#messageComponent) {
        remove(this.#messageComponent);
        this.#messageComponent = null;
      }
      this.#renderPointsList();
    }

    this.#newPointPresenter = new NewPointPresenter({
      offers: this.#appModel.offers,
      destinations: this.#appModel.destinations,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#newPointDestroyHandler
    });

    this.#newPointPresenter.init(this.#pointsListComponent.element);
  }

  #newPointDestroyHandler = () => {

    this.#newPointButtonComponent.enable();
    this.#newPointPresenter = null;
    if (this.points.length === 0) {
      this.#renderBoard();
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
        this.#renderBoard();
        break;
      case UpdateType.ERROR:
        this.#isLoading = false;
        this.#renderMessage(Message.error);
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;

    this.#clearPoints();
    this.#renderPoints();
  };

  #renderSort() {

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);

  }

  #handleModeChange = () => {
    if (this.#newPointPresenter !== null) {
      this.#newPointPresenter.destroy();
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderPointsList() {
    const previousPointsListComponent = this.#pointsListComponent;
    this.#pointsListComponent = new PointsListView();

    if (previousPointsListComponent !== null) {
      remove(previousPointsListComponent);
    }

    render(this.#pointsListComponent, this.#tripContainer);
  }

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

  #renderMessage(message) {
    this.#clearBoard();
    this.#messageComponent = new MessageView({ message });
    render(this.#messageComponent, this.#tripContainer);
  }

  #clearMessage() {
    if (this.#messageComponent) {
      remove(this.#messageComponent);
    }
    this.#messageComponent = null;
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderMessage(Message.loading);
      return;
    }

    if (this.points.length === 0 && this.#newPointPresenter === null) {
      this.#renderMessage(Message[this.#currentFilter]);
      return;
    }

    this.#clearMessage();

    if (this.#sortComponent === null) {
      this.#renderSort();
    }
    this.#renderPointsList();
    this.#renderPoints();
  }

  #clearPoints() {
    if (this.#newPointPresenter) {
      const previousNewPointPresenter = this.#newPointPresenter;
      this.#newPointPresenter = null;
      previousNewPointPresenter.destroy();
    }
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#clearMessage();
    this.#clearPoints();
    remove(this.#sortComponent);
    this.#sortComponent = null;
    remove(this.#pointsListComponent);
    this.#pointsListComponent = null;

    if (resetSortType) {
      this.#currentSortType = SortItem.DEFAULT.name;
    }
  }
}
