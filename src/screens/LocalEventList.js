import React, {useState} from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Button } from '../components/common';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { scale, moderateScale } from 'react-native-size-matters';
import * as actions from '../actions';
import ListItem from '../components/local_list/ListItem';

// **** this is the viewer list for events that are still on the device and have not yet been uploaded to the server ****
// called by clicking on the 'Events Pending Upload' button in the settings menu

const EventViewer = ( props ) => {
  // app state
  const localEvents = useSelector( state => state.data.events );

  // component state
  const [showImages, setShowImages] = useState(false);
  const [lpn, setLpn] = useState('');
  const [load, setLoad] = useState('');
  const [additional, setAdditional] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const dispatch = useDispatch();

  const viewEventImages = ( lpn, load, additional, timestamp ) => {
    setShowImages(true);
    setLpn(lpn);
    setLoad(load);
    setAdditional(additional);
    setTimestamp(timestamp);
  };

  const closeImageViewer = () => {
    setShowImages(false);
    setLpn('');
    setLoad('');
    setAdditional('');
    setTimestamp('');
  };

  const renderItem = ({item}) => {
    return(
      <ListItem item={ item } viewEventImages={ viewEventImages } />
    )
  };

  const keyExtractor = (item, index) => item.timestamp + '.' + index;

  return (
    <View style={ styles.containerStyle } >
      <FlatList
        data={ localEvents }
        renderItem={ renderItem }
        keyExtractor={ keyExtractor }
        style={{ height: '85%' }} />
      <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
        <Button
          text="Back"
          color='grey'
          icon={ 'arrow-circle-left' }
          width={ moderateScale(240,.2) }
          fontSize={ moderateScale(20,.2) }
          onPress={ () => { dispatch(actions.hideEventViewerModal()) } } />
      </View>

      { showImages &&
          <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '105%', zIndex: 10, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <ScrollView contentContainerStyle={{ paddingTop: moderateScale(20,.2), paddingBottom: moderateScale(105,.4) }}
                        showsVerticalScrollIndicator={ false }
                        maximumZoomScale={ 2 } >
              <Text style={{ fontSize: moderateScale(14, .2), fontWeight: 'bold', color: 'white' }}>
                LPN Photo  |  { moment(timestamp).format('MM-DD-YYYY h:mm a') }
              </Text>
              <Image
                source={{ uri: lpn }}
                style={{ height: moderateScale(400,.5), width: moderateScale(240,.5), borderRadius: 5 }} />
              <Text style={{ fontSize: moderateScale(14, .2), fontWeight: 'bold', color: 'white', marginTop: scale(10) }}>
                Load Photo  |  { moment(timestamp).format('MM-DD-YYYY h:mm a') }
              </Text>
              <Image
                source={{ uri: load }}
                style={{ height: moderateScale(400,.5), width: moderateScale(240,.5), borderRadius: 5 }} />

              { additional.map( ( a, index ) => {
                return (
                  <View key={ a.path }>
                    <Text style={{ fontSize: moderateScale(14, .2), fontWeight: 'bold', color: 'white', marginTop: scale(10) }}>
                      Photo: { index + 3 }  |  { moment(timestamp).format('MM-DD-YYYY h:mm a') }
                    </Text>
                    <Image
                      source={{ uri: a.path }}
                      style={{ height: moderateScale(400,.5), width: moderateScale(240,.5), borderRadius: 5 }} />
                  </View>
                )
              }) }
            </ScrollView>

            <View style={{ width: '100%',
                            alignItems: 'center',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            paddingBottom: 28,
                            paddingTop: moderateScale(10,.2) }}>
              <Button
                text="Back"
                color='grey'
                icon={ 'arrow-circle-left' }
                width={ moderateScale(240,.2) }
                fontSize={ moderateScale(20,.2) }
                onPress={ closeImageViewer }
              />
            </View>

          </View>
      }

    </View>
  )
};

export default EventViewer;

const styles = {
  containerStyle: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    zIndex: 40
  }
};