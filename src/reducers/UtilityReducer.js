import {
  TOGGLE_LAYOUT_KEYBOARD_VISIBLE,
  TOGGLE_LOGIN,
  SHOW_ADD_COMMENT_MODAL,
  HIDE_ADD_COMMENT_MODAL,
  SHOW_CAMERA,
  SHOW_CAMERA_MODIFIED,
  CLEAR_FORM,
  CLOSE_KEYBOARD,
  UPDATE_NETWORK_STATUS,
  ALERT_MESSAGE,
  CLEAR_ALERT_MESSAGE,
  UPDATE_FAILED,
  APP_VERSION_CHANGED,
} from '../actions/types';

const INITIAL_STATE = {
  keyboardVisible: false,
  online: false,
  alertMessage: '',
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case CLOSE_KEYBOARD:
      return {
        ...state,
        keyboardVisible: false
      };
    case TOGGLE_LAYOUT_KEYBOARD_VISIBLE:
      return {
        ...state,
        keyboardVisible: !state.keyboardVisible
      };
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
    case UPDATE_NETWORK_STATUS:
      return {
        ...state,
        online: action.payload
      };
    case ALERT_MESSAGE:
      // this can be used as replacement to all alerts()
      return {
        ...state,
        alertMessage: action.payload,
      };
    case CLEAR_ALERT_MESSAGE:
      return {
        ...state,
        alertMessage: '',
      };
    case UPDATE_FAILED:
      return {
        ...state,
        alertMessage: 'App update failed. Will retry again later.',
      };
    case APP_VERSION_CHANGED:
      return {
        ...INITIAL_STATE,
        online: state.online,
      };
    default:
      return state;
  };
};