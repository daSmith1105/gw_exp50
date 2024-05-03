import {
  SHOW_ADD_PASSENGER_MODAL,
  HIDE_ADD_PASSENGER_MODAL,
  SHOW_ADD_COMMENT_MODAL,
  HIDE_ADD_COMMENT_MODAL,
  CLEAR_FORM,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = {
  showAddPassenger: false,
  showAddComment: false,
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case CLEAR_FORM:
    case RESET_REDUCER_GROUP:
      return {...INITIAL_STATE};
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
    default:
      return state;
  };
};