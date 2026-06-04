import { remove, render, RenderPosition } from '../framework/render';
import { DEFAULT_POINT, UpdateType, UserAction } from '../utils/const';
import PointFormView from '../view/point-form-view';

export default class NewPointPresenter {
  #pointFormComponent = null;

  #offers = null;
  #destinations = null;

  #dataChangeHandler = null;
  #destroyHandler = null;

  constructor({
    offers,
    destinations,
    onDataChange,
    onDestroy
  }) {
    this.#offers = offers;
    this.#destinations = destinations;
    this.#dataChangeHandler = onDataChange;
    this.#destroyHandler = onDestroy;
  }

  init = (pointsListContainer) => {
    if (this.#pointFormComponent !== null) {
      return;
    }

    this.#pointFormComponent = new PointFormView({
      point: {
        ...DEFAULT_POINT,
      },
      offers: this.#offers,
      destinations: this.#destinations,
      onFormSubmit: this.#formSubmitHandler,
      onFormReset: this.#formResetHandler,
      onRollupClick: null,
      isNewPoint: true
    });

    render(
      this.#pointFormComponent,
      pointsListContainer,
      RenderPosition.AFTERBEGIN
    );

    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  destroy = () => {
    if (this.#pointFormComponent === null) {
      return;
    }

    this.#destroyHandler();

    remove(this.#pointFormComponent);
    this.#pointFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  setSaving = () => {
    this.#pointFormComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  };

  setAborting = () => {
    const resetFormState = () => {
      this.#pointFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
      });
    };
    this.#pointFormComponent.shake(resetFormState);
  };

  #formSubmitHandler = (point) => {
    const pointToAdd = {
      ...point,
    };

    delete pointToAdd.id;

    this.#dataChangeHandler(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      pointToAdd
    );
  };

  #formResetHandler = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}

