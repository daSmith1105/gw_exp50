import React from 'react';
import { View, Text } from 'react-native';

const Clock = (props) => {
    return (
      <View style={ styles.containerStyle}>
        <Text style={ styles.textStyle }>
            {props.date && props.date !== '' ? 
                    props.date.format("MM/DD/YY") : 
                    props.date 
            }
        </Text>
        <Text style={ styles.textStyle }>
            {props.date && props.date !== '' ? 
                    props.date.format("hh:mm a") : 
                    props.date 
            }
        </Text>
      </View>
    )
  }

  export { Clock };

  const styles = {
    containerStyle: {
        width: '100%', 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'flex-end',
        justifyContent: 'space-between', 
        position: 'absolute', 
        top: 6, 
        paddingRight: 14, 
        paddingLeft: 16
    },
    textStyle: {
        fontSize: 18, 
        fontWeight: 'bold'
    }
  }