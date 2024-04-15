import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { moderateScale, scale } from 'react-native-size-matters';
import { RowSection } from '../common';

// get this on initial load of setting screen - have attempted to fix, but as of yet, no luck
// only happens once, then when returning to setttings screen it is fine

// Selector unknown returned a different result when called with the same parameters. This can lead to unnecessary rerenders.
// Selectors that return a new reference (such as an object or an array) should be memoized: 
// https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization {"selected": NaN, "selected2": NaN, "stack": "Error


const OnsiteCount = ( props ) => {
  // app state
  const onsitePeopleCount = useSelector(state => state.data.onsitePeopleCount || 0);
  const onsiteVehicleCount = useSelector(state => state.data.onsiteVehicleCount || 0);
    
    return (
      <RowSection>
        <View style={ styles.containerStyle }>
          <Text style={{ fontSize: moderateScale(18,.2) }}>Onsite Count</Text>
          <View style={ styles.labelContainerStyle }>
            <Text style={{ fontSize: moderateScale(14,.2) }}>People</Text>
            <Text style={{ fontSize: moderateScale(14,.2) }}>Vehicles</Text>
          </View>
          <View style={ styles.dataStyle }>
            <View style={ styles.dataContainerStyle }>
                <Text style={{ fontSize: moderateScale(16,.2) }}>
                  { onsitePeopleCount ? 
                      onsitePeopleCount : 
                      0 
                  }
                </Text> 
            </View>
            <View style={ styles.dataContainerStyle }>
                <Text style={{ fontSize: moderateScale(16,.2) }}>
                  { onsiteVehicleCount ? 
                      onsiteVehicleCount : 
                      0 
                  }
                </Text>
            </View>
          </View> 
        </View>
      </RowSection>
    )
};

export default OnsiteCount;

const styles = {
  containerStyle: {
    height: moderateScale(120,.3),
    width: '100%',
    alignItems: 'center'
  },
  dataContainerStyle: {
    height: moderateScale(65,.4),
    width: moderateScale(65,.4),
    backgroundColor: 'lightgrey',
    padding: scale(10),
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelContainerStyle: {
    width: moderateScale(300,.2), 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  dataStyle: {
    width: moderateScale(300,.2), 
    flexDirection: 'row',
    justifyContent: 'space-around', 
    marginTop: scale(8), 
    marginBottom: scale(5)
  }
};