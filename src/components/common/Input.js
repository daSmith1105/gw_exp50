import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { scale, moderateScale } from 'react-native-size-matters';

const Input = ( props ) => {

  return (
    <View style={ styles.containerStyle }>
      <Text style={ styles.textStyle }>{ props.label }</Text>
      <TextInput
        name={ props.name }
        style={ props.style ? props.style : styles.inputStyle }
        value={ props.value }
        keyboardAppearance="dark"
        textContentType={ props.textContentType }
        autoCorrect={ false }
        autoCapitalization="word"
        onChangeText={ props.onChangeText }
        placeholder={ props.placeholder }
        placeholderTextColor="gray"
        secureTextEntry={ props.secureTextEntry }
        onBlur={ props.onBlur }
        onFocus={ props.onFocus }
      />
    </View>
  );
};

export { Input };

const styles = {
  containerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textStyle: {
    fontSize: moderateScale(18,.2),
    marginRight: 10
  },
  inputStyle: {
    backgroundColor: '#f8f8f8',
    fontSize: moderateScale(18,.2),
    padding: scale(5),
    width: 200,
    borderRadius: 5
  }
}