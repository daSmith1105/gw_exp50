import { 
  TOGGLE_FLASH,
  TAKE_PHOTO_SUCCESS,
  SAVE_ADDITIONAL_PHOTO,
  MODIFY_EXISTING_PHOTO,
  HIDE_CAMERA,
  SHOW_CAMERA_MODIFIED,
  SHOW_CAMERA
} from './types';

export const toggleFlash = () => {
  return {
    type: TOGGLE_FLASH
  };
};

export const setPhotoData = ( id, label, path ) => {
  return( dispatch ) => {
    if( id !== null ) {
      dispatch({
        type: SAVE_ADDITIONAL_PHOTO,
        id,
        label,
        path
      })
    } else {
    // it is either of the default photos - lpn or load
      dispatch({
        type: TAKE_PHOTO_SUCCESS,
        label,
        path
      })
    };
  };
};

export const modifyExistingPhoto = ( id, label, path ) => {
  return ( dispatch ) => {
    dispatch({ 
      type: MODIFY_EXISTING_PHOTO, 
      id, 
      label, 
      path 
    })
  };
};

export const hideCamera = () => {
  return {
    type: HIDE_CAMERA 
  };
};

export const showCamera = ( name, id ) => {
  if ( id !== null ) {
    // we are replacing a previously taken photo
    return ( dispatch ) => {
      dispatch({ type: SHOW_CAMERA_MODIFIED, name, id })
    };
  } 
  
  return ( dispatch ) => {
    dispatch({ type: SHOW_CAMERA, name})
  };
};

