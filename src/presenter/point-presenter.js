import { remove, render, replace } from '../framework/render';
import { UpdateType, UserAction } from '../utils/const';
import { isDatesEqual } from '../utils/date';
import { isPointsEqual } from '../utils/utils';
import PointFormView from '../view/point-form-view';
import PointView from '../view/point-view';

const Mode = {
  DEFAULT: 'DEFAULT',
  FORM: 'FORM',
};

export default class PointPresenter {
  #pointListContainer = null;
  #destinationsModel = null;
  #offersModel = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #pointFormComponent = null;

  #point = null;
  #mode = Mode.DEFAULT;

  constructor({
    pointListContainer,
    destinationsModel,
    offersModel,
    onDataChange,
    onModeChange
  }) {
    this.#pointListContainer = pointListContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;
    const previousPointComponent = this.#pointComponent;
    const previousPointFormComponent = this.#pointFormComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      destination: this.#destinationsModel.getDestination(this.#point.destination),
      selectedOffers: this.#offersModel.getSelectedOffers(this.#point.type, this.#point.offers),
      onRollupClick: this.#rollupClickHandler,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#pointFormComponent = new PointFormView({
      point: this.#point,
      offers: this.#offersModel.offers,
      currentDestination: this.#destinationsModel.getDestination(this.#point.destination),
      destinations: this.#destinationsModel.destinations,
      onFormSubmit: this.#handleFormSubmit,
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
      //! why? vVv разобраться
      this.#mode = Mode.DEFAULT;
    }

    remove(previousPointComponent);
    remove(previousPointFormComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointFormComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#pointFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  setSaving() {
    if (this.#mode === Mode.FORM) {
      this.#pointFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.FORM) {
      this.#pointFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointFormComponent.shake(resetFormState);
  }

  #rollupClickHandler = () => {
    if (this.#mode === Mode.DEFAULT) {
      this.#replacePointToForm();
    } else if (this.#mode === Mode.FORM) {
      this.#pointFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  #handleEscKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#pointFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  #handleFormSubmit = (point) => {
    if (isPointsEqual(this.#point, point)) {
      this.#replaceFormToPoint();
      return;
    }
    const isPatchUpdate = isDatesEqual(this.#point, point);

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      isPatchUpdate ? UpdateType.PATCH : UpdateType.MINOR,
      point
    );

    // this.#replaceFormToPoint();
  };

  #deleteClickHandler = () => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      this.#point
    );
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite }
    );
  };

  #replacePointToForm() {
    replace(this.#pointFormComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#handleEscKeyDown);
    this.#handleModeChange();
    this.#mode = Mode.FORM;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#pointFormComponent);
    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#handleEscKeyDown);
  }
}
