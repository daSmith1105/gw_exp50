import React, {useState, useEffect} from 'react';
import { View } from 'react-native';
import IntakeScreen from './src/screens/IntakeScreen';
import Loading from './src/components/common/Loading';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import * as actions from './src/actions';

// should syncing be done here or in redux state?
// should sync functionality all be contained within its own component/logic?

// TO DO: rework sync to be done in background and be more reliable
const Main = (props) => {

    // component state
    const [dataSyncTimeout, setDataSyncTimeout] = useState(datainterval);
    const [syncTimeout, setSyncTimeout] = useState(interval);
    const [syncProgress, setSyncProgress] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [finishSync, setFinishSync] = useState(false);

    const interval = 20; // attempt to sync events every 20 seconds if device is idle
    const datainterval = 60 * 5; // attempt to get new app data - lpns,companies,people every 5 minutes rgardless of if device is idle : 60 sec * 5
    let intervalID = 0;
    let dataIntervalID = 0;

    let unsubcribe = null; // net info event listener

    // app state
    const events = useSelector(state => state.data.events);
    const lpns = useSelector(state => state.data.lpns);
    const companies = useSelector(state => state.data.companies);
    const people = useSelector(state => state.data.people);
    const online = useSelector(state => state.data.online);
    const userId = useSelector(state => state.user.userId);
    const customerId = useSelector(state => state.user.customerId);
    const gateId = useSelector(state => state.user.gateId);
    const subscriberId = useSelector(state => state.user.subscriberId);
    const webToken = useSelector(state => state.auth.webToken);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
    
    // dispatch
    const dispatch = useDispatch();

    // run once on load, and cleanup on unmount
    useEffect(() => {
        if(isLoggedIn && online && customerId && webToken){
            dispatch(actions.getAppData(customerId, webToken));
        };
        intervalID = setInterval(decrementSyncTimeout, 1000);
        dataIntervalID = setInterval(decrementDataSyncTimeout, 1000);
        // set net info event listener
        unsubscribe = NetInfo.addEventListener(handleConnectionChange);

        return () => {
            clearInterval(intervalID);
            clearInterval(dataIntervalID);
            // remove net info event listener
            unsubscribe();
        };
    }, []);

  const handleConnectionChange = (connectionInfo) => {
    dispatch(actions.updateNetworkStatus(connectionInfo.isConnected));
  };

  const decrementDataSyncTimeout = async () => {
    if (dataSyncTimeout === 0) {
      clearInterval(dataIntervalID);
      // if we are not already syncing events and we are logged in and online - get new app data
      if(syncing){
        console.log('data sync aborted. already syncing events.');
        // we will get updated data as part of the event sync process so just reset the data sync timer
        resetDataSyncTime();
        return;
      };
      if(isLoggedIn && online){
        await dispatch(actions.getAppData(this.props.customerId,this.props.webToken));
      };
      // reset the timer
      resetDataSyncTime();
      return;
    };
    // if we aren't at zero just decrement the timer
    setDataSyncTimeout(dataSyncTimeout - 1);
  };

  const resetDataSyncTime = () => {
    if(dataIntervalID) { clearInterval(this.dataIntervalID) };
    setDataSyncTimeout(datainterval);
    dataIntervalID = setInterval(this.decrementDataSyncTimeout, 1000)
  };

  const decrementSyncTimeout = () => {
    if (syncTimeout === 0) {
      clearInterval(intervalID);
      syncData();
      return;
    };
    // if we aren't at zero just decrement the timer
    setSyncTimeout(syncTimeout - 1);
  };

  const resetSyncTime = () => {
    if(intervalID) { clearInterval(intervalID) };
    setSyncing(false);
    setFinishSync(true);
    setSyncProgress(1);
    setSyncTimeout(interval);
    intervalID = setInterval(decrementSyncTimeout, 1000);
  };

  const clearSyncTime = () => {
    if(intervalID) { clearInterval(intervalID) };
    setSyncing(false);
    setFinishSync(true);
    setSyncProgress(1);
    setSyncTimeout(interval);
  };

  const syncWithoutCheck = () => {
    const sync = new Promise( (resolve, reject) => syncData( resolve, reject, webToken, userId, gateId, subscriberId, customerId, lpns, companies, people, events ) );
    // wait for the sync function to finish then kick it off again in a bit    
    sync.then( () => {
      let p = syncProgress;
      setSyncProgress(p + 1);
        // if there was no user interaction since the last event push and we have additional events - attempt another event push imediately
        if( events && events.length > 0 && syncTimeout === 0 && !finishSync ) {
          syncWithoutCheck();
          return;
        };
        // reset the timer
        resetSyncTime();
    })
    .catch( error => {
      console.log('the sync function returned with error. ', error);
      resetSyncTime();
    })
  };

  // when syncInterval is at 0 && user is Logged in && there is a network connection - run once then check user interaction and reset interval if necessary
  // this function will sync local and network data
  const syncData = async() => {
      setSyncing(true);

      // if we are forcing this we don't want it to run multiple times - clear the previous timer and set a new one
      clearInterval(this.intervalID);

      if(!isLoggedIn){
        console.log('sync aborted. not logged in.')
        // call this function again at syncTimer value
        resetSyncTime();
        return;
      };

      if(!online){
        // call this function again at syncTimer value
        console.log('sync aborted. no network connection.')
        resetSyncTime();
        return;
      };

      if((events && events.length < 1)){
        console.log('sync aborted. no stored events.');
        // call this function again at syncTimer value
        resetSyncTime();
        return;
      }

      // call sync function      
      const sync = new Promise( (resolve, reject) => syncData( resolve, reject, webToken, userId, gateId, subscriberId, customerId, lpns, companies, people, events ) );
      // wait for the sync function to finish then kick it off again in a bit    
      sync.then( () => {
        let p = syncProgress;
        setSyncProgress(p + 1);
        // if there was no user interaction since the last event push and we have additional events - attempt another event push imediately
        if( events && events.length > 0 && syncTimeout === 0 && !finishSync ) {
            syncWithoutCheck();
            return
        };
        // reset the timer
        resetSyncTime();
      })
      .catch( error => {
        console.log('the sync function returned with error. ', error);
        resetSyncTime();
      })
  };

    return (
        <View style={ styles.containerstyle }>
            { props.isLoadingComplete ? 
                <IntakeScreen   syncTimeout={ syncTimeout }
                                resetSyncTime={ resetSyncTime }
                                clearSyncTime={ clearSyncTime }
                                syncData={ syncData } /> : 
                <Loading />
                }         
        </View>
    )
}

export default Main;

const styles = {
    containerStyle: {
      flex: 1, 
      marginTop: 30
    }
  };