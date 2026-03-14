import TripPresenter from './presenter/trip-presenter.js';
import { render } from './render.js';
import FilterView from './view/filter-view.js';
import NewEventButtonView from './view/new-event-button-view.js';

const filterContainer = document.querySelector('.trip-controls__filters');
const mainContainer = document.querySelector('.trip-main');
const eventsContainer = document.querySelector('.trip-events');

const tripPresenter = new TripPresenter({tripContainer: eventsContainer});

render(new NewEventButtonView, mainContainer);
render(new FilterView(), filterContainer);

tripPresenter.init();
