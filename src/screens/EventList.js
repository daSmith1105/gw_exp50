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
  const { lpns, companies, people, events } = useSelector( state => state.data );

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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(['']);
  const [selectedLpn, setSelectedLpn] = useState(['']);
  const [selectedCompany, setSelectedCompany] = useState(['']);
  const [selectedDriver, setSelectedDriver] = useState(['']);
  const [selectedStatus, setSelectedStatus] = useState([props.pending ? 1 : '']);

  useEffect(() => {
    getList(1, 'initial');
  }, []);

  const getList = async (page, trigger) => {
    setCurrentPage(page);
    setShowFilter(false);
    setEventListLoading(true);
    setEventListError(false);

    let offset = 0
    let limit = 10
    let getMore = false
    let pendingData = {events: [], count: 0}
    let serverData = {events: [], count: 0, error: false}
    let eventList = []

    let searchParams = {
      // on initial load startDate and endDate are empty and are set based on the timestamp of the latest event on the list
      // if user did not explicitly filtered the list, then we'll continue showing the default
      start: trigger === 'filter' && startDate ? formatDate(startDate) : '',
      end: trigger === 'filter' && endDate ? formatDate(endDate) : '',
      type: selectedEventType[0],
      lpn: selectedLpn[0],
      company: selectedCompany[0],
      driver: selectedDriver[0],
      status: selectedStatus[0],
    }

    if (searchParams.status !== 2) {
      // get pending events as long as we are not filtering specifically for synced events only (status = 2)
      pendingData = getPendingEvents(page, searchParams)
      eventList = pendingData.events
    }

    if (pendingData.count < (page * limit)) {
      // we only display 10 events in a page, so determine if we still have slots for server events depending on our current pending events count
      getMore = true

      // these handles properly getting server events per page
      offset = Math.max(0, (page * limit) - pendingData.count - limit)
      limit = Math.min(limit, (page * limit) - pendingData.count)
    }

    if (searchParams.status !== 1) {
      // get server events as long as we are not filtering specifically for pending events only (status = 1)
      serverData = await getServerEvents(offset, limit, searchParams)

      if (serverData.error) {
        // if there's error in the server, let's bail out
        setEventListError(true)
        setCount(0)
        setPages(0)
        setAllEvents([])
        return
      }

      // if we still have slots to show server events, add it in the list
      if (getMore) {
        if (eventList.length) {
          for (let i = 0; i < serverData.events.length; i++) {
            eventList = insertSorted(eventList, serverData.events[i], 'eventTimestamp', 'desc')
          }
        } else {
          eventList = serverData.events
        }
      }
    }

    if (trigger === 'initial' && eventList[0] && eventList[0].eventTimestamp) {
      const lastTs = eventList[0].eventTimestamp
      setStartDate(new Date(moment(lastTs).subtract(7, 'days')))
      setEndDate(new Date(lastTs))
    }

    const eventCount = pendingData.count + serverData.count
    setCount(eventCount)
    setPages(Math.ceil(eventCount / 10))
    setAllEvents(eventList)
    setEventListLoading(false)
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
            (searchParams.lpn && e.lpnObj.id !== searchParams.lpn) ||
            (searchParams.company && e.companyObj.id !== searchParams.company) ||
            (searchParams.driver && e.driverObj.id !== searchParams.driver))) {
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
        eventId: 'e' + makeId(10),
        eventTimestamp: ev.timestamp,
        typeId: ev.type,
        lpnName: ev.lpnObj.name,
        companyName: ev.companyObj.name,
        personFirst: driverName.first,
        personLast: driverName.last,
        eventPassengerCount: ev.passengerCount,
        eventComment: ev.comment,
        eventLpnPhoto: ev.loadPhoto,
        eventLoadPhoto: ev.loadPhoto,
        eventImages: ev.additionalPhotos.length > 0 ? ev.additionalPhotos.map(a => a.path).join() : "",
      }
      list.push(event)
    }

    return {events: list, count}
  }

  const getServerEvents = async (offset, limit, searchParams) => {
    let serverData = {events: [], count: 0, error: false}
    let params = {
      ...searchParams,
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
        url: `${API_URL}api/mobileeventsbysite/${siteId}?${paramsString}`,
        timeout: 15000,

      }).then( response => {
        let res = response.data;
        serverData.events = res.result
        serverData.count = res.count

      }).catch( (error) => {
        console.log(error)
        serverData.error = true
      })
    }

    return serverData
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

    await getList(1, 'filter');
    setShowFilter(false);
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
                    lpns={lpns}
                    companies={companies}
                    people={people}
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
                            sourcePrefix={props.pending ? '' : API_URL} />
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