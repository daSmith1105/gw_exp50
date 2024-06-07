import {
  LOGIN_USER_SUCCESS,
  GET_ASSIGNMENT_DATA_SUCCESS,
  GET_ASSIGNMENT_DATA_FAIL,
  LOGOUT_USER,
  RESET_REDUCER_GROUP // this is used when the app updates to a new version and we need to clear out the entire redux store
} from '../actions/types';

const INITIAL_STATE = {
  userFullName: '',
  firstName: '',
  lastName: '',
  customerName: '',
  customerId: '',
  subscriberName: '',
  subscriberId: '',
  userId: '',
  authId: '',
  assignmentId: '',
  gateName: '',
  gateId: '',
  siteId: '',
  siteName: '',
  fRequirePhotos: true,
  fUseNames: true,
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case LOGIN_USER_SUCCESS:
      const user = action.payload;
      return {
        ...state,
        userFullName: user.sFirst + ' ' + user.sLast,
        firstName: user.sFirst,
        lastName: user.sLast,
        customerName: user.customerName,
        customerId: user.customerId,
        subscriberId: user.subscriberId,
        subscriberName: user.subscriberName,
        userId: user.id,
        authId: user.gateAclId,
        assignmentId: user.gateAssignmentId,
        gateId: user.gateId,
        gateName: user.gateName,
        siteId: user.siteId,
        siteName: user.siteName,
        fRequirePhotos: user.fRequirePhotos === 1 ? true : false,
        fUseNames: user.fUseNames === 1 ? true : false,
      }
    // i dont think this is being used anywhere - cleanup in future
    case GET_ASSIGNMENT_DATA_SUCCESS :
      const data = action.payload;
      return {
        ...state,
        gateId: data.Gate.id,
        gateName: data.Gate.sName
      }
    // i dont think this is being used anywhere - cleanup in future
    case GET_ASSIGNMENT_DATA_FAIL :
      return {
        ...state,
        gateId: 0,
        gateName: 'No Gate Assignment',
        siteId: 0,
        siteName: 'No Site Found'
      };
    case RESET_REDUCER_GROUP:
    case LOGOUT_USER:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};