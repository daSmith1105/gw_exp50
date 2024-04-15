
import React from 'react';
import { View } from 'react-native';
import { Button } from '../common';
import { moderateScale } from 'react-native-size-matters';

const ListHeader = (props) => {

    return (
        <View style={styles.containerStyle}>
        <Button
          text="Back"
          color='grey'
          icon={ 'arrow-circle-left' }
          width={ moderateScale(200,.2) }
          fontSize={ moderateScale(14,.2) }
          onPress={ props.toggleEventList } />

        <Button
          // filter has been disable - need to renable after rework
          onPress={ props.toggleFilter }
          text=""
          // icon={ "filter" }
          color={ "grey" }
          fontSize={ moderateScale(14,.2) }
          width={ moderateScale(140,.2) } 
          noBorder />
      </View>
    )
}

export default ListHeader;

const styles = {
    containerStyle: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
}