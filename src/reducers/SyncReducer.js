import {
  SET_FORCE_SYNC,
  START_UPDATE,
  APP_VERSION_CHANGED,
} from '../actions/types';

const INITIAL_STATE = {
  forceSync: false,
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case SET_FORCE_SYNC:
      return {
        ...state,
        forceSync: action.payload,
      };
    case START_UPDATE:
      return {
        ...state,
        forceSync: true,
      };
    case APP_VERSION_CHANGED:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};