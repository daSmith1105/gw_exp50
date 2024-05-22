import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import config from '../../backend.json';
import parseName from '../utility/parseName';
import { SYNC_DATA } from './types';
import { reportError } from './SettingsActions';

const API_URL = config.backend;

// if sync failed, let's remove images that were stored in the server
const removeImagesFromServer = async (lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths, webToken) => {
  // console.log('removeImagesFromServer')

  const rollbackImage = async (path) => {
    if (!path) return
    await axios({
      method: 'get',
      headers: {
        'Authorization': webToken
      },
      url: API_URL + 'api/rollbackimage/' + path,
      timeout: 10000
    })
  }

  await rollbackImage(lpnPhotoDbPath);
  await rollbackImage(loadPhotoDbPath);
  for (let i = 0; i < additionalPhotosDbPaths.length; i++) {
    await rollbackImage(additionalPhotosDbPaths[i]);
  }
};

// if sync was successful, remove the images from the device cache
const removeImagesFromDevice = async (lpnPhoto, loadPhoto, additionalPhotos) => {
  // console.log('removeImageFromDevice')

  const rollbackImage = async (fileUri) => {
    if (fileUri) {
      const file = await FileSystem.getInfoAsync(fileUri);
      if (file.exists) {
        await FileSystem.deleteAsync(fileUri, { indempotent: true });
      }
    }
  }

  try {
    await rollbackImage(lpnPhoto);
    await rollbackImage(loadPhoto);
    for (let i = 0; i < additionalPhotos.length; i++) {
      await rollbackImage(additionalPhotos[i].path);
    }
  } catch (error) {
    // we are not gonna bail out on error within this function, so catching it to stop propagation
  }
};

// since syncing is not real time, images may no longer be valid during syncing
// so make sure there is a file on the device at the specified fileUri
const validateFilePath = async (fileUri) => {
  const file = await FileSystem.getInfoAsync(fileUri);
  // console.log('validateFilePath', fileUri, file)
  return file.exists
};

// handle upload lpn, load, and additional photos so we have the file path ready once we sync the event data
const uploadPhotos = async (fRequirePhotos, eventObj, webToken, gateId) => {
  // console.log('uploadPhotos')
  const uploadSinglePhoto = async (formData) => {
    // console.log('uploadSinglePhoto')
    const result = await axios({
      method: 'POST',
      headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': webToken
      },
      url: API_URL + 'api/upload/' + gateId,
      withCredentials: true,
      data: formData,

    }).then( res => {
      return res.data.path
    }).catch( (error) => {
      console.log('Uploading photos error:', error)
      return false;
    })
    return result
  }

  // upload lpn photo
  let lpnPhotoDbPath = '';
  if (eventObj.lpnPhoto && eventObj.lpnPhoto.length > 0 && await validateFilePath(eventObj.lpnPhoto)) {
    const cLpnPhoto = eventObj.lpnPhoto;
    const lpnUriParts = cLpnPhoto.split('.');
    const lpnFileType = lpnUriParts[lpnUriParts.length - 1];
    const lpnFormData = new FormData();
    lpnFormData.append('file', {
      uri: cLpnPhoto,
      name: `lpn.${lpnFileType}`,
      type: `image/${lpnFileType}`
    });
    lpnPhotoDbPath = await uploadSinglePhoto(lpnFormData)
  }

  // upload load photo
  let loadPhotoDbPath = '';
  if (eventObj.loadPhoto && eventObj.loadPhoto.length > 0 && await validateFilePath(eventObj.loadPhoto)) {
    const cLoadPhoto = eventObj.loadPhoto;
    const loadUriParts = cLoadPhoto.split('.');
    const loadFileType = loadUriParts[loadUriParts.length - 1];
    const loadFormData = new FormData();
    loadFormData.append('file', {
      uri: cLoadPhoto,
      name: `load.${loadFileType}`,
      type: `image/${loadFileType}`
    });
    loadPhotoDbPath = await uploadSinglePhoto(loadFormData)
  }

  // upload additional photos
  let additionalPhotosDbPaths = [];
  if (eventObj.additionalPhotos && eventObj.additionalPhotos.length > 0) {
    const cAdditionalPhotos = eventObj.additionalPhotos;
    for( let i = 0; i < cAdditionalPhotos.length; i++ ) {
      const label = cAdditionalPhotos[i].label;
      const uriParts = cAdditionalPhotos[i].path.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const formData = new FormData();
      formData.append('file', {
        uri: cAdditionalPhotos[i].path,
        name: `${label}.${fileType}`,
        type: `image/${fileType}`
      });
      if (await validateFilePath(cAdditionalPhotos[i].path)) {
        const path = await uploadSinglePhoto(formData)
        if (path) {
          additionalPhotosDbPaths.push(path)
        }
      }
    };
  }

  // if lpn or load photos fail, revert and bail out
  // since additional photos are optional, let's not bail out for it if it fails
  if (fRequirePhotos && (!lpnPhotoDbPath || !loadPhotoDbPath)) {
    await removeImagesFromServer(lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths, webToken)
  }
  return [lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths]
}

