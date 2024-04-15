
import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SingleSelect, Button } from '../common';

const ListFilter = (props) => {
    return (
        <View style={styles.containerStyle}>
        <View style={styles.dateContainerStyle}>
          <Text style={{ margin: 0 }}>Date:</Text>
          <DateTimePicker
            value={props.startDate}
            display={'default'}
            onChange={props.setStart}
            maximumDate={new Date(tYear, tMonth, tDay)}
            minimumDate={new Date(sdaYear, sdaMonth, sdaDay)} />
          <Text style={{ margin: 0, marginLeft: 10  }}>to</Text>
          <DateTimePicker
            value={props.endDate}
            display={'default'}
            onChange={props.setEnd}
            maximumDate={new Date(tYear, tMonth, tDay)}
            minimumDate={new Date(sdaYear, sdaMonth, sdaDay)}  />
        </View>

        <SingleSelect
            label="Type:"
            items={ [ { id: 'all', name: "ALL" }, { id: 1, name: "IN" }, { id: 2, name: "OUT" }, { id: 3, name: "DENIED" }, { id: 4, name: "ACCIDENT" } ] }
            onSelectedItemsChange={ option => props.handleFilterChange('type',option) }
            selectedItems={ props.selectedEventType || [5] }
            selectText="select type"
            searchInputPlaceholderText="Search Items..."  />

        <SingleSelect
            label="LPN:"
            canAddItems={false}
            items={ [{id: 'all', name: 'ALL'}, ...props.lpns] } 
            onSelectedItemsChange={ option => props.handleFilterChange('lpn',option)  }
            selectedItems={props.selectedLpn}
            selectText="select license plate"
            searchInputPlaceholderText="Search Items..."
            autoCapitalize={ 'characters' } />

        <SingleSelect
            label="Company:"
            canAddItems={false}
            items={ [{id: 'all', name: 'ALL'}, ...props.companies] } 
            onSelectedItemsChange={ option => props.handleFilterChange('company',option)  }
            selectedItems={props.selectedCompany}
            selectText="select company"
            searchInputPlaceholderText="Search Items..." />

        <SingleSelect
            label="Driver:"
            canAddItems={false}
            items={ [{id: 'all', name: 'ALL'}, ...props.people] } 
            onSelectedItemsChange={ option => props.handleFilterChange('driver',option)  }
            selectedItems={props.selectedDriver}
            selectText="select driver"
            searchInputPlaceholderText="Search Items..." />

        <View style={styles.submitContainerStyle}>
          <Button
            text="Search"
            color='grey'
            icon={ 'arrow-circle-left' }
            width={ moderateScale(240,.2) }
            fontSize={ moderateScale(20,.2) }
            onPress={ props.getEventsByFilter } />
        </View>

      </View>
    )
}

export default ListFilter;

const styles = {
    containerStyle: {
        borderWidth: 2, 
        borderRadius: 5, 
        borderColor: 'grey', 
        width: '90%', 
        marginLeft: '5%', 
        padding: 4
    },
    dateContainerStyle: {
        display: 'flex', 
        flexDirection :'row', 
        width: '95%', 
        alignItems: 'center', 
        justifyContent: 'space-around'
    },
    submitContainerStyle: {
        alignItems: 'center', 
        justifyContent: 'center'
    }
};