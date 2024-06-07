import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, Dimensions } from 'react-native';
import { RowSection, Button } from '../components/common';
import Loading from '../components/common/Loading';
import SettingsHeader from '../components/settings/SettingsHeader';
import NetworkStatus from '../components/settings/NetworkStatus';
import PendingEvents from '../components/settings/PendingEvents';
import ErrorReporting from '../components/settings/ErrorReporting';
import ErrorReportStatusModal from '../components/settings/ErrorReportStatusModal';
import OnsiteCount from '../components/settings/OnsiteCount';
import LoginButton from '../components/settings/LoginButton';
import { moderateScale } from 'react-native-size-matters';
import EventList from './EventList';
import OnsiteList from './OnsiteList';
import * as actions from '../actions';

const SettingsMenu = ( props ) => {
  // app state
  const { siteId, userId, fUseNames } = useSelector(state => state.user);
  const { webToken, isLoggedIn } = useSelector(state => state.auth);
  const { sendingReport } = useSelector(state => state.settings);
  const { uploading, events, people } = useSelector(state => state.data);

  // component state
  const [showReportSendConfirmation, setShowReportSendConfirmation] = useState(false);
  const [showPeopleList, setShowPeopleList] = useState(false);
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [showPendingEventList, setShowPendingEventList] = useState(false);
  const [showEventList, setShowEventList] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
      dispatch(actions.getOnsiteList(siteId, webToken, events, people, fUseNames))
  }, [events.length])

  const hideEventList = () => {
    setShowPendingEventList(false)
    setShowEventList(false)
  }

  const handleErrorReport = () => {
    setShowReportSendConfirmation(true);
  };

  const clearErrorReportConfirmationModal = () => {
    setShowReportSendConfirmation(false);
  };

  const clearErrorReportStatusModal = () => {
    dispatch(actions.closeReportModal());
  };

  const handleLogout = () => {
    dispatch(actions.logoutUser(userId, 'logging out with this device'));
  };

  const showOnsiteList = (type) => {
    setShowPeopleList(false)
    setShowVehicleList(false)

    if (type === 'people') {
      setShowPeopleList(true)
    } else if (type === 'vehicle') {
      setShowVehicleList(true)
    }
  }

  return (
    <View style={ styles.containerStyle }>
      { uploading &&
        <View style={styles.loadingContainerStyle}>
          <Text style={styles.loadingText}>Uploading pending events</Text>
          <View style={{height: '20%'}}><Loading /></View>
        </View>
      }

      <View style={ styles.listStyle }>
        <SettingsHeader />
        <NetworkStatus />
        <OnsiteCount showOnsiteList={showOnsiteList} />
        <PendingEvents setShowPendingEventList={setShowPendingEventList} resetEventsSyncTime={props.resetEventsSyncTime} />

        { !isLoggedIn
          ? <LoginButton />
          : <View style={{ width: '100%' }}>
              <RowSection>
                <Button
                  text="View Event List"
                  color='grey'
                  icon={ 'list' }
                  iconSize={ moderateScale(16,.2) }
                  width={ moderateScale(240,.2) }
                  fontSize={ moderateScale(20,.2) }
                  onPress={() => setShowEventList(true) }
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

        {/* close button  */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <Button
            color='grey'
            icon={ 'arrow-circle-left' }
            width={ moderateScale(40,.2) }
            onPress={ () => { dispatch(actions.toggleSettingsMenu()) } } />
        </View>

      </View>

      { showPeopleList && <OnsiteList showOnsiteList={showOnsiteList} type={'people'} /> }
      { showVehicleList && <OnsiteList showOnsiteList={showOnsiteList} type={'vehicle'} /> }
      { showPendingEventList && <EventList hideEventList={hideEventList} pending={true} /> }
      { showEventList && <EventList hideEventList={hideEventList} pending={false} /> }

      { !sendingReport && showReportSendConfirmation &&
        <ErrorReporting  onAbort={clearErrorReportConfirmationModal} setShowReportSendConfirmation={setShowReportSendConfirmation} />
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
    top: 30,
    left: 0,
    width: '100%',
    height: Dimensions.get('window').height - 50,
    backgroundColor: 'white',
    zIndex: 32,
  },
  loadingContainerStyle: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: moderateScale(20,.2),
    fontWeight: 'bold',
    marginTop: '50%',
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
