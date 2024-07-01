import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../actions';
import Loading from './Loading';

const SyncEvents = (props) => {

  const dispatch = useDispatch();

  const updating = useSelector(state => state.update.updating);
  const online = useSelector(state => state.utility.online);
  const lpns = useSelector(state => state.data.lpns);
  const companies = useSelector(state => state.data.companies);
  const people = useSelector(state => state.data.people);
  const events = useSelector(state => state.data.events);
  const webToken = useSelector(state => state.auth.webToken);
  const userId = useSelector(state => state.user.userId);
  const customerId = useSelector(state => state.user.customerId);
  const subscriberId = useSelector(state => state.user.subscriberId);
  const siteId = useSelector(state => state.user.siteId);
  const gateId = useSelector(state => state.user.gateId);
  const maxSyncRetry = useSelector(state => state.settings.maxSyncRetry)

  const [processedEvents, setProcessedEvents] = useState([])
  const [totalEvents, setTotalEvents] = useState(0)

  useEffect(() => {
    if (events) {
      setTotalEvents(events.length)
      updating && dispatch(actions.setUpdateStatus(`Uploading events: 0 of ${events.length}`))
    }
  }, [])

  useEffect(() => {
    const handleForceSync = async () => {
      await forceSyncEvent()
    }
    handleForceSync()

  // when we call syncEvent below, the event can either be removed in the state or not
  // we want to loop thru all events once (as long as we are online) regardless of its outcome, so we listen for "events" changes
  }, [events])

  const forceSyncEvent = async () => {
    if (!online) {
      // intentionally allowing user to presss force upload even when they're not logged in so they know what factors are needed for the upload
      alert('No internet connection!')
      return
    }

    props.resetEventsSyncTime()

    const sortedEvents = [...events].filter(e => !processedEvents.includes(e.id)).reverse()
    if (sortedEvents && sortedEvents.length) {
      const eventId = sortedEvents[0].id
      const index = events.findIndex(e => e.id === eventId)

      let processedIds = [...processedEvents]
      processedIds.push(eventId)
      setProcessedEvents(processedIds)
      updating && dispatch(actions.setUpdateStatus(`Uploading events: ${processedIds.length} of ${totalEvents}`))

      await dispatch(actions.syncEvent( maxSyncRetry, webToken, userId, siteId, gateId, subscriberId, customerId, lpns, companies, people, events, index ) )
      // events useEffect will continue uploading the rest of the events

    } else {
      setProcessedEvents([])
      dispatch(actions.setForceSync(false))

      if (!updating) {
        await dispatch(actions.getAppData(customerId, webToken))
      }
    }
  }

  return (
    !updating
      ? <View style={styles.containerStyle}>
          <Loading message={`Uploading events: ${processedEvents.length} of ${totalEvents}`} />
        </View>
      : null
  );
};

export default SyncEvents;

const styles = {
  containerStyle: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    backgroundColor: 'white',
  },
};