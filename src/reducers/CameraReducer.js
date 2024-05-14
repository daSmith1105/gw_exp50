import {
  TOGGLE_FLASH,
  CLEAR_FORM,
  HIDE_CAMERA,
  SHOW_CAMERA,
  SHOW_CAMERA_MODIFIED,
  LOGIN_USER_START,
  LOGOUT_USER,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = {
  flash: 'auto',
  showCamera: false
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case RESET_REDUCER_GROUP:
      return {...INITIAL_STATE};
    case TOGGLE_FLASH:
      if ( state.flash === 'auto' ) {
        return {
          ...state,
          flash: 'off'
        };
      } else {
        return {
          ...state,
          flash: 'auto'
        };
      };
    case SHOW_CAMERA:
    case SHOW_CAMERA_MODIFIED:
      return {
        ...state,
        showCamera: true
      };
    case CLEAR_FORM:
    case LOGIN_USER_START:
    case LOGOUT_USER:
    case HIDE_CAMERA:
      return {
        ...state,
        showCamera: false
      };
    default:
      return state;
  };
};