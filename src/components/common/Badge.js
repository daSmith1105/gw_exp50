import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const Badge = (props) => {
  return (
    <View style={ 
            [   styles.badgeStyle,
                {   backgroundColor: props.backgroundColor || 'white', 
                    borderColor: props.borderColor || 'black', 
                    width: props.width || props.size || moderateScale(40,.2), 
                    height: props.size || moderateScale(40,.2), 
                    lineheight: props.size || moderateScale(40,.2) 
                },
                props.style
            ]}>
      <Text style={{ fontSize: props.size / 2, fontWeight: 'bold', color: props.textColor || 'black' }}>
        { props.text || 'badge' }
      </Text>
    </View>
  )
};

export { Badge };

const styles = {
  badgeStyle: {
    padding: moderateScale(2,.5),
    zIndex: 5,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
};