import config from '../../backend.json';
import axios from 'axios';
import deviceInfo from '../utility/deviceInfo';
import { getAppData } from './DataActions';

import { 
  LOGIN_USER_START,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGOUT_USER,
  CLEAR_FORM,
  CLEAR_LOGIN_ERROR,
  CLEAR_CUSTOMER_NETWORK_DATA,
  SET_ONSITE_COUNT
} from './types';

const API_URL = config.backend;

export const loginUser = ({ email, password }) => {
  return ( dispatch ) => {
    dispatch({ type: LOGIN_USER_START });

    axios({
      method: 'post',
      headers: {
        'Content-Accept': 'application-json'
      },
      url: API_URL + 'api/login?new=yes', 
      data: {
        username: email,
        password: password,
        sDevice: deviceInfo()
      }, 
      timeout: 10000
    })
    .then( async response => {
      if(!response || !response.data){
        throw new Error("Empty Server Response. Please retry.")
      };

      let user = response.data;

      if(!user.gateAclId || user.gateAclId !== 3){
        throw new Error("Only guard users may log into this application. Please make sure the user have access of type 'guard' under user setup.")
      };
      // get the data we need for startup - lpns, companies, people by customerId
      dispatch(getAppData(user.customerId, user.token));
      // log in the user and set user data in state
      loginUserSuccess( dispatch, user );
    })
    .catch( error => {
      console.log(error)
      if(error.toString().indexOf("500") > 0){
        alert("Login error. Please check credentials and try again.")
      } else {
        alert(error);
      }
      loginUserFail( dispatch,error )
    });
  };
};

const loginUserSuccess = ( dispatch, user ) => {
    dispatch({
      type: LOGIN_USER_SUCCESS,
      payload: user
    });
};

const loginUserFail = ( dispatch, error ) => {
  dispatch({
    type: LOGIN_USER_FAIL,
    payload: error
  });
};

export const logoutUser = (id, device) => {
  return ( dispatch ) => {
    dispatch({
      type: LOGOUT_USER,
      payload: device || ''
    });

    axios({
      method: 'get',
      headers: {
        'Content-Accept': 'application-json'
      },
      url: API_URL + 'logout/' + id + '/' + deviceInfo(),
      timeout: 10000
    })
    .then( response => {
      logoutUserSuccess( dispatch );
      })
    }
};

const logoutUserSuccess = ( dispatch ) => {
  dispatch({
    type: CLEAR_FORM
  });
};

export const clearLoginError = () => {
  return {
    type: CLEAR_LOGIN_ERROR
  };
};

export const getOnsiteCountBySite = ( siteId, token ) => {
  let targetUrl = API_URL + 'api/getonsitecountbysite/' + siteId + '?new=yes';
  return async ( dispatch ) => {
    await axios({
      method: 'get',
      headers: {
        'Content-Accept': 'application-json',
        'Authorization': token
      },
      url: targetUrl, 
      timeout: 15000
    })
    .then( response => {
      let data = response.data;
      let vehicleCount = data.bVehicleCount ? data.bVehicleCount : 0;
      let peopleCount = data.bOnsiteCount ? data.bOnsiteCount : 0;

      dispatch({ 
        type: SET_ONSITE_COUNT, 
        vehicleCount: vehicleCount,
        peopleCount: peopleCount 
      })
    })
    .catch( error => {
      console.log(error);
      // dont update the counts state
    });
  }
};
