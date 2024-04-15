import { 
  SAVE_EVENT,
  CLEAR_EVENT_SAVE_MODAL
} from './types';

export const clearEventSaveModal = () => {
  return {
    type: CLEAR_EVENT_SAVE_MODAL
  }
};

export const saveEvent = ( event )  => {
  return {
    type: SAVE_EVENT, 
    payload: event
  }
};

