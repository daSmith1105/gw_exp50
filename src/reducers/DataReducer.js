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
  REPORT_ERROR_SUCCESS,
  RESET_REDUCER_GROUP, // this is used when the app updates to a new version and we need to clear out the entire redux store,
} from '../actions/types';

const INITIAL_STATE = {
  userInteractionStatus: false,
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

const insertSorted = (arr, obj) => {
  let sortedArr = [...arr]

  // determine where to insert the new obj based on alphabetically sorted names
  let index = sortedArr.findIndex( a => a.name.localeCompare(obj.name) > 0)
  // if obj should be inserted in the end
  if (index === -1) {
    index = sortedArr.length
  }

  sortedArr.splice(index, 0, obj)
  return sortedArr
}

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
      return {...INITIAL_STATE};
    case ADD_NEW_LPN:
      // remove the old temporary value - indicated with id = '0' - note that it's a string
      let lpnsLo = state.lpns.filter(l => l.id !== '0')

      // then insert the new one in a correct position - sorted alphabetically
      lpnsLo = insertSorted(lpnsLo, {id: '0', name: action.name})
      return {
        ...state,
        lpns: lpnsLo,
      }
    case ADD_NEW_COMPANY:
      // remove the old temporary value - indicated with id = '0' - note that it's a string
      let companiesLo = state.companies.filter(l => l.id !== '0')

      // then insert the new one in a correct position - sorted alphabetically
      companiesLo = insertSorted(companiesLo, {id: '0', name: action.name})
      return {
        ...state,
        companies: companiesLo,
      }
    case ADD_NEW_DRIVER:
      // remove the old temporary value - indicated with id = '0' - note that it's a string
      let peopleLo = state.people.filter(l => l.id !== '0')

      // then insert the new one in a correct position - sorted alphabetically
      peopleLo = insertSorted(peopleLo, {id: '0', name: action.name})
      return {
        ...state,
        people: peopleLo,
      }
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
        const localE = state.events.slice();
        localE.forEach( e => {
          // passengerCount is now stored as int, but for backwards compatibility of existing state, let's parse
          if( e.type === 1 ) {
            remainingVehicles++;
            remainingPeople += parseInt(e.passengerCount) + 1;
          } else if( e.type === 2 ) {
            remainingVehicles--;
            remainingPeople -= parseInt(e.passengerCount) + 1;
          };
        });
      };
      // add the counts from any local events that have not beemn uploaded to the current db count
      let peopleCount = remainingPeople + action.peopleCount;
      let vehicleCount = remainingVehicles + action.vehicleCount;

      return {
        ...state,
        onsitePeopleCount: peopleCount,
        onsiteVehicleCount: vehicleCount,
      };
    case LOGOUT_USER:
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
    case SAVE_EVENT:
      // save the event to local state
      let lpnArr = state.lpns.filter(a => a.id !== '0');            // get lpns without the temporary value
      let companyArr = state.companies.filter(a => a.id !== '0');   // get companies without the temporary value
      let peopleArr = state.people.filter(a => a.id !== '0');       // get people without the temporary value
      const eventsArr = state.events.slice();
      const event = action.payload;
      let lpn = event.lpnObj;
      let company = event.companyObj;
      let driver = event.driverObj;

      // if this is a new lpn, add it (alphabetically sorted), else, update company and driver relations
      let lpnIndex = lpnArr.findIndex( l => l.id === lpn.id )
      if (lpnIndex === -1) {
        if (isNaN(parseInt(lpn.id))) {
          lpnArr = insertSorted(lpnArr, lpn)
        }
      } else {
        lpnArr[lpnIndex].company = company.id
        lpnArr[lpnIndex].person = driver.id
      }

      // if this is a new company, add it
      let compIndex = companyArr.findIndex( c => c.id === company.id )
      if (compIndex === -1) {
        if (isNaN(parseInt(company.id))) {
          companyArr = insertSorted(companyArr, company)
        }
      }

      // if this is a new driver, add it
      let driverIndex = peopleArr.findIndex( d => d.id === driver.id )
      if (driverIndex === -1) {
        if (isNaN(parseInt(driver.id))) {
          peopleArr = insertSorted(peopleArr, driver)
        }
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
      };
    case SYNC_DATA:
      // console.log('SYNC_DATA', action)
      return {
        ...state,
        lpns: action.lpns,
        companies: action.companies,
        people: action.people,
        events: action.events,
      }
    case GET_DATA_SUCCESS:
      // merge data from server and our local values
      // note that server data is already sorted, so to save resources
      // we'll cleanup the local data to only have values that are not in our server array, then insert it in the sorted server array
      const mergeAndSort = (localArr, serverArr) => {
        let sortedArr = [...serverArr]
        const uniqueLocalArr = localArr.filter( lo => !serverArr.find(srv => srv.id === lo.id) )

        for (let i = 0; i < uniqueLocalArr.length; i++) {
          sortedArr = insertSorted(sortedArr, uniqueLocalArr[i])
        }
        return sortedArr
      }

      const combinedL = mergeAndSort([...state.lpns], action.payload.lpns);
      const combinedC = mergeAndSort([...state.companies], action.payload.companies);
      const combinedP = mergeAndSort([...state.people], action.payload.people);

      // console.log('GET_DATA_SUCCESS', {payload: action.payload, statelpns: state.lpns, statecomp: state.companies, statepeople: state.people, combinedL, combinedC, combinedP})
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