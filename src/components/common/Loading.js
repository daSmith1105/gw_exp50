import React from 'react';
import { View, Image, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Spinner } from '.';
import splashImg from '../../../assets/dividia.jpg';

const Loading = (props) => {

  return(
    <View style={ styles.containerStyle }>
      { props.message && <Text style={styles.messageContainer}>{props.message}</Text>}
      <View style={ styles.spinnerContainerStyle }>
        <Spinner />
      </View>

      <Image source={ splashImg } />

    </View>
  );
};

export default Loading;

const styles = {
  containerStyle: {
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  spinnerContainerStyle: {
    height: 50,
  },
  messageContainer: {
    fontSize: moderateScale(16,.2),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
};