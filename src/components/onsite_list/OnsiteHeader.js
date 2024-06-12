
import React from 'react'
import { useSelector } from 'react-redux'
import { View, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters'
import { Button } from '../common'

// currently not working - onPress is not called
// TouchableOpacity changes opacity but onPress is not called
// for now - setting sort icon widths to 1, for minimal revision until i fix this

const OnsiteHeader = (props) => {

  const setSorting = (field) => {
    let order = 'asc'
    if (field === props.orderBy) {
      order = !order
    }
    props.sortList(field, order)
  }

  return (
    <View style={styles.container}>
      {(props.type === 'people') &&
        <View style={{...styles.cell, flex: 2}}>
          <TouchableOpacity style={styles.innerCell} onPress={() => setSorting('sPersonName')} >
            <Text style={styles.text}>Name</Text>
            <Button
              color={props.orderBy === 'sPersonName' ? 'black' : 'lightgrey'}
              icon={props.orderBy === 'sPersonName' && props.orderDir === 'desc' ? 'caret-down' : 'caret-up'}
              noBorder={true}
              buttonStyle={{ margin: 0, padding: 0}}
              iconSize={ moderateScale(15,.2) }
              width={ moderateScale(1,.2) } />
          </TouchableOpacity>
        </View>
      }

      <View style={styles.cell}>
        <TouchableOpacity style={styles.innerCell} onPress={() => setSorting('sLpn')} >
          <Text style={styles.text}>LPN</Text>
          <Button
            color={props.orderBy === 'sLpn' ? 'black' : 'lightgrey'}
            icon={props.orderBy === 'sLpn' && props.orderDir === 'desc' ? 'caret-down' : 'caret-up'}
            noBorder={true}
            buttonStyle={{ margin: 0, padding: 0}}
            iconSize={ moderateScale(15,.2) }
            width={ moderateScale(1,.2) } />
        </TouchableOpacity>
      </View>

      <View style={{...styles.cell, flex: 2}}>
        <TouchableOpacity style={styles.innerCell} onPress={() => setSorting('sCompany')} >
          <Text style={styles.text}>Company</Text>
          <Button
            color={props.orderBy === 'sCompany' ? 'black' : 'lightgrey'}
            icon={props.orderBy === 'sCompany' && props.orderDir === 'desc' ? 'caret-down' : 'caret-up'}
            noBorder={true}
            buttonStyle={{ margin: 0, padding: 0}}
            iconSize={ moderateScale(15,.2) }
            width={ moderateScale(1,.2) } />
        </TouchableOpacity>
      </View>

      <View style={styles.cell}>
        <TouchableOpacity style={styles.innerCell} onPress={() => setSorting('dTimestamp')} >
          <Text style={styles.text}>Date</Text>
          <Button
            color={props.orderBy === 'dTimestamp' ? 'black' : 'lightgrey'}
            icon={props.orderBy === 'dTimestamp' && props.orderDir === 'desc' ? 'caret-down' : 'caret-up'}
            noBorder={true}
            buttonStyle={{ margin: 0, padding: 0}}
            iconSize={ moderateScale(15,.2) }
            width={ moderateScale(1,.2) } />
        </TouchableOpacity>
      </View>

      <View style={styles.cell}>
        <Text style={styles.text}>Time</Text>
      </View>

      { props.showNotesColumn && <View style={styles.note}></View>}
    </View>
  )
}

export default OnsiteHeader

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderColor: 'grey',
    borderBottomWidth: 1,
    padding: 5,
    gap: 1,
  },
  cell: {
    flex: 1,
  },
  innerCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  text: {
    fontSize: moderateScale(12,.2),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  note: {
    width: '5%',
  },
}