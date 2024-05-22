import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, SingleSelect, ErrorMessage, Badge } from '../common';
import Modal from '../common/Modal';
import PhotoButton from './PhotoButton';
import { View, ScrollView } from 'react-native';
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import makeId from '../../utility/makeId';
import getUniqueValue from '../../utility/getUniqueValue';
import * as actions from '../../actions';

const IntakeForm = (props) => {
    // app state
    const {lpns, companies, people, saveEventFail, saveEventSuccess, eventSaving} = useSelector(state => state.data);
    const {userId, customerId, gateId, subscriberId, fRequirePhotos} = useSelector(state => state.user);
    const {selectedEventType,
           selectedLpn,
           selectedCompany,
           selectedDriver,
           lpnText,
           companyText,
           driverText,
           passengerCount,
           passengers,
           comment,
           lpnPhotoUri,
           loadPhotoUri,
           additionalPhotos,
           formIncompleteError,
           maxPhotosReached
        } = useSelector(state => state.form);

    // component state
    const [saving, setSaving] = useState(false);
    const [enableScrollViewScroll, setEnableScrollViewScroll] = useState(true);
    const [reset, setReset] = useState(false);
    const [showCompany, setShowCompany] = useState(false)
    const [showDriver, setShowDriver] = useState(false)
    const [uniquePeople, setUniquePeople] = useState(people)

    const dispatch = useDispatch();

    useEffect(() => {
        // if saveEventFail of save Event Success is true, we need to set the 'saving' state to false
        if(saveEventFail || saveEventSuccess){
            setSaving(false);
        };
    }, [saveEventFail, saveEventSuccess]);

    useEffect(() => {
        const showComp = selectedLpn.length > 0 && lpns.find(l => l.id === selectedLpn[0]) ? true : false
        const showDr = selectedCompany.length > 0 && companies.find(c => c.id === selectedCompany[0]) ? true : false
        setShowCompany(showComp)
        setShowDriver(showDr)
    }, [selectedLpn, selectedCompany])

    useEffect(() => {
        const uniqueDriver = getUniqueValue(people, 'name', selectedDriver)
        setUniquePeople(uniqueDriver)
    }, [people])

    const handleLpnChange = async (label, option) => {
        // changing lpn is a special case, since we also need to update the company and driver values
        dispatch(actions.handleInputChange( label, option ))

        let currentLpn = await lpns.find( l => l.id === option[0])

        // if we are selecting a new lpn, let's associate the new company/driver if there's any already
        if ( currentLpn.id === '0') {
            currentLpn.company = '0'
            currentLpn.person = '0'
        }

        let currentCompany = await companies.find( c => c.id === currentLpn.company )
        if(currentCompany) {
            dispatch(actions.handleInputChange( 'selectedCompany', [ currentCompany.id ] ))
        } else {
            // this should not happen since a saved lpn, is always linked to a company/driver, so logging it here so we can catch ticket #86b036mtx
            console.log(`We do not have a linked company for LPN ID: ${option[0]}`)
            dispatch(actions.handleInputChange( 'selectedCompany', [] ))
        }

        let currentDriver = await people.find( p => p.id ===  currentLpn.person );
        if (currentDriver) {
            handleDriverChange(currentDriver.id, true)
        } else {
            // this should not happen since a saved lpn, is always linked to a company/driver, so logging it here so we can catch ticket #86b036mtx
            console.log(`We do not have a linked driver for LPN ID: ${option[0]}`)
            dispatch(actions.handleInputChange( 'selectedDriver', [] ))
        }

        // show only unique people names, and if there are duplicates keep the one that is related to this lpn
        const uniqueDriver = getUniqueValue(people, 'name', [currentLpn.person])
        setUniquePeople(uniqueDriver)
    };

    const handleAddLpn = (name) => {
        // if newly typed value already exists in our list, select that value, else, add it
        const data = lpns.find(l => l.name === name)
        if (!data) {
            dispatch(actions.addNewLpn( name ))
            setShowDriver(false) // workaround on delayed useffect for setShowDriver
        } else {
            handleLpnChange( 'selectedLpn', [ data.id ] )
        }
    }

    const handleAddCompany = (name) => {
        // if newly typed value already exists in our list, select that value, else, add it
        const data = companies.find(l => l.name === name)
        if (!data) {
            dispatch(actions.addNewCompany( name ))
        } else {
            dispatch(actions.handleInputChange( 'selectedCompany', [ data.id ] ));
        }
    }

    const handleAddDriver = (name) => {
        // add newly typed value to our list if it does not exist yet
        const data = people.find(l => l.name === name)
        const id = data && data.id ? data.id : ''

        if (!validateDriverInput(id, name)) {
            dispatch(actions.handleInputChange( 'selectedDriver', [] ))
            return
        }

        if (!data) {
            dispatch(actions.addNewDriver( name ))
        } else {
            dispatch(actions.handleInputChange( 'selectedDriver', [ id ] ))
        }
    }

    const handleDriverChange = (id, lpnChange) => {
        const person = people.find(p => p.id === id)
        if (!validateDriverInput(id, person.name, lpnChange)) {
            dispatch(actions.handleInputChange( 'selectedDriver', [] ))
            return
        }
        dispatch(actions.handleInputChange( 'selectedDriver', [ id ] ))
    }

    const validateDriverInput = (id, name, lpnChange) => {
        // check if name has been previously selected as passenger
        let msg = ''
        const pass = passengers.find(n => n === id)
        if (pass) {
            msg = lpnChange ? `The associated driver for this LPN is already in the passenger list.` : `You have selected a passenger name.`
            alert(`${msg} If '${name}' is the driver's name, please remove it in the passenger list first.`)
            return false
        }

        // check if name has at least 2 words
        if (name.split(' ').length < 2) {            
            msg = lpnChange ? 'The associated driver for this LPN has incomplete name.' : ''
            alert(`${msg} Please provide driver's first and last name.`)
            return false
        }

        return true
    }

    const validateFormData = async () => {
        // validate form data on click of submit
        if (!saving) {
            setSaving(true);
            if ( selectedEventType.length > 0 && selectedLpn.length > 0 && selectedCompany.length > 0 && selectedDriver.length > 0 ) {
                if ( fRequirePhotos && ( !lpnPhotoUri.length || !loadPhotoUri.length ) ) {
                    alert('A minimum of 2 photos are required to submit an event. (lpn and load) Please review the form.');
                    setSaving(false)
                    return;
                };
                
                setEventInState();
            } else {
                dispatch(actions.submitFormError());
                setSaving(false)
            };
        };
    };

    const setEventInState = () => {
        let lpnObj = {};
        let companyObj = {};
        let driverObj = {};

        // if selected value === ['0'] then it is a new entry, else obj has been entered previously
        selectedCompany[0] === '0'
            ? companyObj = { id: ( 'l-' + makeId(6) ), name: companies.find( c => c.id === '0').name }
            : companyObj = companies.find( c => c.id === selectedCompany[0]);

        selectedDriver[0] === '0'
            ? driverObj = { id: ( 'l-' + makeId(6) ), name: people.find( p => p.id === '0').name }
            : driverObj = people.find( d => d.id === selectedDriver[0]);

        selectedLpn[0] === '0'
            ? lpnObj = { id: ( 'l-' + makeId(6) ), name: lpns.find( p => p.id === '0').name, company: companyObj.id, person: driverObj.id }
            : lpnObj = lpns.find( l => l.id === selectedLpn[0]);

        const today = new Date();
        let DD = today.getDate();
        if ( parseInt(DD) < 10) DD = '0' + DD;
        let MM = today.getMonth() + 1;
        if ( parseInt(MM) < 10) MM = '0' + MM;
        const YYYY = today.getFullYear();
        let hh = today.getHours();
        if ( parseInt(hh) < 10) hh = '0' + hh;
        let mm = today.getMinutes();
        if ( parseInt(mm) < 10) mm = '0' + mm;
        let ss = today.getSeconds();
        if ( parseInt(ss) < 10) ss = '0' + ss;
        const now = YYYY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss;

        const event = {
            timestamp: now,
            type: selectedEventType[0],
            userId: userId || '',              // if not logged in there will be no userId
            subscriberId: subscriberId || '',  // if not logged in there will be no subscriberId
            customerId: customerId || '',      // if not logged in there will be no customerId
            gateId: gateId || '',              // if not logged in there will be no gateId OR the user that is logged in does not have a valid gate assignment for some reason
            lpnObj: lpnObj,
            companyObj: companyObj,
            driverObj: driverObj,
            lpnPhoto:  lpnPhotoUri,
            loadPhoto: loadPhotoUri,
            additionalPhotos: additionalPhotos.length > 0 ?  additionalPhotos : [],
            passengerCount: passengerCount || 0,
            passengers: passengers,
            comment: comment
        };

        dispatch(actions.saveEvent( event ));
        setSaving(false);
    };

    const clear = () => {
        dispatch(actions.clearForm());  // this handles input values
        setReset(makeId(6)); // this closes the dropdowns and input fields
        // cleanup
        dispatch(actions.clearEventSaveModal());
        // reset app state
        setSaving(false);
        setEnableScrollViewScroll(true);
    };

    return(
        <View style={{ flex: 1 }} onStartShouldSetResponderCapture={() => setEnableScrollViewScroll(true)} >

            {/* Clear Form */}
            <View style={{ position: 'absolute', top: verticalScale(90), right: scale(5) , zIndex: 12 }}>
                <Button
                    onPress={ clear }
                    text="clear form"
                    color="grey"
                    fontSize={ moderateScale(14, .3) }
                    width={ scale(100) } />
            </View>

            <ScrollView
                scrollEnabled={enableScrollViewScroll}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: verticalScale(120), position: 'relative', top: 0, paddingRight: 10, paddingLeft: 10 }}
                keyboardShouldPersistTaps={'handled'}
                showsVerticalScrollIndicator={false} >

                {/* Select Event Type */}
                <View style={ styles.form }>
                    <View onStartShouldSetResponderCapture={ () => { setEnableScrollViewScroll(false) }} >
                        <SingleSelect
                            canAddItems={ false }
                            label="Type:"
                            items={ [ { id: 1, name: "IN" }, { id:2, name: "OUT" }, { id: 3, name: "DENIED" }, { id: 4, name: "ACCIDENT" } ] }
                            onSelectedItemsChange={ option => dispatch(actions.handleInputChange( 'selectedEventType', option )) }
                            selectedItems={ selectedEventType }
                            selectText="select type"
                            searchInputPlaceholderText="Search Items..."
                            reset={reset} />
                    </View>

                    {/* Select License Plate */}
                    {/* View container is needed for scrolling of the flatlist inside the parent ScrollView */}
                    {/* throwing a warning will need to move to another FlatList or similar in future */}
                    <View onStartShouldSetResponderCapture={ () => { setEnableScrollViewScroll(false) }} >
                        <SingleSelect
                            canAddItems={ true }
                            label="LPN:"
                            items={ lpns }
                            // when we add a new lpn we assign it an id of 0 - this allows us to check it in selectedLpn later
                            onAddItem={ () => handleAddLpn( lpnText.trim() ) }
                            onSelectedItemsChange={ option => handleLpnChange( 'selectedLpn', option ) }
                            selectedItems={ selectedLpn }
                            onChangeInput={ (text)=> { dispatch(actions.handleInputChange( 'lpnText', text )) } }
                            selectText="select license plate"
                            searchInputPlaceholderText="Search Items..."
                            autoCapitalize={ 'characters' }
                            reset={reset} />
                    </View>

                    {/* Select Company */}
                    { showCompany &&
                        <View onStartShouldSetResponderCapture={ () => { setEnableScrollViewScroll(false) }} >
                            <SingleSelect
                                canAddItems={ true }
                                label="Company:"
                                items = { companies }
                                // when we add a new company we assign it an id of 0 - this allows us to check it in selectedLpn later
                                onAddItem = { () => handleAddCompany( companyText.trim() ) }
                                onSelectedItemsChange = { option => dispatch(actions.handleInputChange( 'selectedCompany', option )) }
                                selectedItems = { selectedCompany }
                                onChangeInput = { (text) => { dispatch(actions.handleInputChange( 'companyText', text )) } }
                                selectText = "select company"
                                searchInputPlaceholderText = "Search Items..."
                                autoCapitalize = { 'words' }
                                //move up to top of window so we can display more data with keyboard open
                                reset={reset} />
                        </View>
                    }

                    {/* Select Driver */}
                    { showDriver &&
                        <View onStartShouldSetResponderCapture={ () => { setEnableScrollViewScroll(false) }} >
                            <SingleSelect
                                canAddItems={ true }
                                label="Driver:"
                                items={ uniquePeople }
                                // when we add a new person we assign them an id of 0 - this allows us to check it in selectedLpn later
                                onAddItem={ () => handleAddDriver( driverText.trim() ) }
                                onSelectedItemsChange={ option => handleDriverChange(option[0]) }
                                selectedItems={ selectedDriver }
                                onChangeInput={ (text)=> { dispatch(actions.handleInputChange( 'driverText', text )) } }
                                selectText="select driver"
                                searchInputPlaceholderText="Search Items..."
                                autoCapitalize={ 'words' }
                                // move up to top  of window so we can display more data with keyboard open
                                reset={reset} />
                        </View>
                    }

                    {/* Add Passenger and Comments */}
                    <View style={ [ styles.multiButtonContainer, { marginTop: 5, position: 'relative' } ] }>
                        { (passengerCount > 0) &&
                            <Badge
                                style={{ position: 'absolute', top: verticalScale(-6), left: moderateScale(120,.5) }}
                                size={ moderateScale(32,.2) }
                                borderColor="green"
                                textColor="green"
                                text={ passengerCount ? passengerCount : '' } />
                        }
                        <Button
                            onPress={ () => { dispatch(actions.showAddPassengerModal()) }  }
                            text={ "Passengers" }
                            icon={ passengerCount ? "check" : "plus-circle" }
                            color={ passengerCount ? "green" : "grey" }
                            width={ moderateScale(140,.3) } />
                        <Button
                            onPress={ () => { dispatch(actions.showAddCommentModal())} }
                            text="Comments"
                            icon={  comment && comment.length > 0  ? "check" : "plus-circle" }
                            color={ comment && comment.length > 0  ? "green" : "grey" }
                            width={ moderateScale(140,.3) } />
                    </View>

                    {/* Image Capture Buttons */}
                    { fRequirePhotos &&
                        <View style={ styles.multiButtonContainer }>
                            <PhotoButton
                                onPress={ () => { dispatch(actions.showCamera('lpn', null)) } }
                                title="Lpn Photo"
                                image={ lpnPhotoUri }
                                imutable />
                            <PhotoButton
                                onPress={ () => {dispatch(actions.showCamera('load', null)) }  }
                                title="Load Photo"
                                image={ loadPhotoUri }
                                imutable />
                        </View>
                    }

                    {/* Additional Images Container */}
                    { fRequirePhotos &&
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                        { (additionalPhotos && additionalPhotos.length > 0) &&
                            [ ...additionalPhotos ].map( p => {
                                return(
                                    <PhotoButton
                                    key={ p.id }
                                    onPress={ () => { dispatch(actions.showCamera( p.label, p.id )) } }
                                    onDelete={ () => dispatch(actions.removePhotoInstance( p.id )) }
                                    image={ p.path }
                                    />
                                )
                            })
                        }
                        </View>
                    }

                    {/* Toggle Adding New Photo */}
                    { (!maxPhotosReached && fRequirePhotos) &&
                        <Button
                            onPress={ () => { dispatch(actions.showCamera( makeId(4), null )) }  }
                            text="Photo"
                            icon={ "plus-circle" }
                            color={ "grey" }
                            fontSize={ moderateScale(14,.2) }
                            width={ moderateScale(120,.2) } />
                    }

                    {/* Submit Error Message */}
                    { formIncompleteError && <ErrorMessage errorText="Data missing. Please review." /> }

                    {/* Submit Button Container */}
                    <View style={ styles.submitContainer }>
                        <Button
                            onPress={ validateFormData }
                            text="Submit"
                            color={ saving ? "lightgrey" : "grey" }
                            fontSize={ moderateScale(32, .2) }
                            width={ moderateScale(200,.3) } />
                    </View>

                </View>
                {/* end of form  */}
            </ScrollView>

            {/* Modals */}
            { (saving || saveEventSuccess || saveEventFail) &&
                <View style={ styles.modalContainerStyle }>
                    { saving && !saveEventSuccess  && !saveEventFail &&
                        <Modal
                        title="Verifying Data"
                        loader
                        imageH={150}
                        imageW={150} />
                    }

                    { !eventSaving && saveEventSuccess &&
                        <Modal
                            title="Event Save Success"
                            confirmText="OK"
                            onConfirm={ clear }
                            icon="check"
                            iconColor="green" />
                    }

                    { !eventSaving && saveEventFail &&
                        <Modal
                        title="Event Save Fail"
                        confirmText="OK"
                        onConfirm={ clear }
                        icon="close"
                        iconColor="goldenrod" />
                    }
                </View>
            }
        </View>
    )
}

export default IntakeForm;

const styles = {
  form: {
    width: '100%',
    height: '100%',
    flexGrow: 1,
    marginTop: moderateScale(40, .2),
    maxWidth: 600,
    paddingTop: verticalScale(105),
    marginRight: 'auto',
    marginLeft: 'auto'
  },
  multiButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  submitContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20, .2)
  },
  modalContainerStyle: {
    position: 'absolute',
    top: 0,
    margin: 'auto',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }
};
