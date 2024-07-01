import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import Modal from '../common/Modal';

const ErrorReportStatusModal = (props) => {
    // app state
    const { sendingReport, reportErrorSuccess, reportErrorFail } = useSelector(state => state.settings);

    return (
        <View>
            { sendingReport &&
                <Modal  title={ 'Sending Error Report'}
                        loader />
            }
            { !sendingReport && reportErrorSuccess &&
                <Modal  title={ 'Error Report Sent Successfully.'}
                        icon="check"
                        iconColor="green"
                        confirmText="OK"
                        onConfirm={ props.onConfirm } />
            }
            { !sendingReport && reportErrorFail &&
                <Modal  title={ 'Sending Error Report Failed.' }
                        icon="exclamation-circle"
                        iconColor="goldenrod"
                        confirmText="OK"
                        onConfirm={ props.onConfirm } />
            }
        </View>
    )
}

export default ErrorReportStatusModal;