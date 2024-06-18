import {
  UPDATE_AVAILABLE,
  UPDATE_LATER,
  START_UPDATE,
  SET_UPDATE_STATUS,
  UPDATE_FAILED,
  APP_VERSION_CHANGED,
} from '../actions/types';

const INITIAL_STATE = {
  appLink: '',
  updateAvailable: false,
  ignoreUpdateWarning: false, // ignore deprecated warning until next app startup/login
  deprecated: false,
  updating: false,
  updateStatus: '',
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case UPDATE_AVAILABLE:
      return {
        ...state,
        appLink: action.appLink,
        updateAvailable: action.updateAvailable,
        deprecated: action.deprecated,
        ignoreUpdateWarning: false,
      };
    case UPDATE_LATER:
      return {
        ...state,
        updating: false,
        updateAvailable: false,
        deprecated: false,
        ignoreUpdateWarning: action.ignoreUpdateWarning,
      };
    case START_UPDATE:
      return {
        ...state,
        updating: true,
      }
    case SET_UPDATE_STATUS: {
      return {
        ...state,
        updateStatus: action.payload,
      }
    }
    case UPDATE_FAILED:
      return {
        ...state,
        updating: false,
        updateStatus: '',
      }
    case APP_VERSION_CHANGED:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};