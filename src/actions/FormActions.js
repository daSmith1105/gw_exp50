import { 
  CLEAR_FORM, 
  HANDLE_INPUT_CHANGE,
  ADD_NEW_LPN,
  ADD_NEW_COMPANY,
  ADD_NEW_DRIVER,
  FORM_INCOMPLETE_ERROR,
  REMOVE_PHOTO_INSTANCE
} from './types';

export const clearForm = () => {
  return {
    type: CLEAR_FORM
  };
};

export const handleInputChange = ( name, value ) => {
  return {
    type: HANDLE_INPUT_CHANGE,
    name,
    value
  };
};

export const addNewLpn = ( name ) => {
  return {
    type: ADD_NEW_LPN,
    name: name.trim()
  };
};

export const addNewCompany = ( name ) => {
  return {
    type: ADD_NEW_COMPANY,
    name: name.trim()
  };
};

export const addNewDriver = ( name ) => {
  return {
    type: ADD_NEW_DRIVER,
    name: name.trim()
  };
};

export const submitFormError = () => {
  return {
    type: FORM_INCOMPLETE_ERROR
  };
};

export const removePhotoInstance = ( id ) => {
  return {
    type: REMOVE_PHOTO_INSTANCE,
    payload: id
  };
};