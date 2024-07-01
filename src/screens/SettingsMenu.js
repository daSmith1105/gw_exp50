import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Dimensions } from 'react-native';
import { RowSection, Button } from '../components/common';
import SettingsHeader from '../components/settings/SettingsHeader';
import NetworkStatus from '../components/settings/NetworkStatus';
import PendingEvents from '../components/settings/PendingEvents';
import ErrorReporting from '../components/settings/ErrorReporting';
import ErrorReportStatusModal from '../components/settings/ErrorReportStatusModal';
import OnsiteCount from '../components/settings/OnsiteCount';
import LoginButton from '../components/settings/LoginButton';
import { moderateScale } from 'react-native-size-matters';
import EventList from './EventList';
import axios from 'axios';
import config from '../../backend.json';
import moment from 'moment';
import * as actions from '../actions';

const API_URL = config.backend;

const makeId = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  };
  return result;
};

const SettingsMenu = ( props ) => {
  // app state
  const { siteId, userId, gateId } = useSelector(state => state.user);
  const { webToken, isLoggedIn } = useSelector(state => state.auth);
  const { sendingReport } = useSelector(state => state.settings);

  // component state
  const [showReportSendConfirmation, setShowReportSendConfirmation] = useState(false);
  const [showEventList, setShowEventList] = useState(false);
  const [allGateEvents, setAllGateEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [eventListLoading, setEventListLoading] = useState(false);
  const [eventListError, setEventListError] = useState(false);

  const dispatch = useDispatch();

  // run once on mount
  useEffect(() => {
    if (gateId && parseInt(gateId) !== 0) {
      dispatch(actions.getOnsiteCountBySite(siteId, webToken));
    } else {
      dispatch(actions.setOnsiteCountByLocalEvents());
    }
  }, []);


  const handleLogout = () => {
    dispatch(actions.logoutUser(userId, 'logging out with this device'));
  };

  const handleErrorReport = () => {
    setShowReportSendConfirmation(true);
  };

  const toggleEventList = () => {
    if(!showEventList){
      getAllGateEvents(1);
      setShowEventList(true);
    } else {
      setShowEventList(false);
      setAllGateEvents([]);
    };
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

  const getAllGateEvents = async (page, searchParams) => {
    let type = !searchParams || !searchParams.type || searchParams.type === 'all' ? null : searchParams.type;
    let lpn = !searchParams || !searchParams.lpn || searchParams.lpn === 'all' ? null : searchParams.lpn;
    let company = !searchParams || !searchParams.company || searchParams.company === 'all' ? null : searchParams.company;
    let driver = !searchParams || !searchParams.driver || searchParams.driver === 'all' ? null : searchParams.driver;
    let start = !searchParams || !searchParams.start ? formatDate(new Date(moment().subtract(7, 'days')),'start') : formatDate(searchParams.start,'start');
    let end = !searchParams || !searchParams.end ? formatDate(new Date()) : formatDate(searchParams.end);
    let id = makeId(4); // id is added to the query so we allways get new data from the server - not 304 data cached
    setEventListLoading(true);
    setEventListError(false);
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
        timeout: 15000
      })
      .then( response => {
        if(!response || !response.data){
          throw new Error('error getting event list for gate')
        };
        let res = response.data;
        setAllGateEvents(res.result);
        setCount(res.count);
        setPages(res.pages);
        setCurrentPage(p);
        setEventListLoading(false);
      })
      .catch( (error) => {
        console.log(error)
        setAllGateEvents([]);
        setCount(0);
        setPages(0);
        setCurrentPage(0);
        setEventListLoading(false);
        setEventListError(true);
      });
    }
  };

  const clearErrorReportConfirmationModal = () => {
    setShowReportSendConfirmation(false);
  };

  const clearErrorReportStatusModal = () => {
    dispatch(actions.closeReportModal());
  };

  return (
    <View style={ styles.containerStyle }>
      <View style={ styles.listStyle }>

        <SettingsHeader />

        <NetworkStatus />

        <OnsiteCount />

        <PendingEvents />

        {isLoggedIn &&
          <View style={{ width: '100%' }}>
            <RowSection>
              <Button
                text="View Event List"
                color='grey'
                icon={ 'list' }
                iconSize={ moderateScale(16,.2) }
                width={ moderateScale(240,.2) }
                fontSize={ moderateScale(20,.2) }
                onPress={ toggleEventList }
              />
            </RowSection>

            <RowSection>
                <Button
                    text="Report Error"
                    onPress={ handleErrorReport }
                    color='grey'
                    icon={ 'warning' }
                    width={ moderateScale(240,.2) }
                    fontSize={ moderateScale(20,.2) }
                  />
            </RowSection>

            <RowSection>
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Button
                  text="Logout"
                  onPress={ handleLogout }
                  color='grey'
                  icon={ 'sign-out' }
                  width={ moderateScale(240,.2) }
                  fontSize={ moderateScale(20,.2) }
                />
              </View>
            </RowSection>
          </View>
        }

        {!isLoggedIn &&
          <LoginButton />
        }

        {/* close button  */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <Button
            color='grey'
            icon={ 'arrow-circle-left' }
            width={ moderateScale(40,.2) }
            fontSize={ moderateScale(20,.2) }
            onPress={ () => { dispatch(actions.toggleSettingsMenu()) } } />
        </View>

      </View>

      { !sendingReport && showReportSendConfirmation &&
          <ErrorReporting  onAbort={clearErrorReportConfirmationModal} setShowReportSendConfirmation={setShowReportSendConfirmation} />
      }

      { showEventList &&
          <EventList  toggleEventList={toggleEventList}
                      allGateEvents={allGateEvents}
                      count={count}
                      currentPage={currentPage}
                      pages={pages}
                      getAllGateEvents={getAllGateEvents}
                      eventListLoading={eventListLoading}
                      eventListError={eventListError} />
      }

      {/* error report send status modal(s)  */}
      <ErrorReportStatusModal onConfirm={ clearErrorReportStatusModal }  />

    </View>
  )
};

export default SettingsMenu;

const styles = {
  containerStyle: {
    flex: 1,
    position: 'absolute',
    top: 50,
    left: 0,
    width: '100%',
    height: Dimensions.get('window').height - 50,
    backgroundColor: 'white',
    zIndex: 32,
  },
  listStyle: {
    position: 'relative',
    top: 10,
    left: '2.5%',
    backgroundColor: 'white',
    width: '95%',
    height: Dimensions.get('window').height - 50,
    alignItems: 'center',
  }
};
