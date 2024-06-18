import React, {useState, useEffect} from 'react';
import { View, Image } from 'react-native';
import LoginFooter from '../components/login/LoginFooter';
import { Input, Button, Spinner, ErrorMessage } from '../components/common';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../actions';

const LoginScreen = ( props ) => {
  // app state
  const error = useSelector(state => state.auth.error);
  const loading = useSelector(state => state.auth.loading);
  const online = useSelector(state => state.utility.online);

  // component state
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  // dispatch
  const dispatch = useDispatch();

  // called once on load
  useEffect(() => {
    dispatch(actions.clearLoginError());
  }, []);

  const onEmailChange = text => {
    setEmail(text);
  };

  const onPasswordChange = text => {
    setPassword(text);
  };

  const handleSubmit = () => {
    if(online) {
      dispatch(actions.loginUser({ email: email.trim(), password: password.trim() }));
    };
  };

  const toggleKeyboard = () => {
    dispatch(actions.toggleLayoutKeyboardVisible());
  };

  const handleCancel = () => {
    // clear state
    setEmail('');
    setPassword('');
    dispatch(actions.toggleLogin());
    dispatch(actions.closeKeyboard());
  };

  return (
    <View style={ styles.containerStyle }>
      <Image  style={ styles.logoStyle } source={ require('../../assets/gw-logo.jpg') } />

      <Input
        label="Email"
        placeholder="email@email.com"
        textContentType="emailAddress"
        onChangeText={ text => onEmailChange(text) }
        value={ email }
        onFocus={ toggleKeyboard }
        onBlur={ toggleKeyboard } />
      <Input
        secureTextEntry
        label="Password"
        placeholder="password"
        textContentType="password"
        onChangeText={ text => onPasswordChange(text) }
        value={ password }
        onFocus={ toggleKeyboard }
        onBlur={ toggleKeyboard } />

      { online ?
        <ErrorMessage errorText={ error } /> :
        <ErrorMessage errorText="Cannot connect to server please try again later." />
      }

      <View style={ styles.buttonContainerStyle }>
        <Button
            onPress={ handleCancel }
            text="Cancel" />

        { loading ?
            <Button
              color="lightgrey"
              borderColor="lightgrey" >
              <Spinner size="large" />
            </Button> :
            <Button
              onPress={ handleSubmit }
              text="Login"
              color={ online ? 'black' : 'lightgrey' }
              borderColor={ online ? 'black' : 'lightgrey' } />
        }
      </View>
      <LoginFooter />
    </View>
  )
};

export default LoginScreen;

  const styles = {
    containerStyle: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    logoStyle: {
      height: 150,
      width: 317,
      marginBottom: 20,
      marginTop: '50%',
      marginRight: 'auto',
      marginLeft: 'auto'
    },
    buttonContainerStyle: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    }
  };

