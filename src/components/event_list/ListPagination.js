
import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Button } from '../common';

const ListPagination = (props) => {

    return (
        <View style={styles.containerStyle}>
            <Button
                borderColor={'transparent'}
                text=""
                color='grey'
                backgroundColor={ props.currentPage > 1 ? 'white' : 'rgba(0,0,0,0.2)'}
                icon={ 'arrow-circle-left'}
                width={ 'auto' }
                fontSize={ moderateScale(20,.2) }
                disabled={props.currentPage > 1 ? false : true}
                onPress={ () => props.currentPage > 1 ? props.setList(props.currentPage - 1) : null } />
            <Text>Page {props.currentPage} of {props.pages}</Text>
            <Button
                borderColor={'transparent'}
                text=""
                color='grey'
                backgroundColor={ props.currentPage < props.pages ? 'white' : 'rgba(0,0,0,0.2)'}
                icon={ 'arrow-circle-right' }
                width={ 'auto' }
                fontSize={ moderateScale(20,.2) }
                disabled={props.currentPage < props.pages ? false : true}
                onPress={ () => props.currentPage < props.pages ? props.setList(props.currentPage + 1) : null } />
        </View>
    );
};

export default ListPagination;

const styles = {
    containerStyle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '95%',
        margin: 'auto',
        marginLeft: '2.5%'
    }
};
