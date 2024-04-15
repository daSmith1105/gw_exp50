import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../common';
import { moderateScale } from 'react-native-size-matters';
import moment from 'moment';

const ListItem = (props) => {

    const { item, viewEventImages } = props;

    return (
        <TouchableOpacity onPress={ () => {} } 
                          style={styles.containerStyle} >
            <Text style={{  backgroundColor: item.type === 1 ? 
                                                'lightgreen': 
                                             item.type === 2 ? 
                                                'lightblue': 
                                             item.type === 3 ? 
                                                'goldenrod' : 
                                                'red', 
                            ...styles.dateTextStyle
                        }} >
                { moment(item.timestamp).format('MM-DD-YYYY h:mm a') }
            </Text>
            <View style={styles.dataContainerStyle}>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.textStyle}>Type: { item.type === 1 ? 'IN' : item.type === 2 ? 'OUT' : item.type === 3 ? 'DENIED' : 'ACCIDENT' }</Text>
                    <Text style={styles.textStyle}>LPN: { item.lpnObj.name }</Text>
                    <Text style={styles.textStyle}>Company: { item.companyObj.name  }</Text>
                    <Text style={styles.textStyle}>Driver: { item.driverObj.name  }</Text>
                    { item.passengerCount > 0 ?
                        <Text style={styles.textStyle}>PassengerCount: { item.passengerCount }</Text> :
                        null
                    }
                </View>
                <Button text="Photos"
                        icon="eye"
                        onPress={ () => { viewEventImages( item.lpnPhoto, item.loadPhoto, item.additionalPhotos, item.timestamp ) } }
                        width={ moderateScale(100,.4) }
                        backgroundColor={ 'rgba(0,0,0,0.1)' } />
            </View>
        </TouchableOpacity>
    )
}

export default ListItem;

const styles = {
    containerStyle: {
        paddingLeft: 10, 
        paddingRight: 10, 
        paddingTop: 3, 
        paddingBottom: 3, 
        width: '100%', 
        backgroundColor: 'white', 
        borderColor: 'grey', 
        borderWidth: 1, 
        borderRadius: 5
    },
    dateTextStyle: {
        fontWeight: 'bold', 
        paddingLeft: 5, 
        width: '105%', 
        borderRadius: 5, 
        marginLeft: -8,
        fontSize: moderateScale(12,.2)
    },
    dataContainerStyle: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },
    textStyle: {
        fontSize: moderateScale(12,.2)
    }
}
    