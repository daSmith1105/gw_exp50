import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { moderateScale, scale } from 'react-native-size-matters';

const Button = ( props ) => {

  const { onPress,
          hidden,
          backgroundColor,
          noBorder,
          color,
          width,
          height,
          buttonStyle,
          iconRight,
          iconSize,
          fontSize,
          text,
          icon,
        } = props;


  return(
    <TouchableOpacity
          onPress={ onPress }
          style={{ visibility: hidden ? 'hidden' : 'visible' }}>
      <View style={ [ styles.buttonStyle,
                      { backgroundColor: backgroundColor || 'transparent',
                        borderColor: noBorder ? 'transparent' : color ? color : 'black',
                        width: width || moderateScale(150,.3),
                        height: height || 'auto' }, buttonStyle ] }>
        { !iconRight &&
            <FontAwesome
              name={ icon }
              size={ iconSize || moderateScale(20,.2) }
              color={ color || 'black' } />
        }

        { text &&
            <Text style={ [ styles.textStyle,
                            { color: color || 'black',
                              fontSize: fontSize || moderateScale(18,.2),
                              textAlign: 'center' } ] }>
              { text }
            </Text>
        }

        { iconRight &&
            <FontAwesome
              name={ icon }
              size={ iconSize || moderateScale(20,.2) }
              color={ color || 'black' } />
        }

        {/* this is only used in login screen - just for display purposes */}
        {props.children}
      </View>
    </TouchableOpacity>
  );
};

export { Button };

const styles = {
  buttonStyle: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 5,
    padding: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  textStyle: {
    marginRight: scale(5),
    marginLeft: scale(5),
  }
};