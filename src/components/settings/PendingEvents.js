import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Badge, RowSection } from '../common';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../actions';

const PendingEvents = (props) => {

    const localEvents = useSelector(state => state.data.events);
    const dispatch = useDispatch();

    return (

        <RowSection>
            <Text style={{ fontSize: moderateScale(16,.2) }}>Events Pending Upload: </Text>
            { localEvents && localEvents.length > 0 ?
                <TouchableOpacity onPress={ () => { dispatch(actions.showEventViewerModal()) } } >
                <Badge
                        text={ localEvents.length.toString() }
                        width={ moderateScale(80,.2) }
                        backgroundColor="goldenrod"
                        textColor="white"
                        borderColor="white"
                        size={ moderateScale(40,.2)} />
                </TouchableOpacity> :
                <View>
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
