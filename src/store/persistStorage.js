
import AsyncStorage from '@react-native-async-storage/async-storage';
import getAppVersion from './helpers/AppVersion';
import { resetReducerGroup } from '../actions/UpdateActions';

const persistStorage = (store) => {
    AsyncStorage.getItem('reduxPersist:appVersion')
      .then((itemValue) => { 
        const currentAppVersion = getAppVersion;
        if (itemValue) {
          // if version is identified
          const app = JSON.parse(itemValue);
          if (app && app.version !== currentAppVersion) {
            // purge redux store - will log user out if they are logged in
            store.dispatch(resetReducerGroup());
            AsyncStorage.setItem(
              'reduxPersist:appVersion',
              JSON.stringify({ version: currentAppVersion }),
            );
          } else {
            // this will load the current data store
          }
        } else {
            //no previous version. set new version
            // purge redux store - will log user out if they are logged in
            store.dispatch(resetReducerGroup());
            AsyncStorage.setItem(
                'reduxPersist:appVersion',
                JSON.stringify({ version: currentAppVersion }),
            );
        }
      })
      .catch( error => {
        console.log('error: ', error)
        // purge redux store - will log user out if they are logged in
        store.dispatch(resetReducerGroup());
        AsyncStorage.setItem(
            'reduxPersist:appVersion',
            JSON.stringify({ version: currentAppVersion }),
        );
      })
  };

  export default persistStorage;