
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { View, Text } from 'react-native'
import { moderateScale } from 'react-native-size-matters'
import { Button } from '../common'
import parseTimestamp from '../../utility/parseTimestamp'

const OnsiteItem = (props) => {

  const fUseNames = useSelector(state => state.user.fUseNames)

  const {item, lastItem} = props
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const ts = parseTimestamp(item.dTimestamp)
    setDate(ts.date)
    setTime(ts.time)
  }, [])

  const showNote = () => {
    alert(item.sNote)
  }

  return (
    <View style={{ ...styles.container, paddingBottom: lastItem ? 200 : 5 }}>
      {(props.type === 'people') &&
        <View style={{...styles.cell, flex: 2}}>
          <Text style={styles.text}>{item.sPersonName}</Text>
        </View>
      }

      <View style={styles.cell}>
        <Text style={styles.text}>{item.sLpn}</Text>
      </View>

      <View style={{...styles.cell, flex: 2}}>
        <Text style={styles.text}>{item.sCompany}</Text>
      </View>

      {(props.type === 'people' && !fUseNames)
        ? <View style={styles.cell}>
            <Text style={styles.text}>{item.bPassengerCount}</Text>
          </View>
        : (props.type === 'vehicle') &&
            <View style={styles.cell}>
              <Text style={styles.text}>{item.bPersonCount}</Text>
            </View>
      }

      <View style={styles.cell}>
        <Text style={styles.text}>{date}</Text>
      </View>

      <View style={styles.cell}>
        <Text style={styles.text}>{time}</Text>
      </View>

      {(props.type === 'people' && fUseNames) &&
        <View style={styles.note}>
          {item.sNote &&
            <Button
              color='goldenrod'
              icon={ 'sticky-note' }
              width={ moderateScale(20,.2) }
              buttonStyle={{ margin: 0, padding: 0, borderWidth: 0 }}
              onPress={ showNote } />
          }
        </View>
      }
    </View>
  )
}

export default OnsiteItem

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderColor: 'grey',
    borderBottomWidth: 1,
    padding: 5,
  },
  cell: {
    flex: 1,
  },
  text: {
    fontSize: moderateScale(12,.2),
    textAlign: 'center',
  },
  note: {
    width: '5%',
  },
}