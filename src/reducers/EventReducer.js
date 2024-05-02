// **** currently for EventList etc we are keeping state within the component - if we choose to keep doing that, we can remove this file

import {
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = {
  nada: ''
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case RESET_REDUCER_GROUP:
      return {...INITIAL_STATE};
    default:
      return state;
    };
  };

