import config from '../../backend.json';
import axios from 'axios';
import parseName from '../utility/parseName';

import {
  GET_DATA_SUCCESS,
  GET_DATA_FAIL,
  SET_UPLOADING,
  SET_ONSITE_LIST_LOADING,
  SET_ONSITE_LIST,
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

export const setUploading = (value) => {
  return {
    type: SET_UPLOADING,
    payload: value,
  }
}

export const getOnsiteList = (siteId, token, events, people, fUseNames) => {
  return async (dispatch) => {
    dispatch({
      type: SET_ONSITE_LIST_LOADING,
      payload: true,
    })

    let serverList = {people: [], peopleCount: 0, vehicle: [], vehicleCount: 0}

    if (siteId) {
      serverList = await axios({
        url: `${API_URL}api/getonsitelistbysite/${siteId}`,
        method: 'get',
        headers: {
          'Authorization': token
        },
        timeout: 15000
      })
      .then( response => {
        return response.data

      }).catch( error => {
        console.log(error)
        console.log('Unable to get onsite list.');
      })
    }

    const data = mergeLocalList(serverList, events, people, fUseNames)
    dispatch({
      type: SET_ONSITE_LIST,
      payload: data,
    })
  }
}

const mergeLocalList = (serverList, events, people, fUseNames) => {

  // merge list received from server, with list from local (not-yet-uploaded) events
  let onsiteList = {...serverList}

  // run thru our local events starting from the oldest one and add/delete entries based on the event type
  let localEvents = [...events]

  // filter in/out (1/2) events only since onsite list does not change for the other types
  localEvents = localEvents.filter(e => [1,2].includes(e.type)).reverse()

  for (let i = 0; i < localEvents.length; i++) {
    // process this same as in backend (see gateevent.updateOnsite)
    const event = localEvents[i]
    const lpn = event.lpnObj.name.replace(/[^a-zA-Z0-9]/g, "-")
    const company = event.companyObj.name.replace(/[^a-zA-Z0-9\s]/g, "-")

    // create array of person names
    let persons = []
    persons.push(event.driverObj.name.replace(/[^a-zA-Z0-9 ]/g, "-"))
    if (fUseNames && event.passengers) {
      let passengers = people.filter(p => event.passengers.includes(p.id))
      for (let i = 0; i < passengers.length; i++) {
        persons.push(Object.values(parseName(passengers[i].name)).join(' ').replace(/[^a-zA-Z0-9 ]/g, "-"))
      }
    }

    if (event.type === 1) {
      // create entries for persons
      for (let i = 0; i < persons.length; i++) {
        let localP = {
          sPersonName: persons[i],
          sLpn: lpn,
          sCompany: company,
          bPassengerCount: event.passengerCount,
          dTimestamp: event.timestamp,
          sNote: '',
        }
        onsiteList.people.push(localP)
        onsiteList.peopleCount++
      }

      if (!fUseNames) {
        onsiteList.peopleCount += event.passengerCount
      }

      // create entries for vehicle
      let localV = {
        sLpn: lpn,
        sCompany: company,
        bPersonCount: fUseNames ? persons.length : (event.passengerCount + 1),
        dTimestamp: event.timestamp,
        sNote: '',
      }
      onsiteList.vehicle.push(localV)
      onsiteList.vehicleCount++

    } else if (event.type === 2) {
      // this is for OUT events

      // remove people for this lpn
      if (!fUseNames) {
        onsiteList.people = onsiteList.people.filter(p => p.sLpn !== lpn)
        onsiteList.peopleCount -= (event.passengerCount + 1)

      } else {
        // update people list based on different scenario
        for (let i = 0; i < onsiteList.people.length; i++) {
          const o = onsiteList.people[i]

          if (persons.includes(o.sPersonName) && (o.sLpn === lpn || o.sLpn === '' || o.sCompany === company)) {
            delete onsiteList.people[i]
            onsiteList.peopleCount--
          } else if (o.sLpn === lpn) {
            onsiteList.people[i].sLpn = ''
            onsiteList.people[i].sNote += `\nVehicle ${lpn} already left at ${o.dTimestamp} without this passenger.`
          } else if (persons.includes(o.sPersonName)) {
            onsiteList.people[i].sNote += `\nA passenger with the same name left at ${o.dTimestamp} in vehicle ${lpn}. If this is a different person, please ignore this.`
          }
        }
        // cleanup the people list with empty rows
        onsiteList.people = onsiteList.people.filter(o => o)
      }

      // remove vehicle entry if lpn matches
      onsiteList.vehicle = onsiteList.vehicle.filter(v => v.sLpn !== lpn)
      onsiteList.vehicleCount--
    }
  }

  return onsiteList
}
