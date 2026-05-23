import DestinationsApiService from './api/destinations-api-service.js';
import OffersApiService from './api/offers-api-service.js';
import PointsApiService from './api/points-api-service.js';
import { render } from './framework/render.js';
import DestinationsModel from './model/destinations-model.js';
import FilterModel from './model/filter-model.js';
import OffersModel from './model/offers-model.js';
import PointsModel from './model/points-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import { AUTHORIZATION, BASE_URL } from './utils/api.js';
import NewPointButtonView from './view/new-point-button-view.js';

const filterContainer = document.querySelector('.trip-controls__filters');
const mainContainer = document.querySelector('.trip-main');
const tripContainer = document.querySelector('.trip-events');

const filterModel = new FilterModel();
const offersModel = new OffersModel({
  offersApiService: new OffersApiService(BASE_URL, AUTHORIZATION)
});
const destinationsModel = new DestinationsModel({
  destinationsApiService: new DestinationsApiService(BASE_URL, AUTHORIZATION)
});
const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(BASE_URL, AUTHORIZATION)
});

const filterPresenter = new FilterPresenter({
  filterContainer,
  pointsModel,
  filterModel
});

const tripPresenter = new TripPresenter({
  tripContainer,
  offersModel,
  destinationsModel,
  pointsModel,
  filterModel,
  onNewPointDestroy: handleNewPointFormClose
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function handleNewPointButtonClick() {
  tripPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

const initApp = async () => {
  filterPresenter.init();
  tripPresenter.init();

  Promise.all([
    offersModel.init(),
    destinationsModel.init(),
  ]).then(() => {
    pointsModel.init();
  }).catch(() => {
    // обработать возможные ошибки. Придумать заглушку например
  }).finally(() => {
    render(newPointButtonComponent, mainContainer);
  });
};

initApp();

