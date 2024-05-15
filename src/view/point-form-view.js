import AbstractView from '../framework/view/abstract-view.js';
import {POINT_TYPES, TimeFormatDisplay} from '../constants.js';
import {capitalizeFirstLetter, getLastCharacterOfString, humanizeEventDate} from '../utils.js';

const createPointTypeListTemplate = (types, activeType) => (
  types.map((type) => (
    `<div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value=${type}
      ${activeType === type ? 'checked' : ''}>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${capitalizeFirstLetter(type)}</label>
  </div>`)).join('')
);

const createCityListTemplate = (destinations) => (
  destinations.map((destination) => (
    `<option value=${destination.city}></option>`
  )).join('')
);

const createOfferListTemplate = (offers) => (
  offers.map((offer) => (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${getLastCharacterOfString(offer.offers.title)}-1" type="checkbox" name="event-offer-${getLastCharacterOfString(offer.offers.title)}" checked>
        <label class="event__offer-label" for="event-offer-${getLastCharacterOfString(offer.offers.title)}-1">
          <span class="event__offer-title">${offer.offers.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.offers.price}</span>
        </label>
    </div>`
  )).join('')
);

const createOfferSectionTemplate = (offers) => (
  `${offers.length > 0 ? `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${createOfferListTemplate(offers)}
    </div>
  </section>` : ''}`
);

const createPictureListTemplate = (pictures) => (
  pictures.map((picture) => (
    `<img class="event__photo" src=${picture.src} alt="${picture.description}"></img>`
  )).join('')
);

const createDestinationSectionTemplate = (description, pictures) => (
  `${description.length > 0 ? `<section class="event__section  event__section--destination">
  <h3 class="event__section-title  event__section-title--destination">Destination</h3>
  <p class="event__destination-description">${description}</p>

  <div class="event__photos-container">
    <div class="event__photos-tape">
      ${createPictureListTemplate(pictures)}
    </div>
  </div>
</section>` : ''}`
);

const createPointFormTemplate = (point, destinations, offers) => {
  const {type, startTime, endTime, destination} = point;
  const {description, pictures} = destination;

  const activeOffers = offers.filter((offer) => offer.type === type);

  return `< li class="trip-events__item" >
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>

              ${createPointTypeListTemplate(POINT_TYPES, type)}

            </fieldset>
          </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value=${destination.city} list="destination-list-1">
          <datalist id="destination-list-1">

            ${createCityListTemplate(destinations)}

          </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizeEventDate(startTime, TimeFormatDisplay.DATE_TIME_FORMAT)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizeEventDate(endTime, TimeFormatDisplay.DATE_TIME_FORMAT)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>

          <!--add-new-point-form-->
          <!--<button class="event__save-btn  btn  btn--blue" type="submit">Save</button>-->
          <!--<button class="event__reset-btn" type="reset">Cancel</button>-->

        </header>
        <section class="event__details">
          ${createOfferSectionTemplate(activeOffers)}
          ${createDestinationSectionTemplate(description, pictures)}
        </section>
      </form>
    </li>`;
};

export default class PointFormView extends AbstractView {
  constructor({point, destinations, offers}) {
    super();
    this.point = point;
    this.destinations = destinations;
    this.offers = offers;
  }

  get template() {
    return createPointFormTemplate(this.point, this.destinations, this.offers);
  }
}
