
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../common';
import { moderateScale } from 'react-native-size-matters';
import moment from 'moment';

const ListItem = (props) => {
    const { item, viewEventImages, allGateEvents } = props;

    return (
        <TouchableOpacity style={{ ...styles.itemContainerStyle, 
                                   paddingBottom: item.eventId === allGateEvents[allGateEvents.length -1].eventId ? 
                                                    200 : //extra padding for last item
                                                    3 
                                }}>
            <Text style={{  ...styles.itemTimestampStyle,
                            backgroundColor: item.typeId  === 1 ? 
                                                'lightgreen': 
                                            item.typeId  === 2 ? 
                                                'lightblue': 
                                            item.typeId  === 3 ? 
                                                'goldenrod' : 
                                                'red'
                        }}>
                { moment(item.eventTimestamp).format('MM-DD-YYYY h:mm a') }
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>
                        Type: { item.typeId === 1 ? 
                                    'IN' : 
                                item.typeId  === 2 ? 
                                    'OUT' : 
                                item.typeId  === 3 ? 
                                    'DENIED' : 
                                    'ACCIDENT' }
                    </Text>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>
                        {`LPN: ${item.lpnName ? item.lpnName : '?'}`}
                    </Text>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>
                        { `Company: ${item.companyName ? item.companyName : '?'}`}
                    </Text>
                    <Text style={{ fontSize: moderateScale(12,.2) }}>
                        { `Driver: ${item.personFirst ? item.personFirst : ''} ${item.personLast ? item.personLast : ''}`}
                    </Text>
                    { item.eventPassengerCount && item.eventPassengerCount > 0 ?
                        <Text style={{ fontSize: moderateScale(12,.2) }}>PassengerCount: { item.eventPassengerCount }</Text> :
                        null
                    }
                </View>
                {(item.eventLpnPhoto && item.eventLpnPhoto.length > 0) || (item.eventLoadPhoto && item.eventLoadPhoto.length > 0) &&
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
        paddingLeft: 10, 
        paddingRight: 10, 
        paddingTop: 3, 
        width: '100%', 
        backgroundColor: 'white', 
        borderColor: 'grey', 
        borderWidth: 1, 
        borderRadius: 5
      },
      itemTimestampStyle: {
        fontWeight: 'bold', 
        paddingLeft: 5, 
        width: '105%', 
        borderRadius: 5, 
        marginLeft: -8,
        fontSize: moderateScale(12,.2)
      }
}