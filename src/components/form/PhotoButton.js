import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { scale, moderateScale } from 'react-native-size-matters';

const PhotoButton = props => {
  
  return(
    <TouchableOpacity onPress={ props.onPress } 
                      style={ styles.containerStyle }>
      <Text style={ styles.textStyle }>{ props.title }</Text>
      <View style={ styles.buttonStyle }>
        { props.image && props.image.length > 0 ?
            <Image 
              source={{ uri: props.image }}
              style={ styles.imageStyle } /> :
            <FontAwesome name="camera" 
                        size={ moderateScale(40,.2) } 
                        color="black" />
        }
        { props.image && !props.imutable &&
          <TouchableOpacity onPress={ props.onDelete } 
                            style={ styles.deleteIconStyle } >
            <FontAwesome name="minus-circle" 
                         size={ moderateScale(30,.2) } 
                         color="black"  />
          </TouchableOpacity> 
        }
      </View>
    </TouchableOpacity>
  );
};

export default PhotoButton;

const styles = {
    containerStyle: {
      alignItems: 'center',
      position: 'relative', 
      margin: scale(5), 
      marginBottom: scale(10)
    },
    buttonStyle: {
        borderRadius: 10,
        height: moderateScale(90,.2),
        width: moderateScale(90,.2),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'lightgrey',
    },
    textStyle: {
        fontSize: moderateScale(14,.2),
        textAlign: 'center',
        marginTop: scale(10)
    },
    imageStyle: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    deleteIconStyle: {
      position: 'absolute', 
      top: -5, 
      right: -3, 
      backgroundColor: 'white', 
      borderRadius: 50
    }
};