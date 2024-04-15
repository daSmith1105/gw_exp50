import React from 'react';
import { View, Text, Image } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const LoginFooter = props => {

  return(
    <View style={ styles.containerStyle }>
      <Text style={ styles.textStyle }>powered by: </Text>
      <Image  style={ styles.imageStyle }
              source={ require('../../../assets/dividia.jpg') } />
    </View>
  )
};

export default LoginFooter;

const styles = {
  containerStyle: {
    flexDirection: 'row', 
    position: 'absolute',
    bottom: verticalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  textStyle: {
    marginRight: scale(8),
    fontSize: moderateScale(14, .5),
    fontWeight: 'bold'
  },
  imageStyle: {
    height: moderateScale(32, .5), 
    width: moderateScale(176, .5)
  }
};