import { 
  LOGIN_USER_START,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGOUT_USER,
  CLEAR_LOGIN_ERROR,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
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
    case RESET_REDUCER_GROUP:
      return {
        ...state,
        isLoggedIn: false,
        userId: '',
        email: '', 
        password: '',
        webToken: '',
        loading: false,
        error: ''
      };
    case LOGIN_USER_START:
      return { 
        ...state, 
        loading: true, error: '' 
      }
    case LOGIN_USER_SUCCESS:
      return {  
        ...state, 
        webToken: 'JWT ' + action.token, 
        userId: action.id,
        isLoggedIn: true,
        loading: false,
        email: action.username,
        password: ''
      }
    case LOGIN_USER_FAIL:
      return { 
        ...state, 
        error: 'Authentication Failed.', 
        password: '', 
        loading: false 
      }
    case LOGOUT_USER:
        return {
          isLoggedIn: false,
          userId: '',
          email: '', 
          password: '',
          webToken: '',
          loading: false,
          error: ''
        }
    case CLEAR_LOGIN_ERROR:
      return {
        ...state,
        error: '',
        loading: false
      };
    default:
      return state;
  };
};