import { Updates } from 'expo';
import { 
  UPDATE_AVAILABLE,
  CLOSE_MODAL,
  APPLY_UPDATE,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from './types';

export const checkForUpdate = () => {
  return async( dispatch ) => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if ( update.isAvailable ) {
        await Updates.fetchUpdateAsync();
        updateAvailable();
      };
    } catch (error) {
      console.log( 'Error:', error );
    };
  };
};

const updateAvailable = () => {
  return {
    type: UPDATE_AVAILABLE
  };
};

export const closeUpdateModal = () => {
  return {
    type: CLOSE_MODAL
  };
};

export const applyUpdate = () => {
  Updates.reloadFromCache()
  return {
    type: APPLY_UPDATE
  };
};

export const resetReducerGroup = () => {
  return {  
   type: RESET_REDUCER_GROUP 
  };
};
