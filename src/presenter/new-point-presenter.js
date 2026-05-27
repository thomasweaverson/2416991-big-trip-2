import { remove, render, RenderPosition } from '../framework/render';
import { DEFAULT_POINT, UpdateType, UserAction } from '../utils/const';
import PointFormView from '../view/point-form-view';

export default class NewPointPresenter {
  #offers = null;
  #destinations = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #pointFormComponent = null;

  constructor({
    offers,
    destinations,
    onDataChange,
    onDestroy
  }) {
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(pointsListContainer) {
    if (this.#pointFormComponent !== null) {
      return;
    }

    this.#pointFormComponent = new PointFormView({
      point: {
        ...DEFAULT_POINT,
      },
      offers: this.#offers,
      destinations: this.#destinations,
      onFormSubmit: this.#handleFormSubmit,
      onFormReset: this.#handleFormReset,
      onRollupClick: null,
      isNewPoint: true
    });

    render(
      this.#pointFormComponent,
      pointsListContainer,
      RenderPosition.AFTERBEGIN
    );

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#pointFormComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#pointFormComponent);
    this.#pointFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#pointFormComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
      });
    };
    this.#pointFormComponent.shake(resetFormState);
  }

  #handleFormSubmit = (point) => {
    const pointToAdd = {
      ...point,
    };

    delete pointToAdd.id;

    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      pointToAdd
    );
    this.destroy();
  };

  #handleFormReset = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}

