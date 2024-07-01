import React from 'react';
import { useDispatch } from 'react-redux';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import { FontAwesome } from '@expo/vector-icons';
import * as actions from '../../actions';

const Footer = () => {

  const dispatch = useDispatch();

  const toggleSettings = () => {
    dispatch(actions.toggleSettingsMenu());
  }
  return (
    <View style={ styles.footerStyle }>
      <TouchableOpacity onPress={toggleSettings} >
        <FontAwesome name="cog"
                     size={moderateScale(30, .3)}
                     color="grey" />
      </TouchableOpacity>
    </View>
  )
};

export default Footer;

const styles = {
  footerStyle: {
      position: 'absolute',
      bottom: verticalScale(5),
      right: moderateScale(5),
      width: Dimensions.get('window').width / 2,
      backgroundColor: 'transparent',
      padding: scale(10),
      alignItems: 'flex-end',
  }
};