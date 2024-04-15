import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, TextInput, Keyboard, Switch } from 'react-native';
import Modal from '../common/Modal';
import * as actions from '../../actions';

const ErrorReporting = (props) => {
    // app state
    const { subscriberId, customerId, userId, gateId } = useSelector(state => state.user);
    const localEvents = useSelector(state => state.data.events);
    const { webToken } = useSelector(state => state.auth);
    // component state
    const [comment, setComment] = useState('');
    const [includePendingEvents, setIncludePendingEvents] = useState(false);
    // dispatch
    const dispatch = useDispatch();

    // run once on mount
    useEffect(() => {
        setComment('');
        setIncludePendingEvents(false);
    }, []);

    const sendErrorReport = () => {
        props.resetSyncTime();
        setShowReportSendConfirmation(false);
    
        let pending = '[]';
        if(includePendingEvents){
          pending = JSON.stringify(localEvents)
        };
        dispatch(actions.reportError(webToken,comment,subscriberId,customerId,userId,gateId,pending));
        setShowReportSendConfirmation(false);
        setComment('');
        setIncludePendingEvents(false);
    };

    const toggleIncludePending = () => {
        setIncludePendingEvents(!includePendingEvents);
      };

    return (
        <Modal  title={ 'Error Report Confirmation.'}
                confirmText="OK"
                abortText="Cancel"
                onConfirm={ sendErrorReport }
                onAbort={ props.onAbort } > 
            <View style={styles.container}>
                <Text style={styles.commentText}>Add comment: (optional)</Text>              
                <TextInput  style={styles.commentInput}
                            returnKeyType="done"
                            multiline={true}
                            blurOnSubmit={true}
                            onSubmitEditing={()=>{Keyboard.dismiss()}}
                            multiline={true}
                            textAlignVertical="top"
                            numberOfLines={5}
                            value={comment}
                            onChangeText={ text => setComment(text)} />
                    
                <View style={styles.switchContainer}>
                    <Switch trackColor={{ false: '#767577', true: '#70E781' }}
                            thumbColor={includePendingEvents ? '#367F41' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={ toggleIncludePending }
                            value={includePendingEvents} />
                    <Text style={styles.switch}>
                        Clear and Send Pending Events
                    </Text>
                </View>
                { includePendingEvents &&
                    <Text style={styles.warningText}>
                        * warning: this will remove events from your device. please be certain this is what you would like to do
                    </Text>
                }
            </View>
        </Modal> 
    )
};

export default ErrorReporting;

const styles = {
    container: {
        width: '100%',
        marginBottom: 40,
    },
    commentText: {
        fontSize: 14,
    },
    commentInput: {
        width: '100%',
        borderRadius: 5,
        height: 80,
        borderColor: 'gray',
        borderWidth: 1,
        fontSize: 14,
        padding: 5,
    },
    switchContainer: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    switch: {
        marginLeft: 5,
        fontSize: 16,
    },
    warningText: {
        textAlign: 'center',
        color: 'red',
        fontSize: 14,
    },
};