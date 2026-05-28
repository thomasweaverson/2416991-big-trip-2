import dayjs from 'dayjs';
import { remove, render, RenderPosition, replace } from '../framework/render';
import { sortPoints } from '../utils/sort';
import TripInfoView from '../view/trip-info-view';
import FilterPresenter from './filter-presenter';
import { UpdateType } from '../utils/const';

export default class HeaderPresenter {
  #summaryContainer = null;
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #filterModel = null;
  #filterPresenter = null;
  #newPointButtonComponent = null;
  #tripInfoComponent = null;

  constructor({ summaryContainer, pointsModel, offersModel, destinationsModel, filterModel, newPointButtonComponent }) {
    this.#summaryContainer = summaryContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterModel = filterModel;
    this.#newPointButtonComponent = newPointButtonComponent;

    this.#filterPresenter = new FilterPresenter({
      filterContainer: summaryContainer.querySelector('.trip-controls__filters'),
      pointsModel: this.#pointsModel,
      filterModel: this.#filterModel
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  #init() {
    this.#renderTripInfo();
    this.#filterPresenter.init();
  }

  #handleModelEvent = (updateType) => {
    switch (updateType) {
      case UpdateType.PATCH:
      case UpdateType.MINOR:
      case UpdateType.MAJOR:
        this.#init();
        break;
      case UpdateType.INIT:
        this.#init();
        render(this.#newPointButtonComponent, this.#summaryContainer, RenderPosition.BEFOREEND);
        break;
    }
  };

  #renderTripInfo() {
    const title = this.#getTitle();
    const duration = this.#getDuration();
    const total = this.#getTotalPrice();

    const prevTripInfoComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({ title, duration, total });

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#summaryContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #getTitle() {
    const sortedPoints = sortPoints(this.#pointsModel.points);

    const pointsCount = sortedPoints.length;

    if (pointsCount === 1) {
      const destination = this.#destinationsModel.getDestination(sortedPoints[0].destination);
      return destination.name;
    }
    const startDestination = this.#destinationsModel.getDestination(sortedPoints[0].destination);
    const endDestination = this.#destinationsModel.getDestination(sortedPoints[sortedPoints.length - 1].destination);

    if (pointsCount === 2) {
      return `${startDestination.name} — ${endDestination.name}`;
    }

    if (pointsCount === 3) {
      const middleDestination = this.#destinationsModel.getDestination(sortedPoints[1].destination);
      return `${startDestination.name} — ${middleDestination.name} — ${endDestination.name}`;
    }

    return `${startDestination.name} — ... — ${endDestination.name}`;
  }

  #getDuration() {
    const sortedPoints = sortPoints(this.#pointsModel.points);
    const startDate = dayjs(sortedPoints[0].dateFrom);
    const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateTo);

    const isSameDay = startDate.isSame(endDate, 'day');

    if (isSameDay) {
      return startDate.format('D MMM');
    }

    const isSameMonth = startDate.isSame(endDate, 'month');

    if (isSameMonth) {
      return `${startDate.format('D')} — ${endDate.format('D MMM')}`;
    }

    const isSameYear = startDate.isSame(endDate, 'year');

    if (isSameYear) {
      return `${startDate.format('D MMM')} — ${endDate.format('D MMM')}`;
    }

    return `${startDate.format('D MMM YYYY')} — ${endDate.format('D MMM YYYY')}`;
  }

  #getTotalPrice() {
    const points = [...this.#pointsModel.points];

    const basePriceSum = points.reduce((acc, point) => acc + point.basePrice, 0);

    let offersSum = 0;

    points.forEach((point) => {
      const selectedOffers = this.#offersModel.getSelectedOffers(point.type, point.offers);
      offersSum += selectedOffers.reduce((acc, offer) => acc + offer.price, 0);
    });

    return basePriceSum + offersSum;
  }
}
