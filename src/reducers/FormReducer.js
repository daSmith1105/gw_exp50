import {
  CLEAR_FORM,
  HANDLE_INPUT_CHANGE,
  ADD_NEW_LPN,
  ADD_NEW_COMPANY,
  ADD_NEW_DRIVER,
  ADD_NEW_PASSENGERS,
  FORM_INCOMPLETE_ERROR,
  SHOW_CAMERA,
  TAKE_PHOTO_SUCCESS,
  SAVE_ADDITIONAL_PHOTO,
  REMOVE_PHOTO_INSTANCE,
  MODIFY_EXISTING_PHOTO,
  SHOW_CAMERA_MODIFIED,
  LOGOUT_USER,
  APP_VERSION_CHANGED,
} from '../actions/types';

const INITIAL_STATE = {
  formIncompleteError: false,
  lpnText: '',
  companyText: '',
  driverText: '',
  comment: '',
  passengers: [],
  passengerCount: 0,
  isNewLpn: false,
  isNewCompany: false,
  isNewDriver: false,
  selectedEventType: [],
  selectedLpn: [],
  selectedCompany: [],
  selectedDriver: [],
  imageType: '',
  lpnPhotoUri: '',
  loadPhotoUri: '',
  loadPhoto: '',
  lpnPhoto: '',
  currentPhoto: '',
  photoCount: 0,
  maxAdditionalPhotos: 6,
  additionalPhotos: [],
  maxPhotosReached: false,
  additionalPhotosForUpload: []
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case HANDLE_INPUT_CHANGE:
      return {
        ...state,
        [ action.name ]: action.value
      };
    case ADD_NEW_LPN:
      return {
        ...state,
        selectedLpn: ['0'],
        selectedCompany: [],
        selectedDriver: [],
        passengers: [],
        passengerCount: 0,
      };
    case ADD_NEW_COMPANY:
      return {
        ...state,
        selectedCompany: ['0'],
      };
    case ADD_NEW_DRIVER:
      return {
        ...state,
        selectedDriver: ['0'],
      };
    case ADD_NEW_PASSENGERS:
      return {
        ...state,
        passengers: action.passengers,
        passengerCount: action.passengers.length,
      };
    case SHOW_CAMERA:
      return {
        ...state,
        imageType: action.name
      };
    case SHOW_CAMERA_MODIFIED:
      return {
        ...state,
        imageType: action.name,
        currentPhoto: action.id
      };
    case FORM_INCOMPLETE_ERROR:
      return {
        ...state,
        formIncompleteError: true,
      };
    case TAKE_PHOTO_SUCCESS:
      return {
        ...state,
        [ action.label + 'PhotoUri' ] : action.path
      };
    case SAVE_ADDITIONAL_PHOTO:
        const newPhoto = { id: action.id, label: action.label, path: action.path };
        if ( state.photoCount + 1 < state.maxAdditionalPhotos && state.maxPhotosReached === false ) {
        return {
          ...state,
          additionalPhotos : [ ...state.additionalPhotos, newPhoto ],
          photoCount: state.photoCount + 1,
        };
      } else {
        return {
          ...state,
          additionalPhotos : [ ...state.additionalPhotos, newPhoto ],
          photoCount: 6,
          maxPhotosReached: true
        };
      }
    case MODIFY_EXISTING_PHOTO:
      let newState1 = [ ...state.additionalPhotos ];
      const objPos1 = newState1.findIndex( obj => obj.id === action.id );
      newState1.splice( objPos1, 1, { 'id': action.id, 'label': action.label, 'path': action.path } );
      return {
        ...state,
        additionalPhotos: newState1,
        currentPhoto: ''
      };
    case REMOVE_PHOTO_INSTANCE:
      let newState2 = [ ...state.additionalPhotos ];
      const objPos2 = newState2.findIndex( obj => obj.id === action.payload );
      newState2.splice( objPos2, 1 );
      return {
        ...state,
        additionalPhotos: newState2,
        photoCount: state.photoCount - 1,
        maxPhotosReached: false
      };
    case APP_VERSION_CHANGED:
    case CLEAR_FORM:
    case LOGOUT_USER:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};
