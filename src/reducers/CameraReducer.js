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
  type: 'back',      // this is the default setting for the camera - user cannot change currently
  ratio: '16:9',     // this is the default ratio for the camera - user cannot change currently
  autoFocus: true,   // this is the default setting for the camera - user cannot change currently
  flash: 'auto',
  showCamera: false
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case RESET_REDUCER_GROUP:
      return {...INITIAL_STATE};
    case CLEAR_FORM:
      return {
        ...state,
        showCamera: false
      };
    case LOGIN_USER_START:
        return {
          ...state,
          showCamera: false
        };
    case LOGOUT_USER:
        return {
          ...state,
          showCamera: false
        };
    case SHOW_CAMERA:
      return {
        ...state,
        showCamera: true
      };
    case SHOW_CAMERA_MODIFIED:
        return {
          ...state,
          showCamera: true
        };
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
    case HIDE_CAMERA:
      return {
        ...state,
        showCamera: false
      };
    default:
      return state;
  };
};