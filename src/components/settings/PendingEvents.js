import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { RowSection, Badge, Button } from '../common';
import * as actions from '../../actions'

const PendingEvents = (props) => {
    const dispatch = useDispatch();

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
    const events = useSelector(state => state.data.events);
    const online = useSelector(state => state.utility.online);

    const handleForceSync = async () => {
        dispatch(actions.setForceSync(true))
    }

    return (
        <RowSection>
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={{ fontSize: moderateScale(16,.2) }}>Events Pending Upload: </Text>
                    <TouchableOpacity onPress={() => props.setShowPendingEventList(true)} disabled={events && events.length > 0 ? false : true}>
                        <Badge
                            text={ events.length.toString() }
                            width={ moderateScale(80,.2) }
                            backgroundColor="goldenrod"
                            textColor="white"
                            borderColor="white"
                            size={ moderateScale(40,.2)} />
                    </TouchableOpacity>
                </View>

                {(isLoggedIn && online && events && events.length > 0) &&
                    <Button
                        text="Force Upload"
                        onPress={ handleForceSync }
                        color='grey'
                        icon={ 'upload' }
                        width={ moderateScale(240,.2) }
                        fontSize={ moderateScale(20,.2) }
                    />
                }
            </View>
        </RowSection>
    )
};

export default PendingEvents;

const styles = {
    container: {
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
    },
}