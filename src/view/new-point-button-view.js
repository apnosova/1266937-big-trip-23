import AbstractView from '../framework/view/abstract-view';

const createNewPointButtonTemplate = () => (
  `<button
    class="trip-main__event-add-btn  btn  btn--big  btn--yellow"
    type="button">
      New event
  </button>`
);

export default class extends AbstractView {
  #handleNewPointButtonClick = null;

  constructor({onNewPointButtonClick}) {
    super();
    this.#handleNewPointButtonClick = onNewPointButtonClick;
    this.element.addEventListener('click', this.#newPointButtonClickHandler);
  }

  get template() {
    return createNewPointButtonTemplate();
  }

  #newPointButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleNewPointButtonClick();
  };
}
