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
import * as actions from '../actions';

const SettingsMenu = ( props ) => {
  // app state
  const { siteId, userId, gateId } = useSelector(state => state.user);
  const { webToken, isLoggedIn } = useSelector(state => state.auth);
  const { sendingReport } = useSelector(state => state.settings);

  // component state
  const [showReportSendConfirmation, setShowReportSendConfirmation] = useState(false);
  const [showPendingEventList, setShowPendingEventList] = useState(false);
  const [showEventList, setShowEventList] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // run once on mount
    if (gateId && parseInt(gateId) !== 0) {
      dispatch(actions.getOnsiteCountBySite(siteId, webToken));
    } else {
      dispatch(actions.setOnsiteCountByLocalEvents());
    }
  }, []);

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

  return (
    <View style={ styles.containerStyle }>
      <View style={ styles.listStyle }>

        <SettingsHeader />

        <NetworkStatus />

        <OnsiteCount />

        <PendingEvents setShowPendingEventList={setShowPendingEventList} />

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
            fontSize={ moderateScale(20,.2) }
            onPress={ () => { dispatch(actions.toggleSettingsMenu()) } } />
        </View>

      </View>

      { showPendingEventList && <EventList  hideEventList={hideEventList} pending={true} /> }
      { showEventList && <EventList  hideEventList={hideEventList} pending={false} /> }

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
