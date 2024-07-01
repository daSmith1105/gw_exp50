// **** this component is called from SettingsMenu.js ****

import React, {useState,useEffect} from 'react';
import { View, Text, FlatList} from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { moderateScale } from 'react-native-size-matters';
import ListPagination from '../components/event_list/ListPagination';
import ListFilter from '../components/event_list/ListFilter';
import ListHeader from '../components/event_list/ListHeader';
import ListImageViewer from '../components/event_list/ListImageViewer';
import ListItem from '../components/event_list/ListItem';
import today from '../utility/today';
import sevenDaysAgo from '../utility/sevenDaysAgo';
import parseName from '../utility/parseName';
import axios from 'axios';
import config from '../../backend.json';
const API_URL = config.backend;

const EventList = (props) => {
  // used for start /end date search
  // eventually this should be changed to just get in backend
  // instead of getting the past 7 days, we should get start from 7 days prior to the last db event - most recent db event
  const { tYear, tMonth, tDay } = today();
  const { sdaYear, sdaMonth, sdaDay } = sevenDaysAgo();

  // component state
  const [allEvents, setAllEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [eventListLoading, setEventListLoading] = useState(false);
  const [eventListError, setEventListError] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [lpn, setLpn] = useState('');
  const [load, setLoad] = useState('');
  const [additional, setAdditional] = useState(''); // only displaying lpn and load currently so variable is not being used - but IS being set
  const [timestamp, setTimestamp] = useState('');
  const [selectedEventType, setSelectedEventType] = useState(['all']);
  const [selectedLpn, setSelectedLpn] = useState(['all']);
  const [selectedCompany, setSelectedCompany] = useState(['all']);
  const [selectedDriver, setSelectedDriver] = useState(['all']);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState(new Date(sdaYear, sdaMonth, sdaDay));
  const [endDate, setEndDate] = useState(new Date(tYear, tMonth, tDay));

  // app state
  // const { userId, firstName, lastName, siteId, customerId, customerName, subscriberId, subscriberName, gateId, gateName } = useSelector(state => state.user);
  const { siteId } = useSelector(state => state.user);
  const { webToken } = useSelector(state => state.auth);
  const { lpns, companies, people, events } = useSelector( state => state.data );

  useEffect(() => {
    setList(1);
  }, []);

  const setList = async (page, searchParams) => {
    setEventListLoading(true);
    setEventListError(false);

    if (!props.pending) {
      await getAllEvents(page, searchParams)

    } else {
      let list = []
      const totalPages = Math.ceil(events.length / 10)
      const startIndex = (page - 1) * 10
      const lastIndex = ((page - 1) * 10) + 10
      const pageEvents = events.slice(startIndex, lastIndex)

      // some of these properties are not used, commenting it out, as well as in the API
      // when this is fully tested, clean it up here and in the API
      for (let i = 0; i < pageEvents.length; i++) {
        const ev = pageEvents[i]
        const driverName = parseName(ev.driverObj.name)
        const event = {
          eventId: makeId(10),
          eventTimestamp: ev.timestamp,
          typeId: ev.type,
          // typeName: types[ev.type],
          // lpnId: ev.lpnObj.id,
          lpnName: ev.lpnObj.name,
          // companyId: ev.companyObj.id,
          companyName: ev.companyObj.name,
          // personId: ev.driverObj.id,
          personFirst: driverName.first,
          personLast: driverName.last,
          eventPassengerCount: ev.passengerCount,
          eventComment: ev.comment,
          eventLpnPhoto: ev.loadPhoto,
          eventLoadPhoto: ev.loadPhoto,
          eventImages: ev.additionalPhotos.length > 0 ? ev.additionalPhotos.map(a => a.path).join() : "",
          // subscriberId: ev.subscriberId,
          // subscriberName: ev.subscriberId === subscriberId ? subscriberName : '',
          // customerId: ev.customerId,
          // customerName: ev.customerId === customerId ? customerName : '',
          // userId: ev.userId,
          // userFirst: ev.userId === userId ? firstName : '',
          // userLast: ev.userId === userId ? lastName : '',
          // gateId: ev.gateId,
          // gateName: ev.gateId === gateId ? gateName : '',
        }
        list.push(event)
      }

      setAllEvents(list);
      setCount(events.length);
      setPages(totalPages);
      setCurrentPage(page);
    }

    setEventListLoading(false);
  }

  const getAllEvents = async (page, searchParams) => {
    let type = !searchParams || !searchParams.type || searchParams.type === 'all' ? null : searchParams.type;
    let lpn = !searchParams || !searchParams.lpn || searchParams.lpn === 'all' ? null : searchParams.lpn;
    let company = !searchParams || !searchParams.company || searchParams.company === 'all' ? null : searchParams.company;
    let driver = !searchParams || !searchParams.driver || searchParams.driver === 'all' ? null : searchParams.driver;
    let start = !searchParams || !searchParams.start ? formatDate(new Date(moment().subtract(7, 'days')),'start') : formatDate(searchParams.start,'start');
    let end = !searchParams || !searchParams.end ? formatDate(new Date()) : formatDate(searchParams.end);
    let id = makeId(4); // id is added to the query so we allways get new data from the server - not 304 data cached

    let p = 1;
    if(page){ p = page };

    if(siteId){
      await axios({
        method: 'get',
        headers: {
          'Content-Accept': 'application-json',
          'Authorization': webToken
        },
        url: `${API_URL}api/mobileeventsbysite/${siteId}/${p}?start=${start}&end=${end}&type=${type}&lpn=${lpn}&company=${company}&driver=${driver}&i=${id}`,
        timeout: 15000,

      }).then( response => {
        if(!response || !response.data){
          throw new Error('error getting event list for gate')
        };
        let res = response.data;
        setAllEvents(res.result);
        setCount(res.count);
        setPages(res.pages);
        setCurrentPage(p);

      }).catch( (error) => {
        console.log(error)
        setAllEvents([]);
        setCount(0);
        setPages(0);
        setCurrentPage(0);
        setEventListError(true);
      });
    }
  };

  const formatDate = (date, type) => {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = ('0' + (d.getMonth() + 1)).slice(-2);
    let day = ('0' + d.getDate()).slice(-2);
    let hour = type && type === 'start' ? '00' : '23';
    let minute = type && type === 'start' ? '00' : '59';
    let second = type && type === 'start' ? '00' : '59';
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  };

  const makeId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    };
    return result;
  };

  const renderItem = ({item}) => {
    // mapping for each entry in flatlist
    if(item){
      return(
        <ListItem item={item} viewEventImages={viewEventImages} allEvents={allEvents} />
      )
    }
  };

  const keyExtractor = (item, index) => {
    // key extractor for items in flatlist
    item.eventTimestamp + '.' + index;
  }

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

  const handleFilterChange = (type, option) => {
    switch (type) {
      case 'type':
        setSelectedEventType(option);
        break;
      case 'lpn':
        setSelectedLpn(option);
        break;
      case 'company':
        setSelectedCompany(option);
        break;
      case 'driver':
        setSelectedDriver(option);
        break;
      default:
        break;
    };
  };

  const setStart = (event, date) => {
    const {
      type,
      nativeEvent: {timestamp},
    } = event;
    setStartDate(new Date(event.nativeEvent.timestamp));
  };

  const setEnd = (event, date) => {
    const {
      type,
      nativeEvent: {timestamp},
    } = event;
    setEndDate(new Date(event.nativeEvent.timestamp));
  };

  const getEventsByFilter = async () => {
    // make sure start date is prior to end date
    if(startDate > endDate){
      alert('Start date must be prior to end date');
      return;
    };

    let searchParams = {
      start: startDate,
      end: endDate,
      type: selectedEventType[0],
      lpn: selectedLpn[0],
      company: selectedCompany[0],
      driver: selectedDriver[0],
    };

    await setList(1, searchParams);
    setShowFilter(false);
  };

  return (
    <View style={styles.containerStyle} >
      <Text style={styles.headingTextStyle}>
        {props.pending && 'Pending'} Event List {!eventListLoading && !eventListError ? `(${count})` : ''}
      </Text>

      <ListHeader hideEventList={props.hideEventList} toggleFilter={ () => setShowFilter(!showFilter) } />

      {/* filter disabled above so this code is not currently being called */}
      {showFilter &&
        <ListFilter startDate={startDate}
                    setStart={setStart}
                    endDate={endDate}
                    setEnd={setEnd}
                    selectedEventType={selectedEventType}
                    selectedLpn={selectedLpn}
                    selectedCompany={selectedCompany}
                    selectedDriver={selectedDriver}
                    handleFilterChange={handleFilterChange}
                    getEventsByFilter={getEventsByFilter}
                    lpns={lpns}
                    companies={companies}
                    people={people} />
      }


      {!eventListLoading && !eventListError && !showFilter &&
          <ListPagination currentPage={currentPage} pages={pages} setList={setList} />
      }

      {eventListLoading
        ? <Text style={styles.statusTextStyle}>Loading ... </Text>
        : eventListError
          ? <Text style={styles.statusTextStyle}>Error</Text>
          : !showFilter
            && <FlatList
                data={ allEvents }
                renderItem={ renderItem }
                keyExtractor={ keyExtractor } />
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