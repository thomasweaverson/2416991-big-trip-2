import { render } from './framework/render.js';
import DestinationsModel from './model/destinations-model.js';
import NewPointModel from './model/new-point-model.js';
import OffersModel from './model/offers-model.js';
import PointsModel from './model/points-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import NewEventButtonView from './view/new-event-button-view.js';

const filterContainer = document.querySelector('.trip-controls__filters');
const mainContainer = document.querySelector('.trip-main');
const eventsContainer = document.querySelector('.trip-events');

const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();
const pointsModel = new PointsModel();

const newPointModel = new NewPointModel(destinationsModel);

const filterPresenter = new FilterPresenter({ filterContainer, pointsModel});
const tripPresenter = new TripPresenter({ tripContainer: eventsContainer, offersModel, destinationsModel, pointsModel, newPointModel });

render(new NewEventButtonView, mainContainer);

filterPresenter.init();
tripPresenter.init();

