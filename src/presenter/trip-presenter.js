import SortingView from '../view/sorting-view.js';
import PointListView from '../view/point-list-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import FailedLoadView from '../view/failed-load-view.js';
import {remove, render} from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import TripInfoPresenter from './trip-info-presenter.js';
import {SortingOption, UserAction, UpdateType, FilterOption} from '../constants.js';
import {sortEventsByDate, sortEventsByDuration, sortEventsByPrice} from '../utils/point.js';
import {filterByOptions} from '../utils/filter-utils.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class TripPresenter {
  #tripInfoContainer = null;
  #tripPointsContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #pointListComponent = new PointListView();
  #loadingComponent = new LoadingView();
  #sortingComponent = null;
  #emptyListComponent = null;
  #failedLoadComponent = null;

  #pointPresenters = new Map();
  #tripInfoPresenter = null;
  #newPointPresenter = null;

  #currentSortingOption = SortingOption.DEFAULT;
  #isLoading = true;

  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({
    tripInfoContainer,
    tripPointsContainer,
    pointsModel,
    destinationsModel,
    offersModel,
    filterModel,
    onNewPointDestroy}) {
    this.#tripInfoContainer = tripInfoContainer;
    this.#tripPointsContainer = tripPointsContainer;

    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    this.#tripInfoPresenter = new TripInfoPresenter({
      tripInfoContainer: this.#tripInfoContainer
    });

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy,
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filterOption = this.#filterModel.filter;
    const points = this.#pointsModel.points.sort(sortEventsByDate);
    const filteredPoints = filterByOptions[filterOption](points);

    switch (this.#currentSortingOption) {
      case SortingOption.TIME:
        return filteredPoints.sort(sortEventsByDuration);
      case SortingOption.PRICE:
        return filteredPoints.sort(sortEventsByPrice);
      default:
        return filteredPoints.sort(sortEventsByDate);
    }
  }

  get destinations() {
    return this.#destinationsModel.destinations;
  }

  get offers() {
    return this.#offersModel.offers;
  }

  get filter() {
    return this.#filterModel.filter;
  }

  get failedLoad() {
    return this.#pointsModel.isFailedLoad;
  }

  init() {
    this.#renderTripInfo();
    this.#renderTrip();
  }

  #handleSortingOptionChange = (sortingOption) => {
    if (this.#currentSortingOption === sortingOption) {
      return;
    }

    this.#currentSortingOption = sortingOption;
    this.#clearTrip();
    this.#renderTrip();
  };

  #renderSorting() {
    this.#sortingComponent = new SortingView({
      currentSortingOption: this.#currentSortingOption,
      onSortingOptionChange: this.#handleSortingOptionChange,
    });

    render(this.#sortingComponent, this.#tripPointsContainer);
  }

  createNewPoint() {
    this.#currentSortingOption = SortingOption.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterOption.DEFAULT);
    this.#newPointPresenter.init(this.destinations, this.offers);
  }

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    // Здесь будем вызывать обновление модели.
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch (err) {
          this.#newPointPresenter.setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    // В зависимости от типа изменений решаем, что делать:
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        // - обновить список
        this.#clearTrip();
        this.#renderTrip();
        break;
      case UpdateType.MAJOR:
        // - обновить весь маршрут
        this.#clearTrip({resetSortingOption: true});
        this.#renderTrip();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderTrip();
        break;
    }
  };

  #renderPoint(point, destinations, offers) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointListComponent.element,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point, destinations, offers);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderPointList(points, destinations, offers) {
    render(this.#pointListComponent, this.#tripPointsContainer);

    points.forEach((point) => this.#renderPoint(point, destinations, offers));
  }

  #renderTripInfo() {
    this.#tripInfoPresenter.init();
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#tripPointsContainer);
  }

  #renderFailedLoad() {
    this.#failedLoadComponent = new FailedLoadView({
      isFailedLoad: this.failedLoad,
    });

    render(this.#failedLoadComponent, this.#tripPointsContainer);
  }

  #renderEmptyList() {
    this.#emptyListComponent = new EmptyListView({
      filterOption: this.filter
    });

    render(this.#emptyListComponent, this.#tripPointsContainer);
  }

  #clearTrip({resetSortingOption = false} = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortingComponent);
    remove(this.#emptyListComponent);
    remove(this.#failedLoadComponent);

    if (resetSortingOption) {
      this.#currentSortingOption = SortingOption.DEFAULT;
    }

    remove(this.#loadingComponent);
  }

  #renderTrip() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.failedLoad) {
      this.#renderFailedLoad();
      return;
    }

    const points = this.points;
    const pointCount = points.length;

    if (pointCount === 0) {
      this.#renderEmptyList();
      return;
    }

    if (pointCount > 0) {
      this.#renderSorting();
    }

    this.#renderPointList(points, this.destinations, this.offers);
  }
}
