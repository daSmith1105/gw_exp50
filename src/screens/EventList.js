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
import makeId from '../utility/makeId';
import today from '../utility/today';
import sevenDaysAgo from '../utility/sevenDaysAgo';


const EventList = (props) => {
  // used for start /end date search
  // eventually this should be changed to just get in backend 
  // instead of getting the past 7 days, we should get start from 7 days prior to the last db event - most recent db event
  const { tYear, tMonth, tDay } = today();
  const { sdaYear, sdaMonth, sdaDay } = sevenDaysAgo();

  // component state
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
  const lpns = useSelector(state => state.data.lpns);
  const companies = useSelector(state => state.data.companies);
  const people = useSelector(state => state.data.people);
  const localEvents = useSelector(state => state.data.events);

  useEffect(() => {
    setShowImages(false);
    setLpn('');
    setLoad('');
    setAdditional('');
    setTimestamp('');
    setSelectedEventType(['all']);
    setSelectedLpn(['all']);
    setSelectedCompany(['all']);
    setSelectedDriver(['all']);
    setShowFilter(false);
    setStartDate(new Date(moment().subtract(7, 'days')));
    setEndDate(new Date());
  }, []);

  const viewEventImages = ( lpn, load, add, timestamp ) => {
    setLpn(lpn);
    setLoad(load);
    setAdditional(add);
    setTimestamp(timestamp);
    setShowImages(true);
  };

  // mapping for each entry in flatlist 
  const renderItem = ({item}) => {
    if(item){
      return(
        <ListItem item={item} 
                  viewEventImages={viewEventImages}
                  allGateEvents={props.allGateEvents} />
      )
    }
  };

  // key extractor for items in flatlist
  const keyExtractor = (item, index) => item.eventTimestamp + '.' + index;

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

  const setStart = (event: DateTimePickerEvent, date: Date) => {
    const {
      type,
      nativeEvent: {timestamp},
    } = event;
    setStartDate(new Date(event.nativeEvent.timestamp));
  };

  const setEnd = (event: DateTimePickerEvent, date: Date) => {
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
    
    await props.getAllGateEvents(1, searchParams);
    setShowFilter(false);
  };

  const convertEvents = () => {
    let newEvents = [];
    for(let i=0;i<localEvents.length;i++){
      let event = localEvents[i];
      event.eventId = makeId(10);
      event.eventLpnPhoto = event.lpnPhoto;
      event.eventLoadPhoto = event.loadPhoto;
      event.eventImages = event.additionalPhotos;
      event.eventComment = event.comment;
      event.eventPassengerCount = event.passengerCount;
      event.eventTimestamp = event.timestamp;
      event.subscriberId = event.subscriberId;
      event.subscriberName = '';
      event.customerId = null;
      event.customerName = '';
      event.companyId = event.companyObj.id;
      event.companyName = event.companyObj.name;
      event.userId = event.userId;
      event.userFirst = '';
      event.userLast = '';
      event.gateId = event.gateId;
      event.gateName = '';
      event.personId = event.driverObj.id;
      event.personFirst = event.driverObj.name.length > 0 && event.driverObj.name.split(' ')[0] ? event.driverObj.name.split(' ')[0] : '';
      event.personLast = event.driverObj.name.length > 0 && event.driverObj.name.split(' ')[1] ? event.driverObj.name.split(' ')[1] : '';;
      event.lpnId = event.lpnObj.id;
      event.lpnName = event.lpnObj.name;
      event.typeId = event.type;
      event.typeName = event.type === 1 ? 'IN' : event.type === 2 ? 'OUT' : event.type === 3 ? 'DENIED' : 'ACCIDENT';
      newEvents.push(event);
    };
    // these will potentially display out of order (by timestamp) - need to sort
    return ([...newEvents,...props.allGateEvents]);
  };

  const closeShowImage = () => {
    setShowImages(false);
    setLpn('');
    setLoad('');
    setAdditional('');
    setTimestamp('');
  };

  return (
    <View style={styles.containerStyle} >
      <Text style={styles.headingTextStyle}>
        Event List {!props.eventListLoading && !props.eventListError ? `(${props.count})` : ''}
      </Text>

      <ListHeader toggleEventList={props.toggleEventList}
                  toggleFilter={ () => setShowFilter(!showFilter) } />



      {/* filter etc  */}
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
                  

      {!props.eventListLoading && !props.EventListError && !showFilter &&
          <ListPagination currentPage={props.currentPage} 
                          pages={props.pages} 
                          getAllGateEvents={props.getAllGateEvents} />
      }

      {props.eventListLoading ?
          <Text style={styles.statusTextStyle}>Loading ... </Text> :
        props.eventListError ?
          <Text style={styles.statusTextStyle}>Error</Text> :
        !showFilter ?
            <FlatList
              showFilter={showFilter}
              data={ props.currentPage === 1 && localEvents.length > 0 ? convertEvents() : props.allGateEvents }
              renderItem={ renderItem }
              keyExtractor={ keyExtractor } /> :
        null
      }

      { showImages &&
          <ListImageViewer  lpn={lpn}
                            load={load}
                            additional={additional}
                            timestamp={timestamp}
                            closeShowImage={closeShowImage} />
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