import React from 'react';
import { View, Image } from 'react-native';
import { Spinner } from '.';
import splashImg from '../../../assets/dividia.jpg';

const Loading = () => {

  return(
    <View style={ styles.containerStyle }>
      <Image source={ splashImg } />
      <View style={ styles.spinnerContainerStyle }>
        <Spinner />
      </View>
    </View>
  );
};

export default Loading;

const styles = {
  containerStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',   
    position: 'relative'
  },
  spinnerContainerStyle: {
    position: 'absolute', 
    top: '40%', 
    left: 0, 
    right: 0, 
    margin: 'auto'
  }
};