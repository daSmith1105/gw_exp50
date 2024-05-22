import {
  CLEAR_FORM,
  HANDLE_INPUT_CHANGE,
  ADD_NEW_LPN,
  ADD_NEW_COMPANY,
  ADD_NEW_DRIVER,
  ADD_NEW_PASSENGERS,
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
    name: name,
  };
};

export const addNewCompany = ( name ) => {
  return {
    type: ADD_NEW_COMPANY,
    name: name,
  };
};

export const addNewDriver = ( name ) => {
  return {
    type: ADD_NEW_DRIVER,
    name: name,
  };
};

export const addPassengers = ( people, passengers ) => {
  return {
    type: ADD_NEW_PASSENGERS,
    people,
    passengers,
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