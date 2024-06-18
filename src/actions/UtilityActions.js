import {
  TOGGLE_LAYOUT_KEYBOARD_VISIBLE,
  CLOSE_KEYBOARD,
  UPDATE_NETWORK_STATUS,
  CLEAR_ALERT_MESSAGE,
} from './types';

export const updateNetworkStatus = ( status ) => {
  return{
    type: UPDATE_NETWORK_STATUS,
    payload: status
  };
};

export const closeKeyboard = () => {
  return {
    type: CLOSE_KEYBOARD
  };
};

export const toggleLayoutKeyboardVisible = () => {
  return {
    type: TOGGLE_LAYOUT_KEYBOARD_VISIBLE
  };
};

export const clearAlertMessage = () => {
  return {
    type: CLEAR_ALERT_MESSAGE
  };
}



