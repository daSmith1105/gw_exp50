import config from '../../backend.json';
import axios from 'axios';

import {
  GET_DATA_SUCCESS,
  GET_DATA_FAIL,
  SET_ONSITE_COUNT,
} from './types';

const API_URL = config.backend;

export const getAppData = (id, token) => {
  return( dispatch ) => {
    axios({
      method: 'get',
      headers: {
        'Content-Accept': 'application-json',
        'Authorization': token
      },
      url: `${API_URL}api/mobileappdata?id=${id}`,
      timeout: 10000
    })
    .then( response => {
      // console.log('getAppData response', response.data)
      if(!response || !response.data){
        throw new Error('No mobile app data returned from server.');
      };
      dispatch({
        type: GET_DATA_SUCCESS,
        payload: response.data
      });
    })
    .catch( (error) => {
      console.log('error getting app data: ', error);
      dispatch({ type: GET_DATA_FAIL });
    });
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
      console.log('Unable to get updated onsite count.');
      // dont update the counts state
    });
  }
};

export const setOnsiteCountByLocalEvents = () => {
  return {
    type: SET_ONSITE_COUNT,
    vehicleCount: 0,
    peopleCount: 0,
  }
}
