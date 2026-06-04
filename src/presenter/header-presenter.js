import dayjs from 'dayjs';
import { remove, render, RenderPosition, replace } from '../framework/render';
import { UpdateType } from '../utils/const';
import { sortPoints } from '../utils/sort';
import TripInfoView from '../view/trip-info-view';
import FilterPresenter from './filter-presenter';

export default class HeaderPresenter {
  #summaryContainer = null;

  #newPointButtonComponent = null;
  #tripInfoComponent = null;

  #appModel = null;
  #filterModel = null;

  #filterPresenter = null;

  constructor({ summaryContainer, newPointButtonComponent, appModel, filterModel }) {
    this.#summaryContainer = summaryContainer;
    this.#newPointButtonComponent = newPointButtonComponent;
    this.#appModel = appModel;
    this.#filterModel = filterModel;

    this.#filterPresenter = new FilterPresenter({
      filterContainer: summaryContainer.querySelector('.trip-controls__filters'),
      appModel: this.#appModel,
      filterModel: this.#filterModel
    });

    this.#appModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  #init = () => {
    this.#renderTripInfo();
    this.#filterPresenter.init();
  };

  #renderTripInfo = () => {
    const title = this.#getTitle();
    const duration = this.#getDuration();
    const total = this.#getTotalPrice();

    const prevTripInfoComponent = this.#tripInfoComponent;

    if (title && duration && total) {
      this.#tripInfoComponent = new TripInfoView({ title, duration, total });
    } else {
      this.#tripInfoComponent = null;
      remove(prevTripInfoComponent);
      return;
    }

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#summaryContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  };

  #getTitle = () => {
    const sortedPoints = sortPoints(this.#appModel.points);

    const pointsCount = sortedPoints.length;

    if (pointsCount === 0) {
      return '';
    }

    if (pointsCount === 1) {
      const destination = this.#appModel.getDestination(sortedPoints[0].destination);
      return destination.name;
    }
    const startDestination = this.#appModel.getDestination(sortedPoints[0].destination);
    const endDestination = this.#appModel.getDestination(sortedPoints[sortedPoints.length - 1].destination);

    if (pointsCount === 2) {
      return `${startDestination.name} — ${endDestination.name}`;
    }

    if (pointsCount === 3) {
      const middleDestination = this.#appModel.getDestination(sortedPoints[1].destination);
      return `${startDestination.name} — ${middleDestination.name} — ${endDestination.name}`;
    }

    return `${startDestination.name} — ... — ${endDestination.name}`;
  };

  #getDuration = () => {
    const sortedPoints = sortPoints(this.#appModel.points);

    if (sortedPoints.length === 0) {
      return '';
    }

    const startDate = dayjs(sortedPoints[0].dateFrom);
    const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateTo);

    const isSameDay = startDate.isSame(endDate, 'day');

    if (isSameDay) {
      return startDate.format('D MMM');
    }

    const isSameYear = startDate.isSame(endDate, 'year');

    if (isSameYear) {
      return `${startDate.format('D MMM')} — ${endDate.format('D MMM')}`;
    }

    return `${startDate.format('D MMM YYYY')} — ${endDate.format('D MMM YYYY')}`;
  };

  #getTotalPrice = () => {
    const points = [...this.#appModel.points];

    const basePriceSum = points.reduce((acc, point) => acc + point.basePrice, 0);

    let offersSum = 0;

    points.forEach((point) => {
      const selectedOffers = this.#appModel.getSelectedOffers(point.type, point.offers);
      offersSum += selectedOffers.reduce((acc, offer) => acc + offer.price, 0);
    });

    return basePriceSum + offersSum;
  };

  #modelEventHandler = (updateType) => {
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
      case UpdateType.ERROR:
        render(this.#newPointButtonComponent, this.#summaryContainer, RenderPosition.BEFOREEND);
        this.#newPointButtonComponent.disable();
        this.#filterPresenter.init();
        break;
    }
  };
}
