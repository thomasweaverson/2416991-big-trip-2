import DestinationsApiService from './api/destinations-api-service.js';
import OffersApiService from './api/offers-api-service.js';
import PointsApiService from './api/points-api-service.js';
import DestinationsModel from './model/destinations-model.js';
import FilterModel from './model/filter-model.js';
import OffersModel from './model/offers-model.js';
import PointsModel from './model/points-model.js';
import HeaderPresenter from './presenter/header-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import { AUTHORIZATION, BASE_URL } from './utils/api.js';
import NewPointButtonView from './view/new-point-button-view.js';


const summaryContainer = document.querySelector('.trip-main');
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

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

new HeaderPresenter({
  summaryContainer,
  pointsModel,
  offersModel,
  destinationsModel,
  filterModel,
  newPointButtonComponent
});

const tripPresenter = new TripPresenter({
  tripContainer,
  pointsModel,
  offersModel,
  destinationsModel,
  filterModel,
  newPointButtonComponent
});

function handleNewPointButtonClick() {
  tripPresenter.createPoint();
  newPointButtonComponent.disable();
}

const initApp = async () => {
  tripPresenter.init();

  Promise.all([
    offersModel.init(),
    destinationsModel.init(),
  ]).then(() => {
    pointsModel.init();
  }).then(() => {

  }).catch(() => {
    // обработать возможные ошибки. Придумать заглушку например
  }).finally(() => {

    //!уйдёт в header presenter
    // render(newPointButtonComponent, summaryContainer);
  });
};

initApp();

