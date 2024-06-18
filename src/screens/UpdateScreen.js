import React, {useState, useEffect} from 'react'
import { Switch, Text, View, Linking, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Modal from '../components/common/Modal'
import Loading from '../components/common/Loading'
import * as actions from '../actions'

const UpdateScreen = ( props ) => {

  const dispatch = useDispatch()
  const forceSync = useSelector(state => state.sync.forceSync);
  const appLink = useSelector(state => state.update.appLink);
  const deprecated = useSelector(state => state.update.deprecated);
  const updating = useSelector(state => state.update.updating);
  const updateStatus = useSelector(state => state.update.updateStatus);

  const [ignoreWarning, setIgnoreWarning] = useState(false)

  useEffect(() => {
    if (updating && !forceSync) {
      // we're done with force syncing local pending events, so let's move on to the actual app update
      // dispatch(actions.update())

      // as of now, expo-updates hasn't been tested, so we will abort and let user manually install the latest app
      updateLater()
    }
  }, [updating, forceSync])

  const updateNow = () => {
    // this sets forceSync to true which triggers the force upload feature
    // the useEffect will then be responsible for continuing the rest of the update process once force syncing is done
    dispatch(actions.startUpdate())
  }

  const updateLater = () => {
    dispatch(actions.updateLater(ignoreWarning))
  }

  const toggleIgnoreWarning = () => {
    setIgnoreWarning(!ignoreWarning)
  }

  return (
    <View style={ styles.containerStyle }>
      {updating
        ? <View style={styles.loadingContainerStyle}>
            <Loading message={updateStatus} />
          </View>

        : <Modal title={'Updates Available'} confirmText="Upload Events" abortText="Update Later" onConfirm={ updateNow } onAbort={ updateLater }>
            <View style={ styles.innerContainer }>
              <Text style={styles.text}>A newer version of GateWatcher is now available. Please update to the latest version to enjoy enhanced features and improvements.</Text>

              <View style={styles.guide}>
                <Text style={{...styles.text, ...styles.highlight}}>To update:</Text>

                <Text style={styles.text}>1. Ensure you have a stable internet connection</Text>
                <Text style={styles.text}>2. Click <Text style={styles.highlight}>Upload Events</Text> below</Text>
                <Text style={styles.text}>3. Go to <Text style={styles.highlight}>Settings</Text></Text>
                <Text style={styles.text}>4. Confirm pending events are cleared out</Text>
                <Text style={styles.text}>5. Delete this app</Text>
                <Text style={styles.text}>6. Download the latest GateWatcher app in</Text>

                <TouchableOpacity onPress={() => Linking.openURL(appLink)}>
                  <Text style={styles.link}>{appLink}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.warning}>* If there are pending events that couldn't be uploaded after step 2 or if you need any assistance, please contact GateWatcher support at <Text style={styles.highlight}>817-288-1040</Text></Text>

              {/* {deprecated &&
                <View>
                  <View style={styles.switchContainer}>
                    <Switch trackColor={{ false: '#767577', true: '#70E781' }}
                            thumbColor={ignoreWarning ? '#367F41' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={ toggleIgnoreWarning }
                            value={ignoreWarning} />
                    <Text style={styles.text}>Ignore optional update notifications until next app launch</Text>
                  </View>

                    { ignoreWarning &&
                      <Text style={styles.warning}>
                        * We strongly recommend updating GateWatcher to the latest version to ensure optimal performance and security. Skipping this update may result in reduced functionality.
                      </Text>
                    }
                </View>
              } */}
            </View>
          </Modal>
      }
    </View>
  )
}

export default UpdateScreen

  const styles = {
    containerStyle: {
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
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
    innerContainer: {
      width: '100%',
      marginBottom: 40,
      alignItems: 'center',
    },
    guide: {
      marginTop: 20,
      marginBottom: 20,
    },
    text: {
      fontSize: 14,
      marginBottom: 10,
    },
    highlight: {
      fontWeight: 'bold',
    },
    link: {
      fontSize: 14,
      marginBottom: 10,
      color: 'blue',
    },
    warning: {
      fontSize: 14,
      textAlign: 'center',
      color: 'red',
    },
    switchContainer: {
      width: '90%',
      display: 'flex',
      flexDirection: 'row',
      gap: '10%',
      marginTop: 20,
    },
  }

