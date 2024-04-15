import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Button } from '../common';
import { moderateScale, scale } from 'react-native-size-matters';
import moment from 'moment';

const ListImageViewer = (props) => {

    return (
        <View style={styles.containerStyle}>
          <ScrollView contentContainerStyle={styles.scrollContainerStyle} 
                      showsVerticalScrollIndicator={ false }
                      maximumZoomScale={ 2 } >
            <Text style={styles.labelTextStyle}>
              LPN Photo  |  { moment(props.timestamp).format('MM-DD-YYYY h:mm a') }
            </Text>
            <Image 
              source={{ uri: props.lpn }}
              style={styles.imageStyle} />
            <Text style={{ ...styles.labelTextStyle, marginTop: scale(10) }}>
              Load Photo  |  { moment(props.timestamp).format('MM-DD-YYYY h:mm a') }
            </Text>
            <Image 
              source={{ uri: props.load }}
              style={styles.imageStyle} />
            
          </ScrollView>

          <View style={styles.buttonContainerStyle}>
            <Button
              text="Back"
              color='grey'
              icon={ 'arrow-circle-left' }
              width={ moderateScale(240,.2) }
              fontSize={ moderateScale(20,.2) }
              onPress={ props.closeShowImage } />
          </View>

        </View>
    )
}

export default ListImageViewer;

const styles = {
    containerStyle: {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '105%', 
        zIndex: 10, 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    scrollContainerStyle: {
        paddingTop: moderateScale(20,.2), 
        paddingBottom: moderateScale(105,.4)
    },
    labelTextStyle: {
        fontSize: moderateScale(14, .2), 
        fontWeight: 'bold', 
        color: 'white'
    },
    imageStyle: {
        height: moderateScale(400,.5), 
        width: moderateScale(240,.5), 
        borderRadius: 5
    },
    buttonContainerStyle: {
        width: '100%', 
        alignItems: 'center', 
        position: 'absolute', 
        bottom: 100, 
        left: 0, 
        right: 0, 
        margin: 'auto', 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        paddingBottom: 28, 
        paddingTop: moderateScale(10,.2)
    }
}