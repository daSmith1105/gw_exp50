import axios from 'axios';
import settings from '../../app.json';
import config from '../../backend.json';
import * as Device from 'expo-device';
import { 
  TOGGLE_SETTINGS_MENU,
  TOGGLE_LOGIN,
  REPORT_ERROR_START,
  REPORT_ERROR_SUCCESS,
  REPORT_ERROR_FAIL,
  HIDE_REPORTS_MODAL
} from './types';

const API_URL = config.backend;
const version = settings.expo.version;


export const toggleSettingsMenu = () => {
  return {
    type: TOGGLE_SETTINGS_MENU
  }
};

export const toggleLogin = () => {
  return  {
    type: TOGGLE_LOGIN
  };
};

export const closeReportModal = () => {
  return { 
    type: HIDE_REPORTS_MODAL
  };
};

export const reportError = (webToken,comment,subscriber,customer,user,gate,pending) => {
  return async ( dispatch ) => {
    dispatch({ type: REPORT_ERROR_START});
    const date = new Date();
    const now = date.toJSON()

    await axios({
      method: 'post',
       headers: {
      'Content-Accept': 'application-json',
      'Authorization': webToken
    },
      url: API_URL + 'api/errorreport', 
      data: {
        subscriber: subscriber,
        customer: customer,
        user: user,
        gate: gate,
        pending: pending,
        device: Device.modelName + ': ' + Device.osName + ' : ' + Device.osVersion,
        version: version,
        timestamp: now,
        comment: comment
      }, 
      timeout: 10000
    })
    .then( async response => {

      dispatch({type: REPORT_ERROR_SUCCESS, payload: pending });
    })
    .catch( error => {
      dispatch({type: REPORT_ERROR_FAIL});
    });
  }
}



