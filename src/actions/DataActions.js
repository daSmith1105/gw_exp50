import config from '../../backend.json';
import axios from 'axios';
import parseName from '../utility/parseName';

import {
  GET_DATA_SUCCESS,
  GET_DATA_FAIL,
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
      url: `${API_URL}api/mobileappdataV51?id=${id}`,
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

export const getOnsiteList = (siteId, token, events, people) => {
  return async (dispatch) => {
    dispatch({
      type: SET_ONSITE_LIST_LOADING,
      payload: true,
    })

    let serverList = {people: [], peopleCount: 0, vehicle: [], vehicleCount: 0}

    if (siteId) {
      serverList = await axios({
        url: `${API_URL}api/getonsitelistbysiteV51/${siteId}`,
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

    const data = mergeLocalList(serverList, events, people)
    dispatch({
      type: SET_ONSITE_LIST,
      payload: data,
    })
  }
}

const mergeLocalList = (serverList, events, people) => {
  // console.log('mergeLocalList', {serverList, events, people})

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
    if (event.passengers && event.passengers.length) {
      let passengers = people.filter(p => event.passengers.includes(p.id))
      for (let x = 0; x < passengers.length; x++) {
        persons.push(Object.values(parseName(passengers[x].name)).join(' ').replace(/[^a-zA-Z0-9 ]/g, "-"))
      }
    } else {
      // if we have no passenger names but have passenger count, then create one entry for it with empty name
      persons = persons.concat(Array(event.passengerCount).fill(''))
    }

    if (event.type === 1) {
      // create vehicle entry
      let localV = {
        sLpn: lpn,
        sCompany: company,
        dTimestamp: event.timestamp,
        sNote: '',
      }
      onsiteList.vehicle.push(localV)
      onsiteList.vehicleCount++

      // create entries for persons
      for (let x = 0; x < persons.length; x++) {
        let localP = {
          id: `${event.id}-${x}`, // just a random identifier for this row to be used when removing people entry on OUT event
          sPersonName: persons[x],
          sLpn: lpn,
          sCompany: company,
          dTimestamp: event.timestamp,
          sNote: '',
        }
        onsiteList.people.push(localP)
        onsiteList.peopleCount++
      }

    } else if (event.type === 2) {
      // remove vehicle entry if lpn matches
      // for special cases (user error) where OUT event exist for this lpn, but no IN event, then we don't do anything
      if (onsiteList.vehicle.find(v => v.sLpn === lpn)) {
        onsiteList.vehicle = onsiteList.vehicle.filter(v => v.sLpn !== lpn)
        onsiteList.vehicleCount--
      }

      // remove people
      for (let x = 0; x < persons.length; x++) {
        // if only we are not worried of multiple people having the same name, then we could just remove the first one that matches the name
        // since we are supporting that possibility
        //    if there are multiple entries for the same name, then we have to remove the one that best matches this person in the following order:
        //      same lpn, same company, same name
        // if name not found - then remove from random passengers list (sPersonName empty)
        // if there are no random "unnamed" passengers to remove, just remove 1 row from our onsite list so our people count is correct
        //    detailed explanation on this - see backend gateevent.updateOnsite

        const name = persons[x]
        let idToRemove = 0

        const filteredNames = onsiteList.people.filter(p => p.sPersonName === name)
        for (let z = 0; z < filteredNames.length; z++) {
          const p = filteredNames[z]
          if (p.sLpn === lpn) {
            // we got the best match so exit
            idToRemove = p.id
            break
          } else if (p.sCompany === company) {
            // this is our 2nd choice, so let's continue looping until we get the best match
            idToRemove = p.id
          }
        }

        if (!idToRemove && filteredNames.length) {
          // we did not get our first and 2nd option, so just get 1 that matched the name
          idToRemove = filteredNames[0].id
        }

        if (!idToRemove) {
          // no onsite list matched this person's name at all, so let's remove from "unnamed" passengers
          // we only have unnamed passenger entries if fUseNames = 0 when event was saved
          const pass = onsiteList.people.find(p => p.sPersonName === '')
          if (pass) {
            idToRemove = pass.id
          }
        }

        // we are erring on the side caution and not randomly removing a totally different named person - even if it will cause incorrect actual onsite count - at least we are able to keep track of named persons that did not get out
        // if (!idToRemove && onsiteList.people.length) {
        //   // we are at the end of the road, we just desperately need to remove 1 row so our people count is correct
        //   idToRemove = onsiteList.people[0].id
        // }

        if (idToRemove) {
          onsiteList.people = onsiteList.people.filter(p => p.id !== idToRemove)
          onsiteList.peopleCount--
        } else {
          // if we don't have an onsite list, but there is an OUT event, then we don't do anything - just stating the obvioooous as a reminder to me ;(
        }
      }
    }
  }

  return onsiteList
}
