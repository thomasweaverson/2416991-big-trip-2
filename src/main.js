import AppApiService from './api/app-api-service.js';
import AppModel from './model/app-model.js';
import FilterModel from './model/filter-model.js';
import HeaderPresenter from './presenter/header-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import { AUTHORIZATION, BASE_URL } from './utils/api.js';
import NewPointButtonView from './view/new-point-button-view.js';

const summaryContainer = document.querySelector('.trip-main');
const tripContainer = document.querySelector('.trip-events');

const appApiService = new AppApiService(BASE_URL, AUTHORIZATION);
const appModel = new AppModel({ appApiService });
const filterModel = new FilterModel();

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

const tripPresenter = new TripPresenter({
  tripContainer,
  appModel,
  filterModel,
  newPointButtonComponent
});

function handleNewPointButtonClick() {
  tripPresenter.createPoint();
  newPointButtonComponent.disable();
}

const initApp = () => {
  new HeaderPresenter({
    summaryContainer,
    appModel,
    filterModel,
    newPointButtonComponent
  });

  tripPresenter.init();
  appModel.init();
};

initApp();