// update our local list with orresponding ids from database
const updateLocalIds = (lpnList, companyList, peopleList, eventList, eventObj, dbIds) => {
  const personIds = [...dbIds.passengerIds, {old: eventObj.driverObj.id, new: dbIds.personId}]
  // console.log('updateLocalIds', {lpnList, companyList, peopleList, eventList, eventObj, dbIds, personIds})

  // update our local lpn list with the ids from database
  // note that we should not be changing associations here in sync, we will simply find and replace
  // the SAVE_EVENT action handles updating the corresponding company/person of an lpn
  for (let i = 0; i < lpnList.length; i++) {
    if (isNaN(parseInt(lpnList[i].id)) && lpnList[i].id === eventObj.lpnObj.id) {
      lpnList[i].id = dbIds.lpnId
    }

    if (isNaN(parseInt(lpnList[i].company)) && lpnList[i].company === eventObj.companyObj.id) {
      lpnList[i].company = dbIds.companyId
    }

    const pId = personIds.find(p => isNaN(parseInt(p.old)) && p.old === lpnList[i].person)
    if (pId) {
      lpnList[i].person = pId.new
    }
  }

  // update our local company list with the id from database
  companyList = companyList.map(c => isNaN(parseInt(c.id)) && c.id === eventObj.companyObj.id ? {...c, id: dbIds.companyId} : c)

  // passengers share the same people list with drivers, update people list with corresponding ids from database
  for (let i = 0; i < personIds.length; i++) {
    const pId = personIds[i]
    peopleList = peopleList.map(p => isNaN(parseInt(p.id)) && p.id === pId.old ? {...p, id: pId.new} : p)
  }

  // update our local event list with ids from database
  for (let i = 0; i < eventList.length; i++) {
    if (isNaN(parseInt(eventList[i].lpnObj.id)) && eventList[i].lpnObj.id === eventObj.lpnObj.id) {
      eventList[i].lpnObj.id = dbIds.lpnId
    }

    if (isNaN(parseInt(eventList[i].companyObj.id)) && eventList[i].companyObj.id === eventObj.companyObj.id) {
      eventList[i].companyObj.id = dbIds.companyId
    }

    const pId = personIds.find(p => isNaN(parseInt(p.old)) && p.old === eventList[i].driverObj.id)
    if (pId) {
      eventList[i].driverObj.id = pId.new
    }

    for (let x = 0; x < eventList[i].passengers.length; x++) {
      const pId = personIds.find(p => isNaN(parseInt(p.old)) && p.old === eventList[i].passengers[x])
      if (pId) {
        eventList[i].passengers[x] = pId.new
      }
    }
  }

  return {lpnList, companyList, peopleList, eventList}
}

// this syncs one event at a time as such, we aim to make it as lightweight as possible
// so for each iteration of an event in the pending list, we will only do what's necessary (sync a local event to server - still making sure of data integrity and no duplicates)
// and handle other functionalities outside the iteration (getting updated list)
export const syncEvent = (fRequirePhotos, webToken, userId, gate, subscriberId, customerId, lpns, companies, people, events) => {
  // console.log('syncEvent action start', {webToken, userId, gate, subscriberId, customerId, lpns, companies, people, events})

  // upload one event at a time - start from the very first not synced event
    // upload photos - this is separate API if lpn/load photos fail, bail out
    // upload event - check if lpn/company/people already exists, if yes - update that data in db, and use that id - wrap this in a transaction
      // this is all done in the backend, what gets returned is only fail or success (with eventId, lpnid, company id, people id)
      // note that lpn-company-people are all tied up - so don't partially upload lpn/company/people
      // if fail - revert the photos and console log
        // should we remove the lpn/company/people for this event in the state?
          // no - keep it in case other events are using it
          // how do we clean up the select list for values that were not synced?
            // wil not clean it up so they can continue to use it to prepopulate the form until another event it's linked to gets uploaded
      // success - remove lpn/company/people from our state - then getAppData will handle refilling our select-list states with updated data from db this will also ensure no duplicates
        // what if on the next event we are using the same lpn/company/people
          // 'events' state has its own lpn/company/people object data which can be used by the backend
            //  the backend should be able to handle existing lpn/company/people - check sName
      // always remove the event that we are currently processing in our state - whether success/fail
    // if there's still events to be synced - repeat the process
      // should we not call getAppData after this one sync?
        // i'm trying to make the sync as lightweight as possible - so only call getAppData if we're done/pausing events sync
    // else call getAppData
      // this will refresh the list with recently synced event as well as other events from db

  return async( dispatch ) => {
    const types = {1: "IN", 2: "OUT", 3: "DENIED", 4: "ACCIDENT" }
    let lpnList = [...lpns]
    let companyList = [...companies]
    let peopleList = [...people]
    let eventList = [...events]

    // processing oldest unsynced event that did not previously had error
    const eventObj = [...events].filter(e => !e.error).reverse()[0]
    const eventIndex = eventList.findIndex(e => e.timestamp === eventObj.timestamp)
    if (!eventObj) {
      // if we're here, all local events have been tried to sync before and failed
      // are we gonna retry the oldest one and re-sync? note that when it first failed, we created a report for it
      // there's a report parsing in the backend that turns it into GateEvent entry, so not sure if re-syncing this will create a duplicate entry once report is parsed
      // for now, to be confirmed - so abort!
      console.log('Aborting sync, all local events have previously failed syncing and has been reported.')
      return
    }
    // console.log('uploadEvent', eventIndex, eventObj)

    // if event was saved while not logged in, use current user's data to fill in the empty values
    const usrId = eventObj.userId ? eventObj.userId : userId
    const gateId = eventObj.gateId ? eventObj.gateId : gate
    const subId = eventObj.subscriberId ? eventObj.subscriberId : subscriberId
    const custId = eventObj.customerId ? eventObj.customerId : customerId

    try {
      const driverName = parseName(eventObj.driverObj.name)
      let passengers = []
      if (eventObj.passengers) {
        passengers = people.filter(p => eventObj.passengers.includes(p.id)).map(p => { return {...parseName(p.name), id: p.id}})
      }

      // upload photos
      const [lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths] = await uploadPhotos(fRequirePhotos, eventObj, webToken, gateId)
      if (fRequirePhotos && (!lpnPhotoDbPath || !loadPhotoDbPath)) throw new Error('Error uploading photos.')

      // upload event
      await axios({
        method: 'post',
        headers: {
          'Authorization': webToken
        },
        url: API_URL + 'api/gateeventV4',
        data: {
          timestamp: eventObj.timestamp,
          bSubscriberId: subId,
          bCustomerId: custId,
          bUserId: usrId,
          bGateId: gateId,
          bTypeId: eventObj.type,
          sLpn: eventObj.lpnObj.name,
          sCompany: eventObj.companyObj.name,
          sDriverFirst: driverName.first,
          sDriverLast: driverName.last,
          sLpnPhoto: lpnPhotoDbPath,                                                          // Optional - based on gate settings
          sLoadPhoto: loadPhotoDbPath,                                                        // Optional - based on gate settings
          images: additionalPhotosDbPaths.length > 0 ? additionalPhotosDbPaths.join() : '',   // Optional
          sComment: eventObj.comment,                                                         // Optional
          passengerCount: eventObj.passengerCount,                                            // Optional
          passengers: passengers,                                                             // Optional - based on gate settings
        },
        timeout: 8000,

      }).then( async (response) => {
        console.log(`${eventObj.timestamp} | (${eventObj.lpnObj.name} - ${types[eventObj.type]}) - event uploaded successfully!`)
        eventList.splice(eventIndex, 1) // this event has been successfully synced, so let's remove it in our local list

        const newList = updateLocalIds(lpnList, companyList, peopleList, eventList, eventObj, response.data)
        lpnList = newList.lpnList
        companyList = newList.companyList
        peopleList = newList.peopleList
        eventList = newList.eventList

        // remove the localPhotos for this event from the device since they were successful
        await removeImagesFromDevice(eventObj.lpnPhoto, eventObj.loadPhoto, eventObj.additionalPhotos, webToken)

      }).catch( async (error) => {
        // console.log(error.message) // to see internal error message

        // rollback images saved to server if they were already uploaded and we bombed out
        await removeImagesFromServer(lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths, webToken)
        throw new Error('Error uploading event.')
      })

    } catch (error) {
      // report this failed event and mark this event entry with the error message, this way, we don't have to deal with re-ordering eventlist
      // at the same time, we can skip/delay syncing of failed events until all "good" events have been synced
      console.log('The sync function encountered an error.', error.message)

      if (eventList[eventIndex]) {
        // if we got an error before/during API call, let's report it
        eventList[eventIndex].error = error.message
        dispatch(reportError(webToken, error.message, subId, custId, userId, gateId, JSON.stringify([eventObj])))
      }

      // if error happened after API call (somewhere in the promise "then"), then no need to report, it's already in the server
      // we might end up with dangling data, but that's bearable for now, what's important is we don't loose any data
    }

    dispatch ({
      type: SYNC_DATA,
      lpns: lpnList,
      companies: companyList,
      people: peopleList,
      events: eventList,
    });
  }
}