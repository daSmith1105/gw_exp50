import {
  LOGIN_USER_SUCCESS,
  LOGOUT_USER,
  APP_VERSION_CHANGED,
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
      };
    case LOGOUT_USER:
    case APP_VERSION_CHANGED:
      return {...INITIAL_STATE};
    default:
      return state;
  };
};