import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { View, FlatList } from 'react-native'
import { moderateScale } from 'react-native-size-matters'
import { Button } from '../components/common'
import OnsiteCount from '../components/settings/OnsiteCount'
import OnsiteItem from '../components/onsite_list/OnsiteItem'
import OnsiteHeader from '../components/onsite_list/OnsiteHeader'

const OnsiteList = (props) => {

  const onsitePeople = useSelector(state => state.data.onsitePeople)
  const onsiteVehicle = useSelector(state => state.data.onsiteVehicle)

  const [list, setList] = useState([])
  const [orderBy, setOrderBy] = useState('')
  const [orderDir, setOrderDir] = useState('')
  const [forceRender, setForceRender] = useState(false)

  useEffect(() => {
    setOrderBy('')
    setOrderDir('')

    if (props.type === 'people') {
      setList(onsitePeople)
    } else {
      setList(onsiteVehicle)
    }
  }, [props.type])

  useEffect(() => {
    // this handles sorting on initial load
    if (!orderBy && !orderDir && list && list.length > 0) {
      if (props.type === 'people') {
        sortList('sPersonName', 'asc')
      } else {
        sortList('sLpn', 'asc')
      }
    }
  }, [list])

  const sortList = (field, order) => {
    let l = [...list]
    setOrderBy(field)
    setOrderDir(order)

    if (order === 'asc') {
      l.sort((a, b) => a[field].toString().localeCompare(b[field].toString()))
    } else {
      l.sort((a, b) => b[field].toString().localeCompare(a[field].toString()))
    }

    setList(l)

    // since sorting an array of objects may sometimes not triggere a re-render due to how react does shallow state compare, we'll have to force re-render
    setForceRender(!forceRender)
  }

  const listHeader = () => {
    // handles display of our list's header
    return <OnsiteHeader type={props.type} orderBy={orderBy} orderDir={orderDir} sortList={sortList} />
  }

  const listItem = ({item, index}) => {
    // mapping for each entry in flatlist
    return <OnsiteItem item={item} lastItem={index === list.length - 1} type={props.type} />
  }

  return (
    <View style={styles.containerStyle} key={forceRender}>
      <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
        <Button
          color='grey'
          icon={ 'arrow-circle-left' }
          width={ moderateScale(40,.2) }
          onPress={ () => props.showOnsiteList('') } />
      </View>

      <OnsiteCount showOnsiteList={props.showOnsiteList} currentList={props.type} headerSize={moderateScale(20,.2)} />

      <View>
        <FlatList ListHeaderComponent={ listHeader } renderItem={ listItem } data={ list } keyExtractor={(_, index) => index } />
      </View>
    </View>
  )
}

export default OnsiteList

const styles = {
  containerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start',
    zIndex: 1000,
    backgroundColor: 'white',
  },
}