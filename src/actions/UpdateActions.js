import axios from 'axios';
import packageJson from '../../package.json'
import config from '../../backend.json'

// all calls to Updates has been commented out as this is not installed since it could not be tested in Expo Go app
// they are kept here as reference once we implement expo-updates
// import { Updates } from 'expo-updates';

import {
  ALERT_MESSAGE,
  UPDATE_AVAILABLE,
  UPDATE_LATER,
  START_UPDATE,
  SET_UPDATE_STATUS,
  UPDATE_FAILED,
  APP_VERSION_CHANGED,
} from './types';

const API_URL = config.backend

export const checkBackendUpdates = () => {
  return async( dispatch, getState ) => {

    // since this is called in interval, and due to how states in interval messes up, let's get the necessary values directly from state here
    const state = getState()
    const online = state.utility.online
    const gateId = state.user.gateId
    const webToken = state.auth.webToken
    const ignoreUpdateWarning = state.update.ignoreUpdateWarning

    if (!online || !gateId || !webToken) {
      console.log('Aborting backend check.', {online, gateId, webToken: webToken.length})
      return
    }

    axios({
      method: 'get',
      headers: {
        'Content-Accept': 'application-json',
        'Authorization': webToken
      },
      url: `${API_URL}api/mobilegatecheckin/${gateId}?v=${packageJson.version}`,
      timeout: 5000,

    }).then( async response => {
      let res = response.data

      // for as long as message is not empty - display it
      // if deprecated - give option to user to update or not - this popup will display every polling
      //    maybe add a state where ignore deprecated warnings until next start up
      // if not deprecated and update available - this means we should force update
      // if not deprecated and not update available - let's move on with our lives

      if (res.updateAvailable) {
        // our backend says we have an update available, now let's check if an update released to app store/google play
        try {
          // const update = await Updates.checkForUpdateAsync()
          // if (!update.isAvailable) {
          //   res.updateAvailable = false
          //   res.deprecated = false
          // }
        } catch (error) {
          res.updateAvailable = false
          res.deprecated = false
        }
      }

      if (res.updateAvailable) {
        if (!res.deprecated || !ignoreUpdateWarning) {
          dispatch({
            type: UPDATE_AVAILABLE,
            appLink: res.appLink,
            updateAvailable: res.updateAvailable,
            deprecated: res.deprecated,
          });
        }
      } else if (res.message) {
        dispatch({
          type: ALERT_MESSAGE,
          payload: res.message,
        });
      }

    }).catch( (error) => {
      // logging but no action needed
      console.log(error)
    });
  };
};

export const updateLater = (ignoreUpdateWarning) => {
  return {
    type: UPDATE_LATER,
    ignoreUpdateWarning: ignoreUpdateWarning,
  };
};

export const startUpdate = () => {
  return {
    type: START_UPDATE,
  };
};

export const update = () => {

  return async ( dispatch ) => {
    try {
      // fetch latest update codes
      dispatch({
        type: SET_UPDATE_STATUS,
        payload: 'Fetching latest update.',
      });

      // await Updates.fetchUpdateAsync()

      dispatch({
        type: SET_UPDATE_STATUS,
        payload: 'App will restart. Please wait while we apply new changes.',
      });

      // reset all necessary states first before reloading the app as any calls after reload may not be called (see expo API)
      dispatch({
        type: APP_VERSION_CHANGED,
      });

      // reload the app so the latest updates will be applied automatically rather than waiting for user to manually restart
      // await Updates.reloadAsync()

    } catch (error) {
      console.log(error)
      dispatch({
        type: UPDATE_FAILED,
      });
    }
  }
};

export const setUpdateStatus = (status) => {
  return {
    type: SET_UPDATE_STATUS,
    payload: status,
  };
};

export const resetReducerGroup = () => {
  return {
    type: APP_VERSION_CHANGED,
  };
};
