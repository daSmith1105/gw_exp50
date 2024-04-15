import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Text, View, Image } from 'react-native';
import { Button } from '.';
import { moderateScale, scale } from 'react-native-size-matters';
import { FontAwesome } from '@expo/vector-icons';
import * as Device from 'expo-device';
import * as actions from '../../actions';

const Header = () => {
  const { online } = useSelector(state => state.data);
  const { isLoggedIn } = useSelector(state => state.auth);
  const { authId, gateName, userFullName, siteName } = useSelector(state => state.user);

  const dispatch = useDispatch();

  const toggleLogin = () => {
    dispatch(actions.toggleLogin());
  };

  return (
    <View style={ styles.headerStyle}>
      { isLoggedIn &&
        <View style={ styles.containerStyle }>
          { authId === 1 &&  
              <Text style={{ position: 'absolute', 
                             top: 20, 
                             left: 0, 
                             fontSize: moderateScale(10, .3), 
                             width: 200, 
                             color: 'red', 
                             fontWeight: 'bold' }}>
                  Must be a guard user to upload data
              </Text> 
          }

          { authId ===  1 ?
              <Text style={ styles.customerTextStyle }>Admin</Text> :
              <Text style={ styles.customerTextStyle }>Site: { siteName }</Text> 
          }
          
          { authId === 3 ?
            <View>
              <Text style={ styles.usernameTextStyle }>Gate: { gateName }</Text>
              <Text style={ styles.usernameTextStyle }>Guard: { userFullName }</Text>
            </View> :
            <Text style={ styles.userName }>User: { userFullName }</Text>
          }
        </View> 
      }

      {!isLoggedIn && online && 
          // Login Prompt - online but not logged in  
          <Button
            onPress={ toggleLogin }
            text={ Device.osName === 'iOS' || Device.osName === 'iPadOS' ? 
                    `Login to Upload${"\n"}Events` : 
                    `Login under Settings${"\n"}to Upload Events`
                }
            color={ 'rgba(0,0,0,0.7)' }
            backgroundColor="lightgreen"
            fontSize={  moderateScale(16,.2)}
            width={ moderateScale(160, .6) }
            height={ moderateScale(53, .3) } />
      }

      { !online ? 
          <View style={ styles.serverConnectionStyle }>
            <FontAwesome name="exclamation-circle" size={ moderateScale(14, .2) } color="white" />
            <Text style={ styles.offlineTextStyle }>Cannot connect to server. Using device storage.</Text> 
          </View> :
          null
      }

      <Image style={ styles.logoStyle }
              source={ require('../../../assets/gw-logo.jpg') } />    
    </View>
  )
};

export default Header;

const styles = {
    headerStyle: {
      zIndex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      height: moderateScale(80, .5),
      width: '100%',
      paddingTop: scale(5),
      paddingRight: scale(10),
      paddingLeft: scale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      marginBottom: 20
    },
    containerStyle: {
      marginTop: -38
    },
    customerTextStyle: {
      fontSize: moderateScale(14, .3),
      fontWeight: 'bold',
      justifyContent: 'center',
      marginTop: 30,
    },
    usernameTextStyle: {
      fontSize: moderateScale(14, .3),
      fontWeight: 'bold',
    },
    serverConnectionStyle: {
      position: 'absolute', 
      top: moderateScale(74, .3), 
      right: 0,
      backgroundColor: 'goldenrod', 
      padding: moderateScale(3,.2), 
      width: '110%',
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'center',
    },
    offlineTextStyle: {
      padding: 3, 
      fontSize: moderateScale(10,.2),
      fontWeight: 'bold',
      color: 'white'
    },
    logoStyle: {
      height: moderateScale(55, .5),
      width: moderateScale(125, .6),
      borderRadius: 5
    }
};