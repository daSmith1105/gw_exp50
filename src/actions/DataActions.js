import config from '../../backend.json';
import axios from 'axios';

import { 
  GET_DATA_SUCCESS,
  GET_DATA_FAIL
} from './types';

const API_URL = config.backend;

export const getAppData = (id, token) => {
  console.log('started get app data')
  return( dispatch ) => {
    axios({
      method: 'get',
      headers: {
        'Content-Accept': 'application-json',
        'Authorization': 'JWT ' + token
      },
      url: `${API_URL}api/mobileappdata?id=${id}`, 
      timeout: 10000
    })
    .then( response => {
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
