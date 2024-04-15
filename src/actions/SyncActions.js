import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import config from '../../backend.json';
import { getAppData } from './DataActions';
import { 
  SYNC_DATA
} from './types';

const API_URL = config.backend;

// merge 2 arrays of objects on a given property - b array items will replace a array items - a = old, b = new
const merge = (a, b, property) => a.filter( aa => ! b.find ( bb => aa[property] === bb[property]) ).concat(b);

// delete an object with supplied id
const removeItem = ( arr, id ) => {
  for(let i = 0; i < arr.length; i++) {
    if(arr[i].id == id) {
        arr.splice(i, 1);
        break;
    };
  };
};

const rollbackImageSave = async(path, webToken) => {
  axios({
    method: 'get',
    headers: {
      'Content-Accept': 'application-json',
      'Authorization': webToken
    },
    url: API_URL + 'api/rollbackimage/' + path, 
    timeout: 10000
  })
  .then( () => {
    console.log('image removed successfully from db')
  })
  .catch( error => {
    console.log(error)
  })
};

const removeImageFromDevice = async (fileUri) => {
  // setting indempotent: true, do not throw an error if the file is not found
  const fileExists = FileSystem.getInfoAsync(fileUri);
  Promise.all([fileExists])
  .then( async data => {
    if( data[0].exists ){
      await FileSystem.deleteAsync(fileUri, { indempotent: true });
    }
  })
};

// make sure ther is a file on the device at the specified fileUri
const validateFilePath = async (fileUri) => {
  const isThere = await FileSystem.getInfoAsync(fileUri);
  await Promise.all([ isThere ])
  .then( data => {
    return data[0].exists
  })
};

// make sure we don't have malformed event data before upload
const validateEvent = (ev) => {
  let result = true;
  // we really only care about the main id values for saving the event
  // we needed the other ids in each object for displaying the event in the event viewer
  if (!ev.lpnObj.id || isNaN( parseInt(ev.lpnObj.id) )) {
    result = false;
  };
  if (!ev.companyObj.id || isNaN( parseInt(ev.companyObj.id) )) {
    result = false;
  };
  if (!ev.driverObj.id || isNaN( parseInt(ev.driverObj.id) )) {
    result = false;
  };
  return result;
};

//To Do: 
// when calling to get updated lpns, companies, or people - 
//     send along a list of ids that we have already,
//     then db should compare and return only the data we are missing 


