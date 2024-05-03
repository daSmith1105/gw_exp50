import { 
  SHOW_ADD_PASSENGER_MODAL,
  HIDE_ADD_PASSENGER_MODAL,
  SHOW_ADD_COMMENT_MODAL,
  HIDE_ADD_COMMENT_MODAL,
} from './types';

export const showAddPassengerModal = () => {
    return ( dispatch ) => {
      dispatch({ type: SHOW_ADD_PASSENGER_MODAL });
  };
};

export const hideAddPassengerModal = () => {
  return ( dispatch ) => {
    dispatch({ type: HIDE_ADD_PASSENGER_MODAL });
  };
};

export const showAddCommentModal = () => {
  return ( dispatch ) => {
    dispatch({ type: SHOW_ADD_COMMENT_MODAL });
  };
};

export const hideAddCommentModal = () => {
  return ( dispatch ) => {
    dispatch({ type: HIDE_ADD_COMMENT_MODAL });
  };
}
