import { 
  SAVE_EVENT,
  GET_DATA_SUCCESS,
  GET_DATA_FAIL,
  ADD_NEW_LPN,
  ADD_NEW_COMPANY,
  ADD_NEW_DRIVER,
  CLEAR_EVENT_SAVE_MODAL,
  CLEAR_FORM,
  SYNC_DATA,
  UPDATE_NETWORK_STATUS,
  SET_ONSITE_COUNT,
  LOGOUT_USER,
  LOGIN_USER_SUCCESS,
  REPORT_ERROR_SUCCESS,
  RESET_REDUCER_GROUP, // this is used when the app updates to a new version and we need to clear out the entire redux store,
} from '../actions/types';

const interval = 30;

const INITIAL_STATE = { 
  userInteractionStatus: false,
  syncInterval: interval, // if this reaches 0 we are going to try and push an event
  lpns: [],
  companies: [],
  people: [],
  events: [],
  loading: false,
  eventSaving: false,
  saveEventSuccess: false,
  saveEventFail: false,
  eventUploading: false,
  uploadEventSuccess: false,
  uploadEventFail: false,
  getLpnError: '',
  getCompanyError: '',
  getPeopleError: '',
  onsitePeopleCount: 0,
  onsiteVehicleCount: 0,
  online: false
};

