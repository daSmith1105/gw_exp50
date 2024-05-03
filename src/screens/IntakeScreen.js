import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import IntakeForm from '../components/form/IntakeForm';
import { useSelector } from 'react-redux';
import AddComment from '../components/form/AddComment';
import AddPassengerCount from '../components/form/AddPassengerCount';
import SettingsMenu from './SettingsMenu';
import LoginScreen from '../screens/LoginScreen';
import CameraJS from '../components/form/CameraJS';
import { useKeepAwake } from 'expo-keep-awake';
import * as Device from 'expo-device';
import { Dimensions, View } from 'react-native';

const { height, width } = Dimensions.get('window');

const IntakeScreen = props => {

  // app state
  const showSettingsMenu = useSelector(state => state.settings.showSettingsMenu);
  const showLoginScreen = useSelector(state => state.settings.showLoginScreen);
  const showCamera = useSelector(state => state.camera.showCamera);
  const showAddComment = useSelector(state => state.modal.showAddComment);
  const showAddPassenger = useSelector(state => state.modal.showAddPassenger);

  useKeepAwake();

    return(
      <View>
        {/* panel is overlaid on top of the intake form */}
        { showCamera &&
            <CameraJS />
        }

        {/* panel is overlaid on top of the intake form */}
        { showAddPassenger &&
            <View style={ Device.osName === 'iOS' || Device.osName === 'iPadOS' ?
                            styles.addPassengerIOS :
                            styles.addPassengerAndroid }>
              <AddPassengerCount />
            </View>
        }

        {/* panel is overlaid on top of the intake form */}
        { showAddComment &&
            <View style={ Device.osName === 'iOS' || Device.osName === 'iPadOS' ?
                            styles.addCommentIOS :
                            styles.addCommentAndroid }>
              <AddComment />
            </View>
        }

        {/* panel is overlaid on top of the intake form */}
        { showSettingsMenu &&
            <View style={ Device.osName === 'iOS' || Device.osName === 'iPadOS' ?
                            styles.settingsMenuIOS :
                            styles.settingsMenuAndroid }>
              <SettingsMenu />
            </View>
        }

        {/* panel is overlaid on top of the intake form */}
        { showLoginScreen &&
            <View style={ Device.osName === 'iOS' || Device.osName === 'iPadOS' ?
                            styles.loginScreenIOS :
                            styles.loginScreenAndroid }>
              <LoginScreen />
            </View>
        }

        <View style={ styles.containerStyle }>
          <Header />
          <IntakeForm />
          <Footer />
        </View>

      </View>
    )
};

export default IntakeScreen;

const styles = {
  containerStyle: {
    position: 'relative',
    height: `95%`,
    marginTop:'5%',
    width: width
  },
  addPassengerIOS: {
    height: height,
    width: width
  },
  addPassengerAndroid: {
    height: 0,
    width: 0,
    position: 'absolute',
    top: -2000000,
    left: -200000
  },
  addCommentIOS: {
    height: height,
    width: width
  },
  addCommentAndroid: {
    height: 0,
    width: 0,
    position: 'absolute',
    top: -2000000,
    left: -200000
  },
  settingsMenuIOS: {
    height: height,
    width: width,
    zIndex: 1
  },
  settingsMenuAndroid: {
    height: 0,
    width: 0,
    position: 'absolute',
    top: -2000000,
    left: -200000
  },
  eventViewerIOS: {
    height: height,
    width: width
  },
  eventViewerAndroid: {
    height: 0,
    width: 0,
    position: 'absolute',
    top: -2000000,
    left: -200000
  },
  loginScreenIOS: {
    height: height,
    width: width,
    backgroundColor: 'white',
    zIndex: 1
  },
  loginScreenAndroid: {
    position: 'absolute',
    top: -200000,
    left: -200000
  }
};
