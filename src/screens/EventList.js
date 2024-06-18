// **** this component is called from SettingsMenu.js ****

import React, {useState,useEffect} from 'react';
import { View, Text, FlatList} from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import { moderateScale } from 'react-native-size-matters';
import ListPagination from '../components/event_list/ListPagination';
import ListFilter from '../components/event_list/ListFilter';
import ListHeader from '../components/event_list/ListHeader';
import ListImageViewer from '../components/event_list/ListImageViewer';
import ListItem from '../components/event_list/ListItem';
import parseName from '../utility/parseName';
import makeId from '../utility/makeId';
import insertSorted from '../utility/insertSorted';
import config from '../../backend.json';
const API_URL = config.backend;

const EventList = (props) => {

  // app state
  const { siteId } = useSelector(state => state.user);
  const { webToken } = useSelector(state => state.auth);
  const { people, events } = useSelector( state => state.data );

  // component state
  const [allEvents, setAllEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [eventListLoading, setEventListLoading] = useState(false);
  const [eventListError, setEventListError] = useState(false);

  // view image states
  const [showImages, setShowImages] = useState(false);
  const [lpn, setLpn] = useState('');
  const [load, setLoad] = useState('');
  const [additional, setAdditional] = useState('');
  const [timestamp, setTimestamp] = useState('');

  // filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(['']);
  const [selectedLpn, setSelectedLpn] = useState(['ALL']);
  const [selectedCompany, setSelectedCompany] = useState(['ALL']);
  const [selectedDriver, setSelectedDriver] = useState(['ALL']);
  const [selectedStatus, setSelectedStatus] = useState([props.pending ? 1 : '']);

  useEffect(() => {
    getList(1);
  }, []);

  const getList = async (page) => {
    setCurrentPage(page);
    setShowFilter(false);
    setEventListLoading(true);
    setEventListError(false);

    let offset = 0
    let limit = 10
    let getMore = false
    let pendingData = {events: [], count: 0}
    let uploadedData = {events: [], count: 0, error: false}
    let eventList = []

    let searchParams = {
      // on initial load startDate and endDate are empty and are set based on the timestamp of the latest event on the list
      // if user did not explicitly filtered the list, then we'll continue showing the default
      start: filtered && startDate ? formatDate(startDate) : '',
      end: filtered && endDate ? formatDate(endDate) : '',
      type: selectedEventType[0],
      lpn: selectedLpn[0] === 'ALL' ? '' : selectedLpn[0],
      company: selectedCompany[0] === 'ALL' ? '' : selectedCompany[0],
      driver: selectedDriver[0] === 'ALL' ? '' : selectedDriver[0],
      status: selectedStatus[0],
    }

    if (searchParams.status !== 2) {
      // get pending events as long as we are not filtering specifically for uploaded events only (status = 2)
      pendingData = getPendingEvents(page, searchParams)
      eventList = pendingData.events
    }

    if (pendingData.count < (page * limit)) {
      // we only display 10 events in a page, so determine if we still have slots for uploaded events depending on our current pending events count
      getMore = true

      // these handles properly getting uploaded events per page
      offset = Math.max(0, (page * limit) - pendingData.count - limit)
      limit = Math.min(limit, (page * limit) - pendingData.count)
    }

    if (searchParams.status !== 1) {
      // get uploaded events as long as we are not filtering specifically for pending events only (status = 1)
      uploadedData = await getUploadedEvents(offset, limit, searchParams)

      if (uploadedData.error) {
        // if there's error in the server, let's bail out
        setEventListError(true)
        setCount(0)
        setPages(0)
        setAllEvents([])
        return
      }

      // if we still have slots to show uploaded events, add it in the list and sort it by timestamp
      if (getMore) {
        if (eventList.length) {
          for (let i = 0; i < uploadedData.events.length; i++) {
            eventList = insertSorted(eventList, uploadedData.events[i], 'eventTimestamp', 'desc')
          }
        } else {
          eventList = uploadedData.events
        }
      }
    }

    if (!filtered && eventList[0] && eventList[0].eventTimestamp) {
      const lastTs = eventList[0].eventTimestamp
      setStartDate(new Date(moment(lastTs).subtract(7, 'days')))
      setEndDate(new Date(lastTs))
    }

    const eventCount = pendingData.count + uploadedData.count
    setCount(eventCount)
    setPages(Math.ceil(eventCount / 10))
    setAllEvents(eventList)
    setEventListLoading(false)
  }

  const getPassengerNames = (idStr) => {
    // idStr is a comma-separated string containing passenger ids that relates to people ids
    let nameStr = ''
    if (idStr) {
      const passengerIds = idStr.split(',')
      const names = people.filter(p => passengerIds.includes(p.id.toString()))
      nameStr = names.map(p => p.name).join(', ')
    }
    return nameStr
  }

  const getPendingEvents = (page, searchParams) => {
    let list = []
    let count = events.length
    const limit = 10
    const startIndex = (page - 1) * limit
    const lastIndex = page * limit

    let eventList = events.filter(e => {
      // filter out events that don't fit with the searchParams
      if (searchParams &&
          ((searchParams.start && formatDate(e.timestamp) < searchParams.start) ||
            (searchParams.end && formatDate(e.timestamp) > searchParams.end) ||
            (searchParams.type && e.type !== searchParams.type) ||
            (searchParams.lpn && e.lpnObj.name !== searchParams.lpn) ||
            (searchParams.company && e.companyObj.name !== searchParams.company) ||
            (searchParams.driver && e.driverObj.name !== searchParams.driver))) {
        return false
      }
      return true
    })
    count = eventList.length // do this before slicing so we can get the correct total count that we can paginate
    eventList = eventList.slice(startIndex, lastIndex)

    for (let i = 0; i < eventList.length; i++) {
      const ev = eventList[i]
      const driverName = parseName(ev.driverObj.name)
      const event = {
        eventId: ev.id,
        eventTimestamp: ev.timestamp,
        typeId: ev.type,
        lpnName: ev.lpnObj.name,
        companyName: ev.companyObj.name,
        personFirst: driverName.first,
        personLast: driverName.last,
        eventPassengers: getPassengerNames(ev.passengers.join(',')),
        eventPassengerCount: ev.passengerCount,
        eventComment: ev.comment,
        eventLpnPhoto: ev.lpnPhoto,
        eventLoadPhoto: ev.loadPhoto,
        eventImages: ev.additionalPhotos.length > 0 ? ev.additionalPhotos.map(a => a.path).join() : "",
        error: ev.error,
        failedCount: ev.failedCount,
      }
      list.push(event)
    }

    return {events: list, count}
  }

  const getUploadedEvents = async (offset, limit, searchParams) => {
    let uploadedData = {events: [], count: 0, error: false}
    const name = parseName(searchParams.driver)
    const person = {personFirst: name.first, personLast: name.last}
    let params = {
      ...searchParams,
      ...person,
      offset,
      limit,
      i: makeId(4), // id is added to the query so we always get new data from the server - not 304 data cached
    }
    let paramsString = new URLSearchParams(params).toString();

    if (siteId) {
      await axios({
        method: 'get',
        headers: {
          'Content-Accept': 'application-json',
          'Authorization': webToken
        },
        url: `${API_URL}api/mobileeventsbysiteV51/${siteId}?${paramsString}`,
        timeout: 15000,

      }).then( response => {
        let ev = response.data.result

        for (let i = 0; i < ev.length; i++) {
          ev[i].eventPassengers = getPassengerNames(ev[i].eventPassengers)
        }

        uploadedData.events = ev
        uploadedData.count = response.data.count

      }).catch( (error) => {
        console.log(error)
        uploadedData.error = true
      })
    }

    return uploadedData
  }

  const formatDate = (date) => {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, 0)
    let day = (d.getDate()).toString().padStart(2, 0)
    return `${year}-${month}-${day}`;
  };

  const renderItem = ({item}) => {
    // mapping for each entry in flatlist
    if(item){
      return(
        <ListItem item={item} viewEventImages={viewEventImages} allEvents={allEvents} />
      )
    }
  };

  const viewEventImages = ( lpn, load, add, timestamp ) => {
    setLpn(lpn);
    setLoad(load);
    setAdditional(add);
    setTimestamp(timestamp);
    setShowImages(true);
  };

  const closeShowImage = () => {
    setShowImages(false);
    setLpn('');
    setLoad('');
    setAdditional('');
    setTimestamp('');
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'start':
        setStartDate(value);
        break;
      case 'end':
        setEndDate(value);
        break;
      case 'type':
        setSelectedEventType(value);
        break;
      case 'lpn':
        setSelectedLpn(value);
        break;
      case 'company':
        setSelectedCompany(value);
        break;
      case 'driver':
        setSelectedDriver(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
      default:
        break;
    };
  };

  const getEventsByFilter = async () => {
    // make sure start date is prior to end date
    if (startDate > endDate) {
      return alert('Start date must be prior to end date')
    }

    setFiltered(true)
    setShowFilter(false)
    await getList(1)
  };

  return (
    <View style={styles.containerStyle} >
      <Text style={styles.headingTextStyle}>
        Event List {!eventListLoading && !eventListError ? `(${count})` : ''}
      </Text>

      <ListHeader hideEventList={props.hideEventList} toggleFilter={ () => setShowFilter(!showFilter) } />

      {showFilter &&
        <ListFilter startDate={startDate}
                    endDate={endDate}
                    selectedEventType={selectedEventType}
                    selectedLpn={selectedLpn}
                    selectedCompany={selectedCompany}
                    selectedDriver={selectedDriver}
                    selectedStatus={selectedStatus}
                    handleFilterChange={handleFilterChange}
                    getEventsByFilter={getEventsByFilter} />
      }

      {!eventListLoading && !eventListError && !showFilter &&
          <ListPagination currentPage={currentPage} pages={pages} getList={getList} />
      }

      {eventListLoading
        ? <Text style={styles.statusTextStyle}>Loading ... </Text>
        : eventListError
          ? <Text style={styles.statusTextStyle}>Error</Text>
          : !showFilter
            && <FlatList
                  data={ allEvents }
                  renderItem={ renderItem }
                  keyExtractor={(_, index) => index } />
      }

      { showImages &&
          <ListImageViewer  lpn={lpn}
                            load={load}
                            additional={additional}
                            timestamp={timestamp}
                            closeShowImage={closeShowImage}
                            sourcePrefix={lpn.startsWith('file') ? '' : API_URL} />
      }

    </View>
  )
};

export default EventList;

const styles = {
  containerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start',
    zIndex: 40,
    backgroundColor: 'white'
  },
  headingTextStyle: {
    fontSize: moderateScale(20,.2),
    textAlign: 'center'
  },
  statusTextStyle: {
    fontSize: moderateScale(20,.2),
    textAlign: 'center',
    height: '85%',
    paddingTop: '20%'
  }
};