import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from './Button';
import { FontAwesome } from '@expo/vector-icons';
import { scale, moderateScale } from 'react-native-size-matters';

class Modal extends React.Component {

  render() {

    return (
      <View style={ styles.containerStyle } >
        <View style={ styles.modalStyle }>
          <Text style={ styles.textStyle }>{ this.props.title }</Text>

          { this.props.message &&
            <Text style={ styles.messageStyle }>{ this.props.message }</Text>
          }
          { this.props.subMessage &&
            <Text style={ styles.subMessageStyle }>{ this.props.subMessage }</Text>
          }

          { this.props.icon &&
            <FontAwesome name={ this.props.icon } size={ moderateScale(60,.2) } color={ this.props.iconColor } />
          }

          { this.props.loader &&
            <Image  source={ require('../../../assets/loader.gif') }
                    style={{ width: 150, height: 150, marginTop: -10 }} />
          }

          { this.props.children }

          <View style={ styles.buttonContainerStyle }>
            { this.props.onAbort &&
              <Button
                text={ this.props.abortText || 'Cancel' }
                onPress={ this.props.onAbort }
                color='grey'
              />
            }

            { this.props.onConfirm &&
              <Button
                text={ this.props.confirmText || 'OK' }
                onPress={ this.props.onConfirm }
                color='grey'
              />
            }
          </View>

        </View>
      </View>
    );
  };
};

export default Modal;

const styles = {
  containerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.9)',
    zIndex: 10,
  },
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '95%',
    maxWidth: moderateScale(500,.2),
    margin: 'auto',
    height: 'auto',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: scale(10),
    shadowColor: 'black',
    shadowOffset: { width: 3 , height: 20 },
    shadowOpacity: .5,
    shadowRadius: 10,
  },
  messageStyle: {
    marginBottom: moderateScale(10,.2),
    fontSize: moderateScale(18,.2),
    width: '80%',
    textAlign: 'center',
    zIndex: 5
  },
  subMessageStyle: {
    fontSize: moderateScale(16,.2),
    width: '80%',
    marginTop: moderateScale(10,.2),
    textAlign: 'center',
    zIndex: 5
  },
  textStyle: {
    fontSize: moderateScale(20,.2),
    marginBottom: moderateScale(20, .2),
    textAlign: 'center'
  },
  buttonContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  }
};
