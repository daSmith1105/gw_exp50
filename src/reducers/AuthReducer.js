import {
  LOGIN_USER_START,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGOUT_USER,
  CLEAR_LOGIN_ERROR,
  APP_VERSION_CHANGED,
} from '../actions/types';

const INITIAL_STATE = {
  isLoggedIn: false,
  userId: '',
  email: '',
  password: '',
  webToken: '',
  loading: false,
  error: ''
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case LOGIN_USER_START:
      return {
        ...state,
        loading: true,
        error: '',
      };
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        webToken: 'JWT ' + action.payload.token,
        userId: action.payload.id,
        isLoggedIn: true,
        loading: false,
        email: action.payload.username,
        password: ''
      };
    case LOGIN_USER_FAIL:
      return {
        ...state,
        error: 'Authentication Failed.',
        password: '',
        loading: false
      };
    case CLEAR_LOGIN_ERROR:
      return {
        ...state,
        error: '',
        loading: false
      };
    case LOGOUT_USER:
    case APP_VERSION_CHANGED:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};