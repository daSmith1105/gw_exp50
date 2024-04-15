import { 
  UPDATE_AVAILABLE,
  TOGGLE_LAYOUT_KEYBOARD_VISIBLE,
  TOGGLE_LOGIN,
  SHOW_ADD_COMMENT_MODAL,
  HIDE_ADD_COMMENT_MODAL,
  SHOW_CAMERA,
  SHOW_CAMERA_MODIFIED,
  CLEAR_FORM,
  CLOSE_KEYBOARD,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = { 
  keyboardVisible: false,
  syncRunning: false
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case RESET_REDUCER_GROUP:
      return { 
        ...state,
        keyboardVisible: false,
        syncRunning: false
       };
    case UPDATE_AVAILABLE: 
      return {  
        ...state,
        showUpdateModal: true,
        updateAvailable: true
      }
    case CLOSE_KEYBOARD:
      return {
        ...state,
        keyboardVisible: false
      }
    case TOGGLE_LAYOUT_KEYBOARD_VISIBLE:
      return {
        ...state,
        keyboardVisible: !state.keyboardVisible
      }
    case TOGGLE_LOGIN:
      return {
        ...state,
        keyboardVisible: false
      };
    case SHOW_ADD_COMMENT_MODAL:
      return{
        ...state,
        keyboardVisible: false
      };
    case HIDE_ADD_COMMENT_MODAL:
      return{
        ...state,
        keyboardVisible: false
      };
    case SHOW_CAMERA: 
      return {
        ...state,
        keyboardVisible: false
      };
    case SHOW_CAMERA_MODIFIED: 
    return {
      ...state,
      keyboardVisible: false
    };
    case CLEAR_FORM:
      return {
        ...state,
        keyboardVisible: false
      };
    default:
      return state;
  };
};