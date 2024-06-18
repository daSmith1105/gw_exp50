import React, {useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TextInput, Dimensions } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { Button } from '../common';
import Header from '../common/Header';
import * as actions from '../../actions';

const AddComment = ( props ) => {
  const inputAccessoryViewID = "uniqueID";
  // app state
  const { keyboardVisible } = useSelector( state => state.utility );
  const { comment } = useSelector( state => state.form );
  // component state
  const [ commentString, setCommentString ] = useState('');
  // dispatch
  const dispatch= useDispatch();

  // update the comment state on mount
  useEffect(() => {
    setCommentString(comment);
  }, []);

  const clearComment = () => {
    setCommentString('');
  };

  const hideAddComment = () => {
    dispatch(actions.hideAddCommentModal());
  };

  const handleTextChange = ( text ) => {
    setCommentString(text);
  };

  const saveComment = () => {
    dispatch(actions.handleInputChange('comment', commentString));
    dispatch(actions.hideAddCommentModal());
  };

  // TO DO: should cancel actually undo the changes made to the comment?

  return (
    <View style={ styles.containerStyle }>
      <Header />
      <Text style={ styles.titleStyle }>Event Comments</Text>

      <View style={ styles.buttonContainerStyle }>
        <Button
          onPress={ clearComment }
          text="Clear"
          color="grey"
          width={ Dimensions.get('window').width / 3 } />
        <Button
          onPress={ hideAddComment }
          text="Cancel"
          color="grey"
          width={ Dimensions.get('window').width / 4 } />
        <Button
          onPress={ saveComment }
          text="Save"
          color="grey"
          width={ Dimensions.get('window').width / 3 } />
      </View>

      <TextInput
          multiline={ true }
          numberOfLines={ 8 }
          autofocus={ true }
          autoCorrect={ false }
          onFocus= { () => dispatch(actions.toggleLayoutKeyboardVisible()) }
          onBlur= { () => dispatch(actions.toggleLayoutKeyboardVisible()) }
          onChangeText={ text => handleTextChange(text)}
          placeholder={'Enter comments ...'}
          keyboardAppearance={'dark'}
          value={ commentString }
          inputAccessoryViewID={ inputAccessoryViewID }
          style={[
            styles.commentStyle,
            { height: keyboardVisible ?
                Dimensions.get('window').height / 4 :
                '60%' }
          ]} />

    </View>
  );
};

export default AddComment;

const styles = {
    containerStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '95%',
      marginTop: '5%',
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'flex-start',
      zIndex: 10,
      paddingTop: verticalScale(105)
    },
    titleStyle: {
      marginTop: -10,
      marginBottom: 5,
      fontSize: moderateScale(30,.2)
    },
    buttonContainerStyle: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    commentStyle: {
      width: '95%',
      marginRight: 'auto',
      marginLeft: 'auto',
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: 10,
      marginTop: 20,
      fontSize: moderateScale(18,.2),
      padding: moderateScale(10,.5),
      textAlignVertical: 'top'
    }
};