const merge = (a, b, property) => a.filter( aa => ! b.find ( bb => aa[property] === bb[property]) ).concat(b);

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case REPORT_ERROR_SUCCESS:
      return { 
        ...state, 
        loading: false,
        eventSaving: false,
        saveEventSuccess: false,
        saveEventFail: false,
        eventUploading: false,
        uploadEventSuccess: false,
        uploadEventFail: false,
        getLpnError: '',
        getCompanyError: '',
        getPeopleError: '',
      }
    case UPDATE_NETWORK_STATUS:
      return { 
        ...state, 
        online: action.payload
      }
    case RESET_REDUCER_GROUP:
      return {
        userInteractionStatus: false,
        syncInterval: interval, // if this reaches 0 we are going to try and push an event
        lpns: [],
        companies: [],
        people: [],
        events: [],
        loading: false,
        eventSaving: false,
        saveEventSuccess: false,
        saveEventFail: false,
        eventUploading: false,
        uploadEventSuccess: false,
        uploadEventFail: false,
        getLpnError: '',
        getCompanyError: '',
        getPeopleError: '',
        onsitePeopleCount: 0,
        onsiteVehicleCount: 0
      };


    case ADD_NEW_LPN:
      let lpnsLo = state.lpns.slice();
      if( lpnsLo.length > 0 && lpnsLo[0].id === '0') {
        lpnsLo.splice( 0, 1 )
      };
      return {
        ...state,
        lpns: [ { id: '0', name: action.name }, ...lpnsLo ]
      };
    case ADD_NEW_COMPANY:
      let companiesLo = state.companies.slice();
      if( companiesLo.length > 0 && companiesLo[0].id === '0') {
        companiesLo.splice( 0, 1 )
      };
      return {
        ...state,
        companies: [ { id: '0', name: action.name }, ...companiesLo ]
      };
    case ADD_NEW_DRIVER:
      let peopleLo= state.people.slice();
      if( peopleLo.length > 0 && peopleLo[0].id === '0') {
        peopleLo.splice( 0, 1 )
      };
      return {
        ...state,
        people: [ { id: '0', name: action.name }, ...peopleLo ]
      };
    case CLEAR_EVENT_SAVE_MODAL:
      return {
        ...state,
        saveEventSuccess: false,
        saveEventFail: false
      };
    case CLEAR_FORM:
      return {
        ...state,
        loading: false,
        eventSaving: false,
        saveEventSuccess: false,
        saveEventFail: false,
        eventUploading: false,
        uploadEventSuccess: false,
        uploadEventFail: false,
      };
    case SET_ONSITE_COUNT:
      // if we have a local count we need to modify it
      let remainingPeople = 0;
      let remainingVehicles = 0;
      // add any current onsite values we have to what was pulled from the network
      if ( state.events.length > 0 ) {
        const stateVcount = state.onsiteVehicleCount;
        const statePcount = state.onsitePeopleCount;
        const localE = state.events.slice();
        localE.forEach( e => {
          if( e.type === 1 ) {
            remainingVehicles = remainingVehicles + 1;
            if( parseInt(e.passengerCount) !== 0 ) {
              remainingPeople = remainingPeople + (parseInt(e.passengerCount) + 1);
            } else {
              remainingPeople = remainingPeople + 1;
            };
          } else if( e.type === 2 ) {
            remainingVehicles = remainingVehicles - 1;
            if( parseInt(e.passengerCount) !== 0 ) {
              remainingPeople = remainingPeople - (parseInt(e.passengerCount) + 1);
            } else {
              remainingPeople = remainingPeople - 1;
            };
          };
        });
      };
      // add the counts from any local events that have not beemn uploaded to the current db count
      let peopleCount = remainingPeople + action.peopleCount;
      let vehicleCount = remainingVehicles + action.vehicleCount;

      return {
        ...state,
        onsitePeopleCount: parseInt(peopleCount),
        onsiteVehicleCount: parseInt(vehicleCount)
      };

    case LOGIN_USER_SUCCESS:
      let user = action.payload;
      let remainingP = 0;
      let remainingV = 0;
      // add any current onsite values we have to what was pulled from the network
      if ( state.events.length > 0 ) {
        const lE = state.events.slice();
        lE.forEach( e => {
          if( e.type === 1 ) {
            remainingV = remainingV + 1;
            if( parseInt(e.passengerCount) !== 0 ) {
              remainingP = remainingP + (parseInt(e.passengerCount) + 1);
            } else {
              remainingP = remainingP + 1;
            };
          } else if( e.type === 2 ) {
            remainingV = remainingV - 1;
            if( parseInt(e.passengerCount) !== 0 ) {
              remainingP = remainingP - (parseInt(e.passengerCount) + 1);
            } else {
              remainingP = remainingP - 1;
            };
          };
        });
      };
      // add the counts from any local events that have not beemn uploaded to the current db count
      let pCount = remainingP + user.gatePersonCount;
      let vCount = remainingV + user.gateVehicleCount;

      return {
        ...state,
        onsitePeopleCount: parseInt(pCount),  
        onsiteVehicleCount: parseInt(vCount)
      };

    case LOGOUT_USER:
      const localEv = state.events.slice();
      let rP = 0;
      let rV = 0;
      localEv.forEach( e => {
        if( e.type === 1 ) {
          rV = rV + 1;
          if( parseInt(e.passengerCount) !== 0 ) {
            rP = rP + (parseInt(e.passengerCount) + 1);
          } else {
            rP = rP + 1;
          };
        } else if( e.type === 2 ) {
          rV = rV - 1;
          if( parseInt(e.passengerCount) !== 0 ) {
            rP = rP - (parseInt(e.passengerCount) + 1);
          } else {
            rP = rP - 1;
          };
        }
      })
      return {
        ...state,
        onsitePeopleCount: parseInt(rP),
        onsiteVehicleCount: parseInt(rV),
        loading: false,
        eventSaving: false,
        saveEventSuccess: false,
        saveEventFail: false,
        eventUploading: false,
        uploadEventSuccess: false,
        uploadEventFail: false,
        getLpnError: '',
        getCompanyError: '',
        getPeopleError: '',
      }
    case SAVE_EVENT:
      // save the event to local state
      const event = action.payload;
      let onsitePeopleCount = state.onsitePeopleCount;
      let onsiteVehicleCount = state.onsiteVehicleCount;
      let lpnArr = state.lpns.slice();
      let companyArr = state.companies.slice();
      let peopleArr = state.people.slice();
      const eventsArr = state.events.slice();
      let lpn = event.lpnObj;
      let company = event.companyObj;
      let driver = event.driverObj;
      const lpnId = lpn.id;
      const companyId = company.id;
      const driverId = driver.id;

      // remove the first item from the given array if the id='0' 
      // it was temporary and we will be replacing it with a newly created id from the incoming data object
        if (lpnArr[0].id === '0') {
            lpnArr.shift()
        };
        if (companyArr[0].id === '0') {
            companyArr.shift()
        };
        if (peopleArr[0].id === '0') {
            peopleArr.shift()
        };

        // if isNaN( parseInt( lpnId )) this is a new lpn
        if( isNaN( parseInt(lpnId)) ) {
          let lpnTemp = lpnArr.find( l => l.id === lpnId );
          // if we don't find the obj in array push it
          if(!lpnTemp) { 
            // add lpn to array if it isnt already there
            lpnArr.unshift(lpn) 
          } else {
            // we have a current licenseplate in the array, update current company and driver for autopopulate if they have changed
            if(lpnTemp,company !== companyId) {
              lpnTemp.company = companyId;
            }
            if(lpnTemp.person !== driverId) {
              lpnTemp.person = driverId;
            }
          };
        } else {
          // we have an existing lpn that was pulled from the remote db, find it and update current company and driver for autopopulate if they have changed
          let lpnTemp = lpnArr.find( l => l.id === lpnId );
          if(!lpnTemp) { 
            console.log('I cant find that lpn, Dave.')
          } else {
            // update object with current company and driver
            lpnTemp.company = companyId
            lpnTemp.person = driverId
          };
        };

        // if isNaN( parseInt( companyId )) this is a new company
        if( isNaN( parseInt( companyId )) ) {
            let companyTemp = companyArr.find( c => c.id === companyId );
            // if we don't find the obj in array push it
            if(!companyTemp) { 
              companyArr.unshift(company) 
            };
        };
        
        // if isNaN( parseInt( driverId )) this is a new company
        if( isNaN( parseInt( driverId )) ) {
          const driverTemp = peopleArr.find( d => d.id === driverId );
          // if we don't find the obj in array push it
          if(!driverTemp) { 
            peopleArr.unshift(driver) 
          };
        };

        if ( event.type === 1 ) {
          let addToPersonCount = parseInt(event.passengerCount) === 0 ? 1 : parseInt(event.passengerCount) + 1;
          onsitePeopleCount = onsitePeopleCount + addToPersonCount;
          onsiteVehicleCount = onsiteVehicleCount + 1;
        } else if ( event.type === 2 ) {
           let subtractPersonCount = parseInt(event.passengerCount) === 0 ? 1 : parseInt(event.passengerCount) + 1;
           onsitePeopleCount = onsitePeopleCount - subtractPersonCount;
           onsiteVehicleCount = onsiteVehicleCount - 1;
         } else {
           onsitePeopleCount = state.onsitePeopleCount;
           onsiteVehicleCount = state.onsitePeopleCount;
         }
        

        return {
          ...state,
          lpns: lpnArr,
          companies: companyArr,
          people: peopleArr,
          events: [ event, ...eventsArr ],
          eventSaving: false,
          saveEventSuccess: true,
          saveEventFail: false,
          onsitePeopleCount,
          onsiteVehicleCount
        };

    case SYNC_DATA:
      // action.eventsLo should contain any remaining events or []
      // cycle through remaining events calculating counts for peopleOnsite and vehiclesOnsite
      // modify state.onsitePeopleCount and onsiteVehicleCount accordingly
      let currentPeople = state.onsitePeopleCount;
      let currentVehicles = state.onsiteVehicleCount;
      let cPersonCounter = 0;
      let cVehicleCounter = 0;
      let events = action.eventsLo || [];
      if ( events.length > 0 ) {
       events.forEach( e => {
         if ( e.type === 1 ) {
           cVehicleCounter = cVehicleCounter + 1;
           cPersonCounter = parseInt(e.passengerCount) === 0 ? cPersonCounter + 1 : cPersonCounter + ( parseInt(e.passengerCount) + 1)
         }
         if ( e.type === 2 ) {
          cVehicleCounter = cVehicleCounter - 1;
          cPersonCounter = parseInt(e.passengerCount) === 0 ? cPersonCounter - 1 : cPersonCounter - ( parseInt(e.passengerCount) + 1)
        }
       });
      };

      return { 
        ...state, 
        lpn: action.combinedLpns,
        companies: action.combinedCompanies,
        people: action.combinedPeople,
        events: action.eventsLo || [],
        onsitePeopleCount: currentPeople,
        onsiteVehicleCount: currentVehicles
      }

    case GET_DATA_SUCCESS:
      // need to combine values with our locally stored values that have yet to be uploaded 
      // and update any stored values that have been changed on the server
      const combinedL = merge(action.payload.lpns, state.lpns.slice(), "id");
      const combinedC = merge(action.payload.companies, state.companies.slice(), "id");
      const combinedP = merge(action.payload.people, state.people.slice(), "id");
      return {
        ...state,
        lpns: combinedL,
        companies: combinedC,
        people: combinedP
      }; 

    case GET_DATA_FAIL:
      return {
        ...state
      };
      
    default:
        return state;
  };
};