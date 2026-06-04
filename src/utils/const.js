const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const DEFAULT_POINT_TYPE = POINT_TYPES[5];

const DEFAULT_POINT = {
  id: 'new-point',
  basePrice: 0,
  dateFrom: '',
  dateTo: '',
  destination: '',
  isFavorite: false,
  offers: [],
  type: DEFAULT_POINT_TYPE
};

const BLANK_DESTINATION = {
  id: 'new-point',
  name: '',
  description: '',
  pictures: []
};

const SortItem = {
  DEFAULT: {
    name: 'day',
    id: 'sort-day',
    isDisabled: false
  },
  EVENT: {
    name: 'event',
    id: 'sort-event',
    isDisabled: true
  },
  TIME: {
    name: 'time',
    id: 'sort-time',
    isDisabled: false
  },
  PRICE: {
    name: 'price',
    id: 'sort-price',
    isDisabled: false
  },
  OFFER: {
    name: 'offer',
    id: 'sort-offer',
    isDisabled: true
  }
};

const UserAction = {
  UPDATE_POINT: 'update-point',
  ADD_POINT: 'add-point',
  DELETE_POINT: 'delete-point'
};

const UpdateType = {
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major',
  INIT: 'init',
  ERROR: 'error'
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const Message = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  LOADING: 'Loading...',
  ERROR: 'Failed to load latest route information'
};

export { BLANK_DESTINATION, DEFAULT_POINT, FilterType, POINT_TYPES, SortItem, TimeLimit, UpdateType, UserAction, Message };

