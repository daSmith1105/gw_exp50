import React from 'react';
import { View, Text } from 'react-native';

const ErrorMessage = (props) => {
  
    return(
        <View style={ styles.errorContainer }>
            <Text style={ styles.errorText }>{ props.errorText }</Text>
        </View>
    )
};

export { ErrorMessage };

const styles = {
    errorContainer: {
        backgroundColor: 'white',
        padding: 5,
        width : '90%',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    errorText: {
        color:'red',
        textAlign: 'center',
        fontSize: 18,
        minWidth: '100%'
    }
};