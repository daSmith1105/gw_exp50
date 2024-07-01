import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import config from '../../backend.json';
import { SYNC_DATA } from './types';

const API_URL = config.backend;

// if sync failed, let's remove images that were stored in the server
const removeImagesFromServer = async (lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths, webToken) => {
  // console.log('removeImagesFromServer')

  const rollbackImage = async (path) => {
    if (!path) return
    await axios({
      method: 'get',
      headers: {
        'Content-Accept': 'application-json',
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
const uploadPhotos = async (eventObj, webToken, gateId) => {
  // console.log('uploadPhotos')
  const uploadSinglePhoto = async (formData) => {
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
  if (!lpnPhotoDbPath || !loadPhotoDbPath) {
    await removeImagesFromServer(lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths, webToken)
  }
  return [lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths]
}

// this syncs one event at a time as such, we aim to make it as lightweight as possible
// so for each iteration of an event in the pending list, we will only do what's necessary (sync a local event to server - still making sure of data integrity and no duplicates)
// and handle other functionalities outside the iteration (getting updated list)
export const syncEvent = (webToken, userId, gate, subscriberId, customerId, lpns, companies, people, events) => {
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
    let lpnList = [...lpns]
    let companyList = [...companies]
    let peopleList = [...people]
    let eventList = [...events]
    const eventObj = eventList.pop() // processing oldest unsynced event
    const gateId = eventObj.gateId ? eventObj.gateId : gate; // if the event was saved without a gateId, attach our current gateId

    try {
      // console.log('uploadEvent', eventObj)

      // upload photos
      const [lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths] = await uploadPhotos(eventObj, webToken, gateId)
      // console.log('photos', {lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths})
      if (!lpnPhotoDbPath || !loadPhotoDbPath) throw new Error('Error uploading photos.')

      // upload event
      await axios({
        method: 'post',
        headers: {
          'Authorization': webToken
        },
        url: API_URL + 'api/gateeventV4',
        data: {
          timestamp: eventObj.timestamp,
          bSubscriberId: eventObj.subscriberId ? eventObj.subscriberId : subscriberId,      // if the event was saved without a subscriberId, attach our current subscriberId
          bCustomerId: eventObj.customerId ? eventObj.customerId : customerId,              // if the event was saved without a customerId, attach our current customerId
          bUserId: eventObj.userId ? eventObj.userId : userId,                              // if the event was saved without a userId, attach our current userId
          bGateId: gateId,
          bTypeId: eventObj.type,
          sLpn: eventObj.lpnObj.name,
          sCompany: eventObj.companyObj.name,
          sDriverFirst: eventObj.driverObj.name.split(' ')[0],
          sDriverLast: eventObj.driverObj.name.split(' ')[1] || '',
          bLpnId: eventObj.lpnObj.id && !isNaN(eventObj.lpnObj.id) ? eventObj.lpnObj.id : 0,
          bCompanyId: eventObj.companyObj.id && !isNaN(eventObj.companyObj.id) ? eventObj.companyObj.id : 0,
          bDriverId: eventObj.driverObj.id && !isNaN(eventObj.driverObj.id) ? eventObj.driverObj.id : 0,
          sLpnPhoto: lpnPhotoDbPath,
          sLoadPhoto: loadPhotoDbPath,
          images: additionalPhotosDbPaths.length > 0 ? additionalPhotosDbPaths.join() : '',   // Optional
          sComment: eventObj.comment,                                                         // Optional
          passengerCount: eventObj.passengerCount                                             // Optional
        },
        timeout: 8000,

      }).then( async (response) => {
        // console.log('uploadEvent response', response.data)
        const { eventId, lpnId, companyId, personId } = response.data
        console.log(`event ${eventId} uploaded successfully!`)

        // delete the corresponding lpn/company/people values in the state
        // getAppData will be the one to handle refilling the removed select-list values with latest info from db
        lpnList = lpnList.filter(l => (l.id !== eventObj.lpnObj.id && l.id !== lpnId))
        companyList = companyList.filter(c => (c.id !== eventObj.companyObj.id && c.id !== companyId))
        peopleList = peopleList.filter(p => (p.id !== eventObj.driverObj.id && p.id !== personId))

        // remove the localPhotos for this event from the device since they were successful
        await removeImagesFromDevice(eventObj.lpnPhoto, eventObj.loadPhoto, eventObj.additionalPhotos, webToken)

      }).catch( async (error) => {
        // console.log('Uploading event error:', error)
        // rollback images saved to server if they were already uploaded and we bombed out
        await removeImagesFromServer(lpnPhotoDbPath, loadPhotoDbPath, additionalPhotosDbPaths, webToken)
        throw new Error('Error uploading event.')
      })

    } catch (error) {
      console.log('The sync function encountered an error.', error)
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