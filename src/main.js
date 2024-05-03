import Presenter from './presenter/presenter.js';

const tripMainElement = document.querySelector('.trip-main');
const filterControlsElement = document.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

const presenter = new Presenter({
  tripInfoContainer: tripMainElement,
  filterContainer: filterControlsElement,
  sortingContainer: tripEventsElement,
  pointListContainer: tripEventsElement,
});

presenter.init();
