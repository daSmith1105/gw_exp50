import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { RowSection, Badge, Button } from '../common';
import * as actions from '../../actions'

const PendingEvents = (props) => {
    const dispatch = useDispatch();

    const online = useSelector(state => state.data.online);
    const lpns = useSelector(state => state.data.lpns);
    const companies = useSelector(state => state.data.companies);
    const people = useSelector(state => state.data.people);
    const events = useSelector(state => state.data.events);
    const webToken = useSelector(state => state.auth.webToken);
    const userId = useSelector(state => state.user.userId);
    const customerId = useSelector(state => state.user.customerId);
    const subscriberId = useSelector(state => state.user.subscriberId);
    const gateId = useSelector(state => state.user.gateId);
    
    const handleForceUpload = async () => {
        if (!online) {
            // intentionally allowing user to presss force upload even when they're not logged in so they know what factors are needed for the upload
            alert('No internet connection!')
        }
        dispatch(actions.setUploading(true))
        let tempEvents = [...events]
        const length = tempEvents.length
        for (let i = 0; i < length; i++) {
            await dispatch(actions.syncEvent( webToken, userId, gateId, subscriberId, customerId, lpns, companies, people, tempEvents ) );
            tempEvents.pop()
        }
        await dispatch(actions.getAppData(customerId, webToken))
        dispatch(actions.setUploading(false))
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
                
                {(events && events.length > 0) &&
                    <Button
                        text="Force Upload"
                        onPress={ handleForceUpload }
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