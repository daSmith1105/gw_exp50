import {
  CLEAR_FORM,
  HANDLE_INPUT_CHANGE,
  ADD_NEW_LPN,
  ADD_NEW_COMPANY,
  ADD_NEW_DRIVER,
  FORM_INCOMPLETE_ERROR,
  SHOW_CAMERA,
  TAKE_PHOTO_SUCCESS,
  SAVE_ADDITIONAL_PHOTO,
  REMOVE_PHOTO_INSTANCE,
  MODIFY_EXISTING_PHOTO,
  SHOW_CAMERA_MODIFIED,
  LOGOUT_USER,
  PURGE_ALL_DATA,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = {
  uploading: false,
  formIncompleteError: false,
  lpnText: '',
  companyText: '',
  driverText: '',
  comment: '',
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
    case RESET_REDUCER_GROUP:
    case PURGE_ALL_DATA:
    case CLEAR_FORM:
    case LOGOUT_USER:
      return {...INITIAL_STATE}

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
        passengers: []
      };
    case ADD_NEW_COMPANY:
      return {
        ...state,
        selectedCompany: ['0'],
        selectedDriver: [],
        passengers: []
      };
    case ADD_NEW_DRIVER:
      return {
        ...state,
        selectedDriver: ['0'],
        passengers: []
      };
    case SHOW_CAMERA:
      return {
        ...state,
        imageType: action.name
      };
  // Modification to existing Photo
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
        uploading: false
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
      };
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
      default:
        return state;
    };
};
