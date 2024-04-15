import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import packageJson from '../../../package.json';
import { RowSection } from '../common';

const SettingsHeader = () => {
    return (
        <RowSection>
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: moderateScale(30,.2) }}>Gate Watcher</Text>
            <Text style={{ fontSize: moderateScale(20,.2) }}>Version {packageJson.version}</Text>
          </View>
        </RowSection>
    );
}

export default SettingsHeader;