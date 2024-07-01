import {
  SHOW_ADD_PASSENGER_MODAL,
  HIDE_ADD_PASSENGER_MODAL,
  SHOW_ADD_COMMENT_MODAL,
  HIDE_ADD_COMMENT_MODAL,
  CLEAR_FORM,
  APP_VERSION_CHANGED,
} from '../actions/types';

const INITIAL_STATE = {
  showAddPassenger: false,
  showAddComment: false,
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case SHOW_ADD_PASSENGER_MODAL :
      return {
        ...state,
        showAddPassenger: true,
        showAddComment: false,
      };
    case HIDE_ADD_PASSENGER_MODAL :
      return {
        ...state,
        showAddPassenger: false
      };
    case SHOW_ADD_COMMENT_MODAL :
      return {
        ...state,
        showAddComment: true,
        showAddPassenger: false,
      };
    case HIDE_ADD_COMMENT_MODAL :
      return {
        ...state,
        showAddComment: false
      };
    case CLEAR_FORM:
    case APP_VERSION_CHANGED:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};