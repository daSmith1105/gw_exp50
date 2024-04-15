import React from 'react';
import { View } from 'react-native';
import { scale } from 'react-native-size-matters';

const RowSection = props => {

  return (
    <View style={ styles.rowContainerStyle }>
      { props.children }
    </View>
  );
};

export { RowSection };

const styles = {
  rowContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 'auto',
    borderBottomWidth: 2,
    borderColor: 'lightgrey',
    padding: scale(9)
  },
};