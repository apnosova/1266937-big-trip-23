import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import OffersModel from './model/offers-model.js';
import DestinationsModel from './model/destinations-model.js';
import FilterModel from './model/filter-model.js';
import newPointButtonView from './view/new-point-button-view.js';
import {render} from './framework/render.js';
import PointsApiService from './api-service/points-api-service.js';
import {AUTHORIZATION, END_POINT} from './constants.js';

const tripMainElement = document.querySelector('.trip-main');
const filterControlsElement = document.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);

const destinationsModel = new DestinationsModel({
  pointsApiService: pointsApiService,
});

const offersModel = new OffersModel({
  pointsApiService: pointsApiService,
});

const pointsModel = new PointsModel({
  pointsApiService: pointsApiService,
  destinationsModel,
  offersModel,
});

const filterModel = new FilterModel();

const tripPresenter = new TripPresenter({
  tripPointsContainer: tripEventsElement,
  pointsModel,
  destinationsModel,
  offersModel,
  filterModel,
  onNewPointDestroy: handleNewPointFormClose,
});

const filterPresenter = new FilterPresenter({
  filterContainer: filterControlsElement,
  filterModel,
});

const newPointButtonComponent = new newPointButtonView({
  onNewPointButtonClick: handleNewPointButtonClick,
});

function handleNewPointButtonClick() {
  tripPresenter.createNewPoint();
  newPointButtonComponent.element.disabled = true;
}

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

filterPresenter.init();
tripPresenter.init();

pointsModel.init()
  .finally(() => {
    render(newPointButtonComponent, tripMainElement);
    if (pointsModel.isFailedLoad) {
      newPointButtonComponent.element.disabled = true;
    }
  });
