import { remove, render, replace } from '../framework/render';
import { UpdateType, UserAction } from '../utils/const';
import { isDatesEqual } from '../utils/date';
import PointFormView from '../view/point-form-view';
import PointView from '../view/point-view';

const Mode = {
  DEFAULT: 'DEFAULT',
  FORM: 'FORM',
};

export default class PointPresenter {
  #pointListContainer = null;

  #pointComponent = null;
  #pointFormComponent = null;

  #appModel = null;

  #dataChangeHandler = null;
  #modeChangeHandler = null;

  #point = null;
  #mode = Mode.DEFAULT;

  constructor({
    pointListContainer,
    appModel,
    onDataChange,
    onModeChange
  }) {
    this.#pointListContainer = pointListContainer;
    this.#appModel = appModel;
    this.#dataChangeHandler = onDataChange;
    this.#modeChangeHandler = onModeChange;
  }

  init = (point) => {
    this.#point = point;
    const previousPointComponent = this.#pointComponent;
    const previousPointFormComponent = this.#pointFormComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      destination: this.#appModel.getDestination(this.#point.destination),
      selectedOffers: this.#appModel.getSelectedOffers(this.#point.type, this.#point.offers),
      onRollupClick: this.#rollupClickHandler,
      onFavoriteClick: this.#favoriteClickHandler,
    });

    this.#pointFormComponent = new PointFormView({
      point: this.#point,
      offers: this.#appModel.offers,
      currentDestination: this.#appModel.getDestination(this.#point.destination),
      destinations: this.#appModel.destinations,
      onFormSubmit: this.#formSubmitHandler,
      onFormReset: this.#deleteClickHandler,
      onRollupClick: this.#rollupClickHandler
    });

    if (previousPointComponent === null || previousPointFormComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, previousPointComponent);
    }

    if (this.#mode === Mode.FORM) {
      replace(this.#pointFormComponent, previousPointFormComponent);
    }

    remove(previousPointComponent);
    remove(previousPointFormComponent);
  };

  destroy = () => {
    remove(this.#pointComponent);
    remove(this.#pointFormComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#pointFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  setSaving = () => {
    if (this.#mode === Mode.FORM) {
      this.#pointFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  };

  setDeleting = () => {
    if (this.#mode === Mode.FORM) {
      this.#pointFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  };

  setAborting = () => {
    const resetFormState = () => {
      this.#pointFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };
    this.#pointComponent.shake();
    this.#pointFormComponent.shake(resetFormState);
  };

  #replacePointToForm = () => {
    replace(this.#pointFormComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#modeChangeHandler();
    this.#mode = Mode.FORM;
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#pointFormComponent);
    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  #rollupClickHandler = () => {
    if (this.#mode === Mode.DEFAULT) {
      this.#replacePointToForm();
    } else if (this.#mode === Mode.FORM) {
      this.#pointFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#pointFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  #formSubmitHandler = (point) => {
    const isPatchUpdate = isDatesEqual(this.#point, point) && this.#point.basePrice === point.basePrice;

    this.#dataChangeHandler(
      UserAction.UPDATE_POINT,
      isPatchUpdate ? UpdateType.PATCH : UpdateType.MINOR,
      point
    );
  };

  #deleteClickHandler = () => {
    this.#dataChangeHandler(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      this.#point
    );
  };

  #favoriteClickHandler = () => {
    this.#dataChangeHandler(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite }
    );
  };
}
