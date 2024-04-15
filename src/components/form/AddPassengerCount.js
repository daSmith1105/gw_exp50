import React, {useState, useEffect} from 'react';
import { View, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../common';
import Modal from '../common/Modal';
import { scale, moderateScale } from 'react-native-size-matters';
import * as actions from '../../actions';

const AddPassengerCount = ( props ) => {
  // component state
  const [currentCount, setCurrentCount] = useState(0);
  // app state
  const passengerCount = useSelector( state => state.form.passengerCount );
  // dispatch
  const dispatch = useDispatch();

  // update the count on mount and when our app state is changed
  useEffect(() => {
    setCurrentCount( passengerCount && passengerCount.length > 0 ? parseInt(passengerCount) : 0 );
  }, [passengerCount]);

  // on unmount - reset the component state
  // on mount (above) we will set the state to the current passenger count
  useEffect(() => {
    return () => {
      setCurrentCount(0);
    }
  }, []);

  const handleChangeText = text => {
    props.resetSyncTime()
    setCurrentCount( parseInt(text) );
  };

  const handleCounterChange = (type) => {
    props.resetSyncTime();
    switch (type) {
      case 'increment':
        setCurrentCount( currentCount + 1 );
        break;
      case 'decrement':
        if( currentCount > 0 ) {
          setCurrentCount( currentCount - 1 );
        } else {
          setCurrentCount( 0 );
        }
        break;
      default:
        break
    }
  };

  const handleModalConfirm = () => {
    dispatch(actions.handleInputChange( 'passengerCount', currentCountString ));
    dispatch(actions.hideAddPassengerModal());
    props.resetSyncTime();
  };

  const handleModalAbort = () => {
    dispatch(actions.hideAddPassengerModal());
    props.resetSyncTime();
  };

  return (
    <View style={ styles.containerStyle }>
      <Modal  title="Number of Passengers"
              subMessage="Do not include the driver of the vehicle in this count."
              confirmText="Save"
              abortText="Cancel"
              onConfirm={ handleModalConfirm}
              onAbort={ handleModalAbort } >
        <View style={ styles.counterStyle }>
          <View style={ styles.numberContainerStyle }>
            <TextInput 
              style={{ fontSize: moderateScale(50,.2), textAlign: 'center' }}
              onChangeText={ text => handleChangeText(text) }
              value={ currentCount.toString() }
              keyboardType={ 'number-pad' }
              returnKeyType='done'
              clearTextOnFocus />
          </View>

          <View style={ styles.buttonContainerStyle }>
            <Button 
              width={ moderateScale(40,.2) } 
              height={ moderateScale(40,.2) } 
              color={ 'grey' }
              icon={ 'plus' }
              onPress={ () => handleCounterChange('increment') }
            />
            <Button 
              width={ moderateScale(40,.2) } 
              height={ moderateScale(40,.2) } 
              color={ 'grey' }
              icon={ 'minus' }
              onPress={ () => handleCounterChange('decrement') }
            />
          </View>
        </View>
      </Modal>
    </View>
  )
};

export default AddPassengerCount;

const styles = {
  containerStyle: {
    position: 'absolute',
    top: -100,
    left: 0,
    width: '100%',
    height: '105%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10
  },
  counterStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: scale(20),
    marginBottom: scale(20),
    marginbottom: 80
  },
  numberContainerStyle: {
    height: moderateScale(100,.2),
    width: moderateScale(100,.2),
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainerStyle: {
    marginTop: moderateScale(-10,.05)
  }
};