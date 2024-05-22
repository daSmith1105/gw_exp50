import React, {useState, useEffect} from 'react'
import { View, ScrollView } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { moderateScale } from 'react-native-size-matters'
import { Button, SingleSelect } from '../common'
import Modal from '../common/Modal'
import makeId from '../../utility/makeId'
import getUniqueValue from '../../utility/getUniqueValue'
import insertSorted from '../../utility/insertSorted'
import * as actions from '../../actions';

const AddPassengers = ( props ) => {

  const dispatch = useDispatch()
  const people = useSelector( state => state.data.people )
  const passengers = useSelector( state => state.form.passengers )
  const selectedDriver = useSelector( state => state.form.selectedDriver )

  const [list, setList] = useState([])
  const [names, setNames] = useState([''])        // array of people ids - initialize with 1 row
  const [tempNames, setTempNames] = useState([])  // array of temporary name strings - this will hold names that have been typed but not yet "entered"
  const [reset, setReset] = useState('')

  useEffect(() => {
    setReset(makeId(6))
  }, [])

  useEffect(() => {
    const uniquePeople = getUniqueValue(people, 'name', selectedDriver)
    setList(uniquePeople)
  }, [people])

  useEffect(() => {
    if (passengers.length > 0) {
      setNames(passengers)
    }
  }, [passengers])

  const handleChangeText = (text, index) => {
    let tempArr = [...tempNames]
    tempArr[index] = text
    setTempNames(tempArr)
  };

  const handleAddName = (name, index) => {
    // add newly typed value to our list if it does not exist yet
    let listArr = [...list]
    let data = list.find(l => l.name === name)
    const id = data && data.id ? data.id : ''

    if (!validateName(id, index, name)) {
      return
    }

    if (!data) {
      // passenger button is hidden until a driver has been selected, so this is in assumption that selectedCompany[0] exists
      data = {id: 'l-' + makeId(6), name: name}
      listArr = insertSorted(listArr, data, 'name')
      setList(listArr)
    }

    // then this will handle selecting that value
    handleNameSelect(data.id, index, listArr)
  }

  const handleNameSelect = (id, index, listArr) => {
    let newId = id
    let nameArr = [...names]
    const person = listArr.find(l => l.id === id)
    if (!validateName(id, index, person.name)) {
      return
    }

    if (id === '0') {
      // if the selected passenger was a new value added thru the driver's list (which will have id = '0')
      // then we need to change its id to something else, or else, SAVE_EVENT will remove that element and mess up our association
      newId = 'l-' + makeId(6)
      const listArr = list.map(l => l.id === '0' ? {...l, id: newId} : l)
      setList(listArr)
    }

    nameArr[index] = newId
    setNames(nameArr)
  }

  const validateName = (id, index, name) => {
    // check if name is same as driver
    if (selectedDriver && selectedDriver[0] && id === selectedDriver[0]) {
      alert(`You have selected the driver's name. Please do not include the driver.`)
      return false
    }

    // check if name has been previously selected as another passenger
    const indx = names.findIndex(n => n === id)
    if (indx !== -1 && indx !== index) {
      alert('You cannot add the same passenger multiple times. Please select/type in a different name.')
      return false
    }

    // check if name has at least 2 words
    if (name.split(' ').length < 2) {
      alert(`Please provide first and last name for each passenger.`)
      return false
    }

    return true
  }

  const handleRowButtons = (type, index) => {
    let nameArr = [...names]
    if (type === 'add') {
      nameArr.push('')
    } else {
      nameArr.splice(index, 1)
    }
    setNames(nameArr)
  };

  const handleModalConfirm = () => {
    const nameArr = names.filter(n => n !== '')
    const listArr = list.filter(l => isNaN(parseInt(l.id)) && nameArr.includes(l.id)) // get all "NEW" people added thru passenger modal

    setNames(nameArr)
    dispatch(actions.addPassengers(listArr, nameArr))
    dispatch(actions.hideAddPassengerModal())
  };

  const handleModalAbort = () => {
    dispatch(actions.hideAddPassengerModal())
  };

  return (
    <View style={ styles.container }>
      <Modal  title="Passengers"
              subMessage="Do not include the driver of the vehicle."
              confirmText="Save"
              abortText="Cancel"
              onConfirm={ handleModalConfirm }
              onAbort={ handleModalAbort } >

        <View style={ styles.innerContainer }>
          <ScrollView contentContainerStyle={ styles.scrollContainer } style={{flexGrow: 0}}>
            {names.map((id, index) => (
              <View key={index} style={ styles.row }>
                <View style={styles.text} >
                    <SingleSelect
                        label=""
                        items={ list }
                        canAddItems={ true }
                        onChangeInput={ text => handleChangeText(text, index) } // this will add the text in tempNames[index]
                        onAddItem={ () => handleAddName(tempNames[index].trim(), index) } // this will add the tempNames[index] to names
                        onSelectedItemsChange={ selectedId => handleNameSelect(selectedId[0], index, list) }
                        selectedItems={ [id] }
                        selectText="Full Name"
                        searchInputPlaceholderText="Search Name..."
                        autoCapitalize={ 'words' }
                        reset={reset} />
                </View>

                <Button
                  width={ moderateScale(30,.2) }
                  height={ moderateScale(30,.2) }
                  color={ 'grey' }
                  icon={ 'minus' }
                  buttonStyle={{ margin: 0 }}
                  onPress={ () => handleRowButtons('remove', index) }
                />
              </View>
            ))}
          </ScrollView>

          <Button
            text={'Add Another Name' }
            onPress={ () => handleRowButtons('add') }
            color={ 'grey' }
            icon={ 'plus' }
            width={ moderateScale(200,.2) }
          />
        </View>

      </Modal>
    </View>
  )
};

export default AddPassengers;

const styles = {
  container: {
    position: 'absolute',
    top: -100,
    left: 0,
    width: '100%',
    height: '110%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  innerContainer: {
    maxHeight: 400,
    alignItems: 'center',
  },
  scrollContainer: {
    gap: 2,
    flexGrow: 0,
    minHeight: 50,
    marginTop: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    alignItems: 'center',
    width: '100%',
  },
  text: {
    width: '90%',
    padding: 3,
    fontSize: moderateScale(16,.2),
  },
};