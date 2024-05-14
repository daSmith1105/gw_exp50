import React, {useState, useEffect} from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import IntakeScreen from './src/screens/IntakeScreen';
import Loading from './src/components/common/Loading';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import * as actions from './src/actions';

const Main = (props) => {
  const initialTap = Gesture.Tap().onBegin(() => { resetEventsSyncTime() })

  // component state
  const [syncState, setSyncState] = useState(0); // 0 - not syncing, 1 - ongoing sync, 2 - sync interrupted
  const [tap, setTap] = useState(initialTap)
  const [eventsIntState, setEventsIntState]  = useState(0)
  const [dataIntState, setDataIntState] = useState(0)

  let eventsIntRef = 0;
  let dataIntRef = 0;
  const eventsIntTime = 20 * 1000; // (ms) attempt to sync events every 20 seconds if device is idle
  const dataIntTime = 5 * 60 * 1000; // (ms) attempt to get new app data - lpns,companies,people every 5 minutes if devicce is not syncing events
  let unsubscribe = null; // net info event listener

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

  useEffect(() => {
    // set net info event listener
    const handleConnectionChange = (connectionInfo) => {
      dispatch(actions.updateNetworkStatus(connectionInfo.isConnected))
    }
    unsubscribe = NetInfo.addEventListener(handleConnectionChange);

    // as long as user is active on the app - we'll delay syncing
    const t = Gesture.Tap().onBegin(() => { resetEventsSyncTime() })
    setTap(t)

    return () => {
      clearInterval(eventsIntRef);
      clearInterval(eventsIntState)
      clearInterval(dataIntRef);
      clearInterval(dataIntState)
      unsubscribe(); // remove net info event listener
    };
  }, [])

  useEffect(() => {
    // the main idea is - on every tap the sync resets
    // problem #1:
    // NOTE: this is not an issue, this is a known behavior when dealing with event listeners
    //      the tap handler takes a "snapshot" of the events interval id when the handler was invoked,
    //      so since it was declared on mount, events interval id at that time is 0/null
    //      (whatever that is, it doesn't matter, the point is, the events interval id that the gesture handler "knows" is whatever the value is when it was invoked)
    //      because of that, when the handler calls reset sync, it clears the interval 0, and creates a new one
    //      so technically, nothing was cleared, and instead a new one is added, not a replacement, so the intervals piles up and the app becomes too bloated with background intervals
    // solution #1:
    //      put the events interval id in state, and create a useeffect, so that everytime the events interval id changes, we re-bind the gesture handler
    //      so when a tap is made and it calls out reset, the reset can clear the correct/latest events interval id and a new one replaces the old interval
    // problem #2:
    // NOTE this is not an issue also, but a known behavior with useState and setInterval
    //      now that events interval id is in state, setInterval() also takes a snapshot of the events interval id when it was invoked, which is 0
    // solution #2: use state to re-bind tap gesture handler, use ref to clear interval

    const t = Gesture.Tap().onBegin(() => { resetEventsSyncTime() })
    setTap(t)
  }, [eventsIntState])

  useEffect(() => {
    clearInterval(eventsIntRef);
    clearInterval(eventsIntState)
    clearInterval(dataIntRef);
    clearInterval(dataIntState)

    if (isLoggedIn && online && customerId && webToken) {
      eventsIntRef = setInterval(syncEvents, eventsIntTime);
      dataIntRef = setInterval(syncData, dataIntTime);
      setEventsIntState(eventsIntRef)
      setDataIntState(dataIntRef)
    }
  }, [isLoggedIn, online, customerId, webToken]);

  useEffect(() => {
    // main purpose of this effect is to continue syncing or refresh data if sync is done/interrupted

    if ( events && events.length > 0 && syncState === 1 ) {
      // if there are still events to push and there was no user interaction since the last event push, attempt another event push imediately
      syncEvents();

    } else if (syncState !== 0) {
      // else if we were syncing but got interrupted by user events, or if there are no more events to sync
      // lets refresh our data with the latest from db so user can continue using the app with updated data
      resetEventsSyncTime()
      resetDataSyncTime()
      isLoggedIn && online && dispatch(actions.getAppData(customerId, webToken))
      setSyncState(0)
    }
  }, [events])

  const syncEvents = async () => {
    if (!isLoggedIn || !online || !events || events.length === 0) {
      return resetEventsSyncTime();
    }

    // we will pause data sync while we are syncing, anyway, we will be getting data once sync stops/pause
    resetDataSyncTime()
    clearInterval(eventsIntRef)
    setSyncState(1)

    // call sync function - this syncs one event only
    await dispatch(actions.syncEvent( webToken, userId, gateId, subscriberId, customerId, lpns, companies, people, events ) );
    // once this finishes, it will be caught by our useEffect for events, and it will be the one to handle resetting sync and refreshing data
  }

  const resetEventsSyncTime = () => {
    clearInterval(eventsIntRef)
    clearInterval(eventsIntState)
    eventsIntRef = setInterval(syncEvents, eventsIntTime)
    setEventsIntState(eventsIntRef)
    setSyncState(2)
  }

  const syncData = async () => {
    clearInterval(dataIntRef)

    // if we are not already syncing events and we are logged in and online - get new app data
    if (syncState === 0) {
      await dispatch(actions.getAppData(customerId, webToken))
    }

    resetDataSyncTime()
  }

  const resetDataSyncTime = () => {
    clearInterval(dataIntRef)
    clearInterval(dataIntState)
    dataIntRef = setInterval(syncData, dataIntTime);
    setDataIntState(dataIntRef)
  }

  return (
    <View style={ styles.containerStyle }>
      <GestureDetector gesture={tap}>
        { props.isLoadingComplete ? <IntakeScreen /> : <Loading /> }
      </GestureDetector>
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