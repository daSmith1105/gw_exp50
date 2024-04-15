import { 
  UPDATE_AVAILABLE,
  CLOSE_MODAL,
  APPLY_UPDATE,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = { 
  updateAvailable: false,
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case RESET_REDUCER_GROUP:
      return {
        ...state,
        updateAvailable: false
       };
    case UPDATE_AVAILABLE: 
      return {  
        ...state,
        updateAvailable: true
      }
    case CLOSE_MODAL: 
      setTimeout( function() {
        return { ...state, updateAvailable: true };
      }, 900000 );
      return { 
        ...state,
        updateAvailable: false
      }
    case APPLY_UPDATE:
      return {
        ...state,
        updateAvailable: false,
      }
    default:
      return state;
  };
};