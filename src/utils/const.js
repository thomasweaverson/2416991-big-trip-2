const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const DEFAULT_POINT_TYPE = POINT_TYPES[5];

const DEFAULT_POINT = {
  'id': 'new-point',
  'basePrice': 0,
  'dateFrom': '',
  'dateTo': '',
  'destination': '',
  'isFavorite': false,
  'offers': [],
  'type': DEFAULT_POINT_TYPE
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

export { DEFAULT_POINT, FilterType, POINT_TYPES, SortItem, UpdateType, UserAction, TimeLimit };

