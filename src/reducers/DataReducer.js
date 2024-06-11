import insertSorted from '../utility/insertSorted';

import {
  SAVE_EVENT,
  GET_DATA_SUCCESS,
  GET_DATA_FAIL,
  ADD_NEW_LPN,
  ADD_NEW_COMPANY,
  ADD_NEW_DRIVER,
  ADD_NEW_PASSENGERS,
  CLEAR_EVENT_SAVE_MODAL,
  CLEAR_FORM,
  SYNC_DATA,
  UPDATE_NETWORK_STATUS,
  SET_ONSITE_LIST_LOADING,
  SET_ONSITE_LIST,
  SET_UPLOADING,
  LOGOUT_USER,
  REPORT_ERROR_SUCCESS,
  REPORT_ERROR_FAIL,
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
  onsiteCountLoading: false,
  onsitePeople: [],
  onsiteVehicle: [],
  onsitePeopleCount: 0,
  onsiteVehicleCount: 0,
  online: false,
  uploading: false,
};

export default ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
    case REPORT_ERROR_SUCCESS:
      return {
        ...state,
        events: action.events,
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
    case REPORT_ERROR_FAIL:
      return {
        ...state,
        events: action.events,
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
      lpnsLo = insertSorted(lpnsLo, {id: '0', name: action.name}, 'name')
      return {
        ...state,
        lpns: lpnsLo,
      }
    case ADD_NEW_COMPANY:
      // remove the old temporary value - indicated with id = '0' - note that it's a string
      let companiesLo = state.companies.filter(l => l.id !== '0')

      // then insert the new one in a correct position - sorted alphabetically
      companiesLo = insertSorted(companiesLo, {id: '0', name: action.name}, 'name')
      return {
        ...state,
        companies: companiesLo,
      }
    case ADD_NEW_DRIVER:
      // remove the old temporary value - indicated with id = '0' - note that it's a string
      let peopleLo = state.people.filter(l => l.id !== '0')

      // then insert the new one in a correct position - sorted alphabetically
      peopleLo = insertSorted(peopleLo, {id: '0', name: action.name}, 'name')
      return {
        ...state,
        people: peopleLo,
      }
    case ADD_NEW_PASSENGERS:
      let passengerArr = [...state.people]

      // add new names entered from the passenger modal, but exclude duplicates
      for (let i = 0; i < action.people.length; i++) {
        const duplicate = passengerArr.find(p => p.id === action.people[i].id)
        if (!duplicate) {
          passengerArr = insertSorted(passengerArr, action.people[i], 'name')
        }
      }

      return {
        ...state,
        people: passengerArr,
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
    case SET_ONSITE_LIST_LOADING:
      return {
        ...state,
        onsiteCountLoading: action.payload,
      }
    case SET_ONSITE_LIST:
      return {
        ...state,
        onsiteCountLoading: false,
        onsitePeople: action.payload.people,
        onsitePeopleCount: action.payload.peopleCount,
        onsiteVehicle: action.payload.vehicle,
        onsiteVehicleCount: action.payload.vehicleCount,
      }
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
          lpnArr = insertSorted(lpnArr, lpn, 'name')
        }
      } else {
        lpnArr[lpnIndex].company = company.id
        lpnArr[lpnIndex].person = driver.id
      }

      // if this is a new company, add it
      let compIndex = companyArr.findIndex( c => c.id === company.id )
      if (compIndex === -1) {
        if (isNaN(parseInt(company.id))) {
          companyArr = insertSorted(companyArr, company, 'name')
        }
      }

      // if this is a new driver, add it
      let driverIndex = peopleArr.findIndex( d => d.id === driver.id )
      if (driverIndex === -1) {
        if (isNaN(parseInt(driver.id))) {
          peopleArr = insertSorted(peopleArr, driver, 'name')
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
      return {
        ...state,
        lpns: action.lpns,
        companies: action.companies,
        people: action.people,
        events: action.events,
      }
    case GET_DATA_SUCCESS:
      // merge data from server (data from different gates of the same customer) to our local values
      // both server and local values are sorted, but we will prioritize local values and just merge those "new" data from server to our list
      const mergeAndSort = (localArr, serverArr) => {
        let sortedArr = [...localArr]
        const toMergeArr = serverArr.filter( srv => !localArr.find(lo => lo.id === srv.id) )

        for (let i = 0; i < toMergeArr.length; i++) {
          sortedArr = insertSorted(sortedArr, toMergeArr[i], 'name')
        }
        return sortedArr
      }

      const combinedL = mergeAndSort([...state.lpns], action.payload.lpns);
      const combinedC = mergeAndSort([...state.companies], action.payload.companies);
      const combinedP = mergeAndSort([...state.people], action.payload.people);
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
    case SET_UPLOADING:
      return {
        ...state,
        uploading: action.payload
      }
    default:
        return state
  };
};