import React from 'react';
import { useSelector } from 'react-redux';
import { Text } from 'react-native';
import { RowSection } from '../common';
import { moderateScale } from 'react-native-size-matters';

const NetworkStatus = () => {

    const online = useSelector(state => state.data.online);

    return (
        <RowSection>
          <Text style={{ fontSize: moderateScale(16,.2), textAlign: 'center'}}>Connection Status: </Text>
          <Text style={{ fontSize: moderateScale(16,.2), fontWeight: 'bold', color: online ? 'green' : 'red' }}>
            { online ? ' ONLINE' : ' OFFLINE' }
          </Text>
        </RowSection>
    );
}

export default NetworkStatus;
