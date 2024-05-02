import React from 'react';
import { Image } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux';
import { store, persistor } from './src/store';
import Main from './Main';
import Loading from './src/components/common/Loading';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Clock } from './src/components/common';
import { StatusBar } from 'expo-status-bar';
import dayjs from 'dayjs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// need to fix this - temporarily we will supress the warning
// this happens with Select.js component rendering a list within the scrollview of IntakeForm.js
if (__DEV__) {
  const ignoreWarns = ["VirtualizedLists should never be nested inside plain ScrollViews"];

  const errorWarn = global.console.error;
  global.console.error = (...arg) => {
    for (const error of ignoreWarns) {
      if (arg[0].startsWith(error)) {
        return;
      }
    }
    errorWarn(...arg);
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadingComplete: true,
      hasCameraPermission: null,
      hasCameraRollPermission: null,
      date: ''
    };

    this.timer = null;
  };

  componentDidMount() {
    this.startup();
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  };

  startup = async() => {
    // start the clock (upper right status bar)
    this.setState({ date: dayjs() });
    // update clock every minute
    this.timer = setInterval(() => {
      this.setState({ date: dayjs() }); // dayjs() always gives us the current time
    }, 1000 * 60);

    this.setState({ isLoadingComplete: true }, async () => {
        const op1 = await this._loadAssetsAsync();
        let photoDirectory = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'photos');
        if ( !photoDirectory.exists ) {
          await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos')
        }
      }, () => {
        this.setState({ isLoadingComplete: true });
      });
  };

  cacheFonts = (fonts) =>{
    return fonts.map(font => {
      return Font.loadAsync(font)
    });
  };

  cacheImages = (images) => {
    return images.map(image => {
      if (typeof image === 'string') {
        return Image.prefetch(image);
      } else {
        return Asset.fromModule(image).downloadAsync();
      }
    });
  };

  async _loadAssetsAsync() {
    const imageAssets = this.cacheImages([
      require('./assets/gw-logo.jpg'),
      require('./assets/dividia.jpg'),
    ]);
    const fontAssets = this.cacheFonts([FontAwesome.font,  MaterialIcons.font, MaterialCommunityIcons.font, Ionicons.font ]);
    await Promise.all([...imageAssets, ...fontAssets]);
  };

  render() {

    return (
      <GestureHandlerRootView style={{ flex: 1 }} >
        <Provider store={ store } >
          <StatusBar hidden />
          <Clock date={this.state.date} />
          <PersistGate loading={ <Loading /> }
                       persistor={ persistor } >
            { this.state.isLoadingComplete ?
                <Main hasCameraPermission={ this.state.hasCameraPermission }
                      hasCameraRollPermission={ this.state.hasCameraRollPermission}
                      isLoadingComplete={ this.state.isLoadingComplete } 
                      timerIntervalID={ this.timer } />  :
                <Loading />
            }
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    )
  };
}

export default App;