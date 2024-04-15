import React from 'react';
import { View, TextInput, Text, TouchableHighlight } from 'react-native'; 

const IntakeFormInput = ( props ) => {
  const { 
    containerStyle, 
    labelStyle, 
    inputStyle, 
    buttonStyle
  } = style;

  return (
    <View style={ containerStyle }>
      <Text style={ labelStyle }>{ props.label }</Text>
      <TextInput  onChangeText={ props.onChangeText } 
                  ref={ props.ref } 
                  style={ inputStyle }
                  value={ props.value }
                  autoCapitalize={ props.autoCapitalize || 'none' }
                  autoComplete={ false }
                  autoCorrect={ false }
                  clearButtonMode={ 'always' }
                  keyboardAppearance={'dark'} /> 
      <TouchableHighlight
          onPress={ props.onClear }
          style={ buttonStyle } >  
      </TouchableHighlight>              
    </View>
  );
};

export default IntakeFormInput;

const style = {
  containerStyle: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    flex: 1
  },
  labelStyle: {
    fontSize: 18,
    marginRight: 5
  },
  inputStyle: {
    fontSize: 18,
    padding: 5,
    width: 180
  },
  buttonStyle: {
    padding: 10, 
  }
};