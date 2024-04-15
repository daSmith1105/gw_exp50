import { 
  SHOW_ADD_PASSENGER_MODAL,
  HIDE_ADD_PASSENGER_MODAL,
  SHOW_ADD_COMMENT_MODAL,
  HIDE_ADD_COMMENT_MODAL,
  SHOW_EVENT_VIEWER_MODAL,
  HIDE_EVENT_VIEWER_MODAL,
  CLEAR_FORM,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = { 
  showAddPassenger: false,
  showAddComment: false,
  showEventViewer: false
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case RESET_REDUCER_GROUP:
      return { 
        ...state,
        showAddPassenger: false,
        showAddComment: false,
        showEventViewer: false
       };
    case SHOW_ADD_PASSENGER_MODAL : 
      return {
        ...state,
        showAddPassenger: true,
        showEventViewer: false,
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
        showEventViewer: false,
        showAddPassenger: false,
      };
    case HIDE_ADD_COMMENT_MODAL : 
      return {
        ...state,
        showAddComment: false
      };
    case SHOW_EVENT_VIEWER_MODAL : 
      return {
        ...state,
        showEventViewer: true,
        showAddPassenger: false,
        showAddComment: false,
      };
    case HIDE_EVENT_VIEWER_MODAL : 
      return {
        ...state,
        showEventViewer: false
      };
    case CLEAR_FORM:
        return {
            ...state,
            showAddPassenger: false,
            showAddComment: false,
            showEventViewer: false
        };
    default:
      return state;
  };
};