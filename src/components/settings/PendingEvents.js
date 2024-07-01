import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Badge, RowSection } from '../common';
import { useSelector } from 'react-redux';

const PendingEvents = (props) => {
    const events = useSelector(state => state.data.events);

    return (
        <RowSection>
            <Text style={{ fontSize: moderateScale(16,.2) }}>Events Pending Upload: </Text>
            { events && events.length > 0
                ?   <TouchableOpacity onPress={() => props.setShowPendingEventList(true)} >
                        <Badge
                            text={ events.length.toString() }
                            width={ moderateScale(80,.2) }
                            backgroundColor="goldenrod"
                            textColor="white"
                            borderColor="white"
                            size={ moderateScale(40,.2)} />
                    </TouchableOpacity>
                :   <View>
                        <Badge
                            text={ '0' }
                            width={ moderateScale(80,.2) }
                            backgroundColor="goldenrod"
                            textColor="white"
                            borderColor="white"
                            size={ moderateScale(40,.2)} />
                    </View>
            }
        </RowSection>
    )
};

export default PendingEvents;