// if a lpn, company, person, or lpn fail due to being misformed - we need to remove that from our local state and remove anything that depended on it
// instead of throwing away the entire event we may want to put in some default value so don't lose everything pertaining to that event
let eventsLo = [];
export const syncData = ( resolve, reject, token, user, gate, subscriber, customer, lpns, companies, people, events ) => {
  return async( dispatch ) => {
    console.log('fetching updated data... ')
    // if this value turns true at any point we need to kill this sync process and return
    let abort = false;
    // set current onsite counts to 0 before running the function - they will be updated at the end of sync
    let currentPeopleCount = 0;
    let currentVehicleCount = 0
    // our existing data
    let lpnsO = lpns;
    let companiesO = companies;
    let peopleO = people;
    eventsLo = events || [];
    // other variables we will need
    const webToken = token;
    const userId = user;
    const subscriberId = subscriber;
    const customerId = customer;

    let combinedLpns = [];
    let combinedCompanies = [];
    let combinedPeople = [];

    let lpnsForSync = [];
    let companiesForSync = [];
    let peopleForSync = [];

    let backupLpnId;
    let backupCompanyId;
    let backupPersonId; 

    let lpnPhotoDbPath = '';
    let loadPhotoDbPath = '';
    let additionalPhotosDbPaths = [];

    // get current lpns, companies, people from db and set
    const op1 = await axios({
                    method: 'get',
                    headers: {
                      'Content-Accept': 'application-json',
                      'Authorization': token
                    },
                    url: API_URL + 'api/gatelpnsbycustomerbasic/' + customerId, 
                    timeout: 8000
                  })
                  .then( response => {
                    if ( response.data && response.data.length > 0 ) {
                      return response.data.filter( l => l.deletedAt === null ).map( l => ( { id: l.id.toString(), name: l.sName, company: l.GateCompany && l.GateCompany.id ? l.GateCompany.id.toString() : '', person: l.GatePerson && l.GatePerson.id ? l.GatePerson.id.toString() : '' } ));
                    };
                    return [];
                  })
                  .catch( (error) => {
                    throw new Error('boom1! '+ error);
                  });

    const op2 = await axios({
                  method: 'get',
                  headers: {
                    'Content-Accept': 'application-json',
                    'Authorization': webToken
                  },
                  url: API_URL + 'api/gatecompaniesbycustomerbasic/' + customerId, 
                  timeout: 8000
                })
                .then( response => {
                  if ( response.data && response.data.length > 0 ) {
                    return response.data.filter( c => c.deletedAt === null ).map( c => ( { id: c.id.toString(), name: c.sName } ));
                  };
                  return [];
                })
                .catch( (error) => {
                  throw new Error('boom2! ' + error);
                });
    

    const op3 = await axios({
                  method: 'get',
                  headers: {
                    'Content-Accept': 'application-json',
                    'Authorization': webToken
                  },
                  url: API_URL + 'api/gatepeoplebycustomerbasic/' + customerId, 
                  timeout: 8000
                })
                .then( response => {
                  if ( response.data && response.data.length > 0 ) {
                    return response.data.filter( p => p.deletedAt === null ).map( d => ( { id: d.id.toString(), name: d.sFirstName + ' ' + d.sLastName, company: d.GateCompany.id.toString() } ));
                  };
                  return [];
                })
                .catch( () => {
                  throw new Error('boom3! '+ error);
                });
      // these functins are running parrellel - make sure they finish before we proceed                    
    Promise.all([ op1,op2,op3 ])
    .then( async([ lpnsN, companiesN, peopleN ]) => {
        // merge the arrays replacing any duplicates based on 'id'
        combinedLpns = merge(lpnsN, lpnsO, "id");
        combinedCompanies = merge(companiesN, companiesO, "id");
        combinedPeople = merge(peopleN, peopleO, "id");
        
        backupLpnId = combinedLpns.length > 1 && !isNaN(parseInt(combinedLpns[combinedLpns.length - 1].id)) ? combinedLpns[combinedLpns.length - 1].id : 1;
        backupCompanyId = combinedCompanies.length > 1 && !isNaN(parseInt(combinedCompanies[combinedCompanies.length -1].id)) ? combinedCompanies[combinedCompanies.length -1].id : 1;
        backupPersonId = combinedPeople.length > 1 && !isNaN(parseInt(combinedPeople[combinedPeople.length -1].id)) ? combinedPeople[combinedPeople.length -1].id : 1;
        // data from arrays that needs to be sync'd with server
        lpnsForSync = combinedLpns.filter( l => isNaN(parseInt(l.id)) );
        companiesForSync = combinedCompanies.filter( l => isNaN(parseInt(l.id)) );
        peopleForSync = combinedPeople.filter( l => isNaN(parseInt(l.id)) );   
    })
    .then( async () => {
    // upload any new companies and update necessary person, lpn and event objects
      for ( let c = 0; c < companiesForSync.length; c++ ) {
          let cId = companiesForSync[c].id;
          await axios({
              method: 'post',
              headers: {
                'Authorization': webToken
              },
              url: API_URL + 'api/gatecompanyV2', 
              data: {
                sName: companiesForSync[c].name,
                GateSubscriberId: subscriberId,
                GateCustomerId: customerId
              },
              timeout: 8000
          })
          .then( ( response ) => {
            if ( response.data && response.data.length > 0 ) {
              let responseId = response.data[0].id.toString();
              if (!responseId || isNaN(parseInt(responseId))) {
                throw new Error('bad company id returned');
              };
              // check if the responseId is already in our array - the company was already in the db we just need to replace the old id with the new one
              let dupCompany = combinedCompanies.find( c => c.id === responseId );
              if (dupCompany) {
                // if so - remove it
                removeItem( combinedCompanies, cId );
              } else {
                // if not - update our company object with the new id
                let tempCompany = combinedCompanies.find( c => c.id === cId );

                  tempCompany.id = responseId;
              };
              // update any persons with the old id that have not been uploaded to the db
              if ( peopleForSync.length > 0 ) {
                peopleForSync.forEach( p => {
                  if ( p.company === cId ) {
                    p.company = responseId;
                  };
                });
              };
              // update any lpns with the old id that have not been uploaded to the db
              if ( lpnsForSync.length > 0 ) {
                lpnsForSync.forEach( l => {
                  if ( l.company === cId ) {
                    l.company = responseId;
                  };
                });
              };
              // cycle through all events and update previous lpn id where needed
              if ( eventsLo && eventsLo.length > 0 ) {
                eventsLo.forEach( e => {
                  if( e.companyObj.id === cId ) {
                    e.companyObj.id = responseId;
                  };
                  if( e.driverObj.company === cId ) {
                      e.driverObj.company = responseId;
                  };
                  if( e.lpnObj.company === cId ) {
                    e.lpnObj.company = responseId;
                  };
                });
              };
              return;
            } else {
              throw new Error('company sync error')
            }
          })
          .catch( error => {
            throw new Error('boom4! '+ error);
          })
      };
      return;
    })
    .then( async() => {
      // upload any new people and update necessary lpn and event objects
      for ( let p = 0; p < peopleForSync.length; p++ ) {
          let pId = peopleForSync[p].id;
          const firstName = peopleForSync[p].name.trim().split(' ')[0];
          const lastName = peopleForSync[p].name.trim().split(' ')[1] || '';
          await axios({
            method: 'post',
            headers: {
              'Authorization': webToken
            },
            url: API_URL + 'api/gatepersonV2', 
            data: {
              sFirstName: firstName,
              sLastName: lastName,
              GateSubscriberId: subscriberId,
              GateCustomerId: customerId,
              GateCompanyId: peopleForSync[p].company && !isNaN(parseInt(peopleForSync[p].company)) ? peopleForSync[p].company : backupCompanyId
            },
            timeout: 8000
          })
          .then( ( response ) => {
            if ( response.data && response.data.length > 0 ) {
              let responseId = response.data[0].id.toString();
              if (!responseId || isNaN(parseInt(responseId))) {
                throw new Error('bad person id returned');
              };
              // check if the response.id is already in our array
              let dupPerson = combinedPeople.find( p => p.id === responseId );
              if (dupPerson) {
                // if so - remove it
                removeItem( combinedPeople, pId );
              } else {
                // if not - update our lpn object with the new id
                let tempPerson = combinedPeople.find( p => p.id === pId );
                tempPerson.id = responseId;
              }
              // update any lpns with the old id that have not been uploaded to the db
              if ( lpnsForSync.length > 0 ) {
                lpnsForSync.forEach( l => {
                  if ( l.person === pId ) {
                    l.person = responseId;
                  };
                });
              };
              // run through all events and update previous person id where needed
              if ( eventsLo && eventsLo.length > 0 ) {
                eventsLo.forEach( e => {
                  if( e.driverObj.id === pId ) {
                    e.driverObj.id = responseId;
                  };
                  if( e.lpnObj.person === pId ) {
                    e.lpnObj.person = responseId;
                  };
                });
              };
              return;
            } else {
              throw new Error('people sync error')
            }
          })
          .catch( ( error ) => {
            throw new Error('boom5! '+ error);
          });
      };
      return;
    })
    .then( async() => {
      // upload any new lpns and update necessary event objects
      for ( let l = 0; l < lpnsForSync.length; l++ ) {
          let lId = lpnsForSync[l].id;
          await axios({
            method: 'post',
            headers: {
              'Authorization': webToken
            },
            url: API_URL + 'api/gatelpnV2', 
            data: {
              sName: lpnsForSync[l].name,
              GateCompanyId: lpnsForSync[l].company && !isNaN(parseInt(lpnsForSync[l].company)) ? lpnsForSync[l].company : backupCompanyId,  // what if the company is also new, we need to push that then update this lpn
              GatePersonId: lpnsForSync[l].person && !isNaN(parseInt(lpnsForSync[l].person)) ? lpnsForSync[l].person : backupPersonId,       // what if our person is new also, we need to push that then update this lpn
              GateCustomerId: customerId,             
              GateSubscriberId: subscriberId
            },
            timeout: 8000
          })
          .then( ( response ) => {
            if ( response.data ) {
              let responseId = response.data.id.toString();
              if (!responseId || isNaN(parseInt(responseId))) {
                throw new Error('bad lpn id returned');
              };
              // check if the response.id is already in our array
              let dupLpn = combinedLpns.find( l => l.id === responseId );
              if (dupLpn) {
                // if so - remove it
                removeItem( combinedLpns, lId );
              } else {
                // if not - update our lpn object with the new id
                let tempLpn = combinedLpns.find( l => l.id === lId );
                  tempLpn.id = responseId;
              };
              // // run through all events and update previous lpn id where needed
              if ( eventsLo && eventsLo.length > 0 ) {
                eventsLo.forEach( e => {
                  if( e.lpnObj.id === lId ) {
                    e.lpnObj.id = responseId;
                  };
                });   
              };
              return;
            } else {
              throw new Error('lpns sync error')
            }
          })
          .catch( ( error ) => {
            throw new Error('boom6! '+ error);
          });
        }
        return;
    })
    .then( async() => {
        //  upload a single event
        let cEvent = eventsLo && eventsLo.length ? eventsLo[0] : [];
        // validate that we have the minimum data required to push the event to the server
        if ( validateEvent(cEvent) ) {
          let lpnPhotoDbPath = '';
          let loadPhotoDbPath = '';
          let additionalPhotosDbPaths = [];
          const gateId = cEvent.gateId && cEvent.gateId !== '' ? cEvent.gateId : gate;
          const cLpnPhoto = cEvent.lpnPhoto;
          const cLoadPhoto = cEvent.loadPhoto;
          const cAdditionalPhotos = cEvent.additionalPhotos;
          const lpnUriParts = cLpnPhoto.split('.');
          const lpnFileType = lpnUriParts[lpnUriParts.length - 1];
          const loadUriParts = cLoadPhoto.split('.');
          const loadFileType = loadUriParts[loadUriParts.length - 1];
          const lpnFormData = new FormData();
                lpnFormData.append('file', {
                  uri: cLpnPhoto,
                  name: `lpn.${lpnFileType}`,
                  type: `image/${lpnFileType}`
                });
          const loadFormData = new FormData();
                loadFormData.append('file', {
                  uri: cLoadPhoto,
                  name: `load.${loadFileType}`,
                  type: `image/${loadFileType}`
                });

          const uploadLpnPhoto = 
           cEvent.lpnPhoto && cEvent.lpnPhoto.length > 0 && validateFilePath(cEvent.lpnPhoto) &&
            (await fetch( API_URL + 'api/upload/' + gateId, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'multipart/form-data',
                              'Accept': 'application/json',
                              'Authorization': webToken
                          },
                          credentials: 'include', 
                          body: lpnFormData
                        })
                        .then( res => {
                          // console.log('lpn upload response: ', res )
                          if (!res.ok) {
                            throw new Error('lpn photo upload failed'); 
                          };
                          return res.json();
                        })
                        .then( data => {
                          lpnPhotoDbPath = data.path;
                          return;
                        })
                        .catch( (error) => {
                          lpnPhotoDbPath = '';
                          throw new Error('boom7! '+ error); 
                        }));

          const uploadLoadPhoto = 
              cEvent.loadPhoto && cEvent.loadPhoto.length > 0 && validateFilePath(cEvent.loadPhoto) &&
              (await fetch( API_URL + 'api/upload/' + gateId, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Accept': 'application/json',
                                'Authorization': webToken
                            },
                            credentials: 'include', 
                            body: loadFormData
                          })
                          .then( res => {
                            if (!res.ok) {
                              throw new Error('load photo upload failed');
                            };
                            return res.json();
                          })
                          .then( data => {
                            loadPhotoDbPath = data.path;
                            return;
                          })
                          .catch( (error) => {
                            loadPhotoDbPath = '';
                            throw new Error('boom8! '+ error);
                          }));

          const uploadAdditionalPhotos = 
            cAdditionalPhotos && cAdditionalPhotos.length > 0 &&
            await new Promise(async(resolve,reject) => {
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
                validateFilePath(cEvent.lpnPhoto) &&
                (await fetch( API_URL + 'api/upload/' + gateId, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'multipart/form-data',
                      'Accept': 'application/json',
                      'Authorization': webToken
                  },
                  credentials: 'include', 
                  body: formData
                })
                .then( res => {
                  if (!res.ok) {
                    throw new Error('additional photo upload failed'); 
                  };
                  return res.json();
                })
                .then( data => {
                  additionalPhotosDbPaths.push(data.path);
                })
                .catch( (error) => {
                  throw new Error('boom9! '+ error);
                }));
              }; 
              resolve('success');
            });

          // await the promise resolutions for our photo uploads
          await Promise.all([ uploadLpnPhoto, uploadLoadPhoto, uploadAdditionalPhotos ])
          .then( async () => {
      
            await axios({
              method: 'post',
              headers: {
                'Authorization': webToken
              },
              url: API_URL + 'api/gateeventV2', 
              data: {
                timestamp: cEvent.timestamp,
                bSubscriberId: cEvent.subscriberId && cEvent.subscriberId !== '' ?  cEvent.subscriberId : subscriberId,   // if the event was saved without a subscriberId, attach our current subscriberId
                bCustomerId: cEvent.customerId && cEvent.customerId !== '' ? cEvent.customerId : customerId,              // if the event was saved without a customerId, attach our current customerId
                bUserId: cEvent.userId && cEvent.userId !== '' ? cEvent.userId : userId ,                                 // if the event was saved without a userId, attach our current userId
                bTypeId: cEvent.type,                                    
                bGateId: cEvent.gateId && cEvent.gateId !== '' ? cEvent.gateId : gate,                                    // if the event was saved without a gateId, attach our current gateId
                bLpnId: cEvent.lpnObj.id && !isNaN(parseInt(cEvent.lpnObj.id)) ? cEvent.lpnObj.id : backupLpnId, 
                bCompanyId: cEvent.companyObj.id && !isNaN(parseInt(cEvent.companyObj.id)) ? cEvent.companyObj.id : backupCompanyId, 
                bDriverId: cEvent.driverObj.id && !isNaN(parseInt(cEvent.driverObj.id)) ? cEvent.driverObj.id : backupPersonId,
                sLpnPhoto: lpnPhotoDbPath,
                sLoadPhoto: loadPhotoDbPath,
                images: additionalPhotosDbPaths.length > 0 ? additionalPhotosDbPaths.toString() : '',   // Optional
                sComment: cEvent.comment || '',                                                         // Optional
                passengerCount: cEvent.passengerCount || 0                                              // Optional
              },
              timeout: 8000
            })
            .then( async response => {
              if ( response.data && response.data.id ) {
                const responseId = response.data.id;
                console.log(`event ${responseId} uploaded successfully!` )
                // upon success remove the event from our array
                const eventArrLength = eventsLo && eventsLo.length > 0 ? eventsLo.length: 0;
                if(eventArrLength > 0) {
                  eventsLo.shift();
                }

                // make sure we have actually removed the event before removing the local images
                const eventLoLength = eventsLo && eventsLo.length > 0 ? eventsLo.length: 0;
                if ( eventArrLength > eventLoLength ) {
                  // remove the localPhotos for this event from the device since they were successful
                  cEvent.lpnPhoto && cEvent.lpnPhoto.length > 0 && removeImageFromDevice(cEvent.lpnPhoto);
                  cEvent.loadPhoto && cEvent.loadPhoto.length > 0 && removeImageFromDevice(cEvent.loadPhoto);
                  cEvent.additionalPhotos && cEvent.additionalPhotos.length > 0 &&
                  cEvent.additionalPhotos.forEach( (p) => {
                    removeImageFromDevice(p.path);
                  });
                };
                return;
              } else {
                throw new Error('upload event error')
              }
            })
            .catch( async(error) => {
              // rollback images saved to db if they were already uploaded and we bombed out
              const lpnRemove = async() => {
                if ( lpnPhotoDbPath && lpnPhotoDbPath.length > 0 ) {
                  await rollbackImageSave(lpnPhotoDbPath, webToken);
                };
              };
              const loadRemove = async() => {
                if ( loadPhotoDbPath && loadPhotoDbPath.length > 0 ) {
                  await rollbackImageSave(loadPhotoDbPath, webToken);
                };
              };
              const additionalRemove = async() => {
                if ( additionalPhotosDbPaths && additionalPhotosDbPaths.length > 0 ) {
                  const photosToArray = additionalPhotosDbPaths.toString().split(',');
                  await photosToArray.forEach( async p => await rollbackImageSave(p, webToken) );
                }
              };
              await Promise.all([ lpnRemove(), loadRemove(), additionalRemove() ])
              throw new Error('boom10! '+ error)
            })
          })
          .catch( error => { throw new Error('boom! ', error) })
        } else {
          if(eventsLo && eventsLo.length > 0){
            eventsLo.shift()
          }
          throw new Error('removing failed event!')
        };

    })      
    .then( async() => {
      // dispatch our data to the sync reducer
      dispatch ({
        type: SYNC_DATA,
        combinedLpns,
        combinedCompanies,
        combinedPeople,
        eventsLo: eventsLo && eventsLo.length > 0 ? eventsLo : []
      });

      // this whole sync thing needs a rework - but at the end get all new stuff and merge with whatever we have already processed
      dispatch(getAppData(customerId, webToken));

      eventsLo = []
      // resolve the entire function promise
      return new Promise(() => setTimeout(resolve, 100));
    })
    .catch( async error => {
      Promise.reject(error);
      await Promise.all([ opA, opB ])
      // dispatch our data to the sync reducer
      dispatch ({
        type: SYNC_DATA,
        combinedLpns,
        combinedCompanies,
        combinedPeople,
        eventsLo: eventsLo && eventsLo.length > 0 ? eventsLo : []
      });  
      
      // this whole sync thing needs a rework - but at the end get all new stuff and merge with whatever we have already processed
      dispatch(getAppData(customerId, webToken));

      eventsLo = []
      // reject the entire function promise with error
      return;
    })
  };
};