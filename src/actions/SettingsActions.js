import axios from 'axios';
import settings from '../../app.json';
import config from '../../backend.json';
import parseName from '../utility/parseName';
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

export const reportError = (fUseNames, webToken, comment, subscriberId, customerId, siteId, userId, gate, people, pending, events, eventId) => {
  return async ( dispatch ) => {
    dispatch({ type: REPORT_ERROR_START});
    const date = new Date();
    const now = date.toJSON()
    let eventList = []

    // standardize format same as syncEvent action
    if (eventId) {
      // this is a failed sync, so data is already formatted
      eventList = [...pending]
    } else {
      // reverse the list so when this is parsed, the oldest event gets saved first
      pending.reverse()

      for (let i = 0; i < pending.length; i++) {
        let eventObj = pending[i]

        const driverName = parseName(eventObj.driverObj.name)
        const usrId = eventObj.userId ? eventObj.userId : userId
        const gateId = eventObj.gateId ? eventObj.gateId : gate
        const subId = eventObj.subscriberId ? eventObj.subscriberId : subscriberId
        const custId = eventObj.customerId ? eventObj.customerId : customerId
        const stId = eventObj.siteId ? eventObj.siteId : siteId

        let eventData = {
          timestamp: eventObj.timestamp,
          bSubscriberId: subId,
          bCustomerId: custId,
          bUserId: usrId,
          bGateId: gateId,
          bSiteId: stId,
          bTypeId: eventObj.type,
          sLpn: eventObj.lpnObj.name,
          sCompany: eventObj.companyObj.name,
          sDriverFirst: driverName.first,
          sDriverLast: driverName.last,
          passengers: [],
          passengerCount: fUseNames ? 0 : eventObj.passengerCount, // to ensure data consistency, we will initialize this with 0 if names are required, and the value will be updated when we also already have our passenger names
          sLpnPhoto: '',
          sLoadPhoto: '',
          images: '',
          sComment: eventObj.comment,
          fUseNames: fUseNames,
        }

        if (fUseNames && eventObj.passengers) {
          eventData.passengers = people.filter(p => eventObj.passengers.includes(p.id)).map(p => { return {...parseName(p.name), id: p.id}})
          eventData.passengerCount = eventData.passengers.length
        }

        eventList.push(eventData)
      }
    }

    await axios({
      method: 'post',
       headers: {
      'Content-Accept': 'application-json',
      'Authorization': webToken
    },
      url: API_URL + 'api/errorreport',
      data: {
        subscriber: subscriberId,
        customer: customerId,
        user: userId,
        gate: gate,
        pending: JSON.stringify(eventList),
        device: Device.modelName + ': ' + Device.osName + ' : ' + Device.osVersion,
        version: version,
        timestamp: now,
        comment: comment
      },
      timeout: 10000
    })
    .then( async response => {

      dispatch({
        type: REPORT_ERROR_SUCCESS,
        // if we are reporting a failed sync, then remove it from our local list
        // else, if this is manually reported, then clear local list if user includes pending events in the report
        events: eventId ? events.filter(e => e.id !== eventId) : pending.length ? [] : events,
      });
    })
    .catch( error => {
      console.log(`Error reporting failed. ${eventId}`)
      dispatch({
        type: REPORT_ERROR_FAIL,
        events: events,
      });
    });
  }
}



