import React from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { RowSection, Button } from '../common';
import { useDispatch } from 'react-redux';
import * as actions from '../../actions';

const LoginButton = (props) => {
    const dispatch = useDispatch();

    return (
        <RowSection>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
              <Button
                text="Login"
                onPress={ () => { dispatch(actions.toggleLogin()); props.resetSyncTime() } }
                color='grey'
                icon={ 'sign-in' }
                width={ moderateScale(240,.2) }
                fontSize={ moderateScale(20,.2) }
              />
            </View>
        </RowSection>
    )
}

export default LoginButton;