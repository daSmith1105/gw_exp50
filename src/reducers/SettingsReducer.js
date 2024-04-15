import { 
  TOGGLE_SETTINGS_MENU,
  TOGGLE_LOGIN,
  LOGOUT_USER,
  LOGIN_USER_SUCCESS,
  SHOW_EVENT_VIEWER_MODAL,
  HIDE_EVENT_VIEWER_MODAL,
  HIDE_REPORTS_MODAL,
  REPORT_ERROR_START,
  REPORT_ERROR_SUCCESS,
  REPORT_ERROR_FAIL,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = { 
  showSettingsMenu: false,
  showLoginScreen: false,
  reportErrorFail: false,
  reportErrorSuccess: false,
  sendingReport: false
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case REPORT_ERROR_START:
      return { 
        ...state,
        reportErrorFail: false,
        reportErrorSuccess: false,
        sendingReport: true
      };
    case REPORT_ERROR_SUCCESS:
      return { 
        ...state,
        reportErrorFail: false,
        reportErrorSuccess: true,
        sendingReport: false
      };
    case REPORT_ERROR_FAIL:
      return { 
        ...state,
        reportErrorFail: true,
        sendingReport: false
      };
    case HIDE_REPORTS_MODAL:
      return { 
        ...state,
        reportErrorFail: false,
        reportErrorSuccess: false,
        sendingReport: false
      };
    case RESET_REDUCER_GROUP:
      return { 
        ...state,
        showSettingsMenu: false,
        showLoginScreen: false,
        reportErrorFail: false
      };
    case TOGGLE_SETTINGS_MENU: 
      return {  
        ...state,
        showSettingsMenu: !state.showSettingsMenu,
        reportErrorFail: false,
        reportErrorSuccess: false,
        sendingReport: false
      };
    case TOGGLE_LOGIN:
      return {
        ...state,
        showSettingsMenu: false,
        showLoginScreen: !state.showLoginScreen,
        reportErrorFail: false,
        reportErrorSuccess: false,
        sendingReport: false
      };
    case SHOW_EVENT_VIEWER_MODAL: 
      return {  
        ...state,
        showSettingsMenu: false,
        reportErrorFail: false
      };
    case HIDE_EVENT_VIEWER_MODAL:
      return {
        ...state,
        showSettingsMenu: true,
        reportErrorFail: false
      };
    case LOGIN_USER_SUCCESS: 
      return {  
        ...state,
        showLoginScreen: false,
        showSettingsMenu: false,
        reportErrorFail: false,
        reportErrorSuccess: false,
        sendingReport: false
      };
    case LOGOUT_USER:
      return {
        ...state,
        showSettingsMenu: false,
        showLoginScreen: false,
        reportErrorFail: false,
        reportErrorSuccess: false,
        sendingReport: false
      };
    default:
      return state;
  };
};