import React, {useState} from 'react';
import { View, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../common';
import {SingleSelectWithAdd} from '../common/SingleSelectWithAdd';
import Modal from '../common/Modal';
// import { handleInputChange, evaluateTouchEvent } from '../actions';
import { scale, moderateScale } from 'react-native-size-matters';
import { hideAddPassengerModal } from '../../actions';

const AddPassengerCount = props => {
  const dispatch = useDispatch();
  // get passengers and people from the store
  const passengers = useSelector( state => state.form.passengers );  
  const people = useSelector( state => state.data.people );
  // this will be incremented using the add button to determine how many select elements are present on the screen
  // max 8 passengers can be added
  const [passengerCount, setPassengerCount] = useState(1); 
  const [passenger1, setPassenger1] = useState('');
  const [passenger2, setPassenger2] = useState('');
  const [passenger3, setPassenger3] = useState('');
  const [passenger4, setPassenger4] = useState('');
  const [passenger5, setPassenger5] = useState('');
  const [passenger6, setPassenger6] = useState('');
  const [passenger7, setPassenger7] = useState('');
  const [passenger8, setPassenger8] = useState('');
  // keep track of inputs and their values in the state
  // when we click the add button we need to add a new input and default value to our state

  const confirmPassengers = () => {
    // add the passenger to the list of passengers - event.sPassengers
    hideModal();
    props.resetSyncTime();
  };

  const onCancel = () => {
    hideModal();
    props.resetSyncTime();
  };

  const handleAddPassengerInput = () => {
    const newCount = passengerCount + 1;
    setPassengerCount( newCount );
    props.resetSyncTime();
  };

  const hideModal = () => {
    // dispatch({ type: 'HIDE_ADD_PASSENGER_MODAL' });
    dispatch(hideAddPassengerModal())
  };

  const removePassengerInput = ( index ) => {
    // remove the passenger input from the state
    setPassengerCount( passengerCount - 1 );
    props.resetSyncTime();
  };

  return (
    <View style={ styles.containerStyle }>
      <Modal 
        title="Number of Passengers"
        subMessage="Do not include the driver of the vehicle in this count."
        confirmText="Save"
        abortText="Cancel"
        onConfirm={ confirmPassengers }
        onAbort={ onCancel } >

        <View style={{ width: '100%' }}>
          {/* initial selection - each time we click add we will create an addional select within the form  */}
          { Array.from( Array( passengerCount ) ).map( ( item, index ) => (
              <View key={ index } style={{ padding: moderateScale(2,.2), display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                {/* remove passenger select */}
                { index > 0 &&
                    <Button 
                        width={ moderateScale(20,.2) } 
                        height={ moderateScale(20,.2) } 
                        color={ 'tomato' }
                        icon={ 'remove' }
                        onPress={ () => removePassengerInput(index +1) } />
                }
                <SingleSelectWithAdd
                  label={`Pass ${index + 1}:`}
                  items={ people } 
                  onAddItem={ () => { alert('selected person'); } }
                  onSelectedItemsChange={ option => { props.resetSyncTime() } }
                  selectedItems={ passenger1 }
                  onChangeInput={ (text)=> { props.resetSyncTime() } }
                  selectText="select passsenger"
                  searchInputPlaceholderText="Search Items..."
                  autoCapitalize={ 'words' }
                  // move up to top  of window so we can display more data with keyboard open
                  onPressElement = {() => { props.resetSyncTime() }  }
                />
              </View>
            )
          )}

          {/* // <SingleSelectWithAdd
          //       label="Passenger :"
          //       items={ this.props.people } 
          //       onAddItem={ () => { alert('selected person'); this.props.evaluateTouchEvent('passenger item added') } }
          //       onSelectedItemsChange={ option => { this.handlePassengerChange( 'selectedDriver', option ); this.props.evaluateTouchEvent('passenger selected item changed'); this.props.resetSyncTime() } }
          //       selectedItems={ this.props.selectedDriver }
          //       onChangeInput={ (text)=> { this.props.handleInputChange( 'driverText', text ); this.props.evaluateTouchEvent('passenger select text changed'); this.props.resetSyncTime() } }
          //       selectText="select passsenger"
          //       searchInputPlaceholderText="Search Items..."
          //       autoCapitalize={ 'words' }
          //       // move up to top  of window so we can display more data with keyboard open
          //       onPressElement = {() => { this.props.evaluateTouchEvent('passenger select input'); this.props.resetSyncTime() }  }
          //     /> */}

          {/* add a passenger selection */}
          <Button 
              width={ moderateScale(40,.2) } 
              height={ moderateScale(40,.2) } 
              color={ 'grey' }
              icon={ 'plus' }
              onPress={ handleAddPassengerInput }
            />
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
    zIndex: 10,
    
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