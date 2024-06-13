import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { moderateScale, scale } from 'react-native-size-matters';
import { RowSection, Spinner } from '../common';

const OnsiteCount = ( props ) => {
  // app state
  const { onsiteCountLoading, onsitePeopleCount, onsiteVehicleCount } = useSelector(state => state.data)

    return (
      <RowSection>
        <View style={ styles.containerStyle }>
          <Text style={{ fontSize: props.headerSize ? props.headerSize : moderateScale(18,.2) }}>Onsite Count</Text>
          <View style={ styles.labelContainerStyle }>
            <Text style={{ fontSize: moderateScale(14,.2) }}>People</Text>
            <Text style={{ fontSize: moderateScale(14,.2) }}>Vehicles</Text>
          </View>
          <View style={ styles.dataStyle }>
            <TouchableOpacity onPress={() => props.showOnsiteList('people')} disabled={onsitePeopleCount ? false : true}>
              <View style={{ ...styles.dataContainerStyle, backgroundColor: props.currentList === 'people' ? 'goldenrod' : 'lightgrey' }}>
                {onsiteCountLoading
                  ? <Spinner color={'grey'}/>
                  : <Text style={{ fontSize: moderateScale(16,.2) }}>
                      {onsitePeopleCount ? onsitePeopleCount : 0}
                    </Text>
                }
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.showOnsiteList('vehicle')} disabled={onsiteVehicleCount ? false : true}>
              <View style={{ ...styles.dataContainerStyle, backgroundColor: props.currentList === 'vehicle' ? 'goldenrod' : 'lightgrey' }}>
                {onsiteCountLoading
                  ? <Spinner color={'grey'}/>
                  : <Text style={{ fontSize: moderateScale(16,.2) }}>
                      {onsiteVehicleCount ? onsiteVehicleCount : 0}
                    </Text>
                }
              </View>
            </TouchableOpacity>
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
  labelContainerStyle: {
    width: moderateScale(300,.2),
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  dataContainerStyle: {
    height: moderateScale(65,.4),
    width: moderateScale(65,.4),
    backgroundColor: 'lightgrey',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataStyle: {
    width: moderateScale(300,.2),
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: scale(8),
    marginBottom: scale(5),
  }
};