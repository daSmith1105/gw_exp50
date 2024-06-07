
import React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../common';
import { moderateScale } from 'react-native-size-matters';
import moment from 'moment';

const ListItem = (props) => {
    const { item, viewEventImages, allEvents } = props;

    const maxSyncRetry = useSelector(state => state.settings.maxSyncRetry)

    return (
        <TouchableOpacity style={{ ...styles.itemContainerStyle, paddingBottom: item.eventId === allEvents[allEvents.length -1].eventId ? 200 : 5 }}>
            <View style={{  ...styles.itemTimestampStyle,
                                backgroundColor: item.typeId  === 1 ? 'lightgreen'
                                                : item.typeId  === 2 ? 'lightblue'
                                                : item.typeId  === 3 ? 'goldenrod'
                                                : 'red' }}>
                <Text>{ moment(item.eventTimestamp).format('MM-DD-YYYY h:mm a') }</Text>
                {isNaN(parseInt(item.eventId)) && <Text style={{...styles.indicator, backgroundColor: item.failedCount >= maxSyncRetry  ? 'red' : item.error ? 'orange' : 'yellow'}}>&nbsp;</Text>}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10}}>
                <View style={{ flexDirection: 'column', width: '70%' }}>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>
                        Type: { item.typeId === 1 ? 'IN'
                              : item.typeId  === 2 ? 'OUT'
                              : item.typeId  === 3 ? 'DENIED'
                              : 'ACCIDENT' }
                    </Text>

                    <Text style={{ fontSize: moderateScale(12,.2) }}>{`LPN: ${item.lpnName ? item.lpnName : '?'}`}</Text>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>{ `Company: ${item.companyName ? item.companyName : '?'}`}</Text>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>{ `Driver: ${item.personFirst ? item.personFirst : ''} ${item.personLast ? item.personLast : ''}`}</Text>

                    { (item.eventPassengers) && <Text style={{ fontSize: moderateScale(12,.2) }}>Passengers: { item.eventPassengers }</Text> }
                    { (item.eventPassengerCount > 0) && <Text style={{ fontSize: moderateScale(12,.2) }}>Passenger Count: { item.eventPassengerCount }</Text> }
                    { (item.eventComment !== "") && <Text style={{ fontSize: moderateScale(12,.2) }}>Comment: { item.eventComment }</Text> }
                </View>

                {(item.eventLpnPhoto || item.eventLoadPhoto) &&
                    <Button
                        text="Photos"
                        icon="eye"
                        onPress={ () => { viewEventImages( item.eventLpnPhoto, item.eventLoadPhoto, item.eventImages, item.eventTimestamp ) } }
                        width={ moderateScale(100,.4) }
                        backgroundColor='rgba(0,0,0,0.1)' />
                }
            </View>
        </TouchableOpacity>
    )
}

export default ListItem;

const styles = {
    itemContainerStyle: {
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 5
    },
    itemTimestampStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
        width: '100%',
        borderRadius: 5,
        fontSize: moderateScale(12,.2)
    },
    indicator: {
        overflow: 'hidden',
        borderRadius: 10,
        width: moderateScale(12,.2),
        height: moderateScale(12,.2)
    },
}