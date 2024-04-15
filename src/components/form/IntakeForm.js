import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, SingleSelect, ErrorMessage, Badge } from '../common';
import Modal from '../common/Modal';
import PhotoButton from './PhotoButton';
import { View, ScrollView } from 'react-native';
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import makeId from '../../utility/makeId';
// import scrollToY from '../utility/scrollToY';
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
    
    // dispatch
    const dispatch = useDispatch();

    // if saveEventFail of save Event Success is true, we need to set the 'saving' state to false
    useEffect(() => {
        if(saveEventFail || saveEventSuccess){
            setSaving(false);
        };
    }, [saveEventFail, saveEventSuccess]);

    const randomString = () => {
        return makeId(6);
    };

//   this.scrollView = React.createRef();

    const clear = () => {
        dispatch(actions.clearForm());  // this handles input values
        setReset(randomString()); // this closes the dropdowns and input fields
        // cleanup 
        props.resetSyncTime() 
        dispatch(actions.clearEventSaveModal());
        // reset app state
        setSaving(false);
        setEnableScrollViewScroll(true);
    };

    const handleAddLpn = ( lpn ) => {
        props.resetSyncTime();
        dispatch(actions.addNewLpn( lpn ));
        // scroll to top
        // scrollToY( 0, this.scrollView );
    };

    const handleLpnChange = async (label, option) => {
        props.resetSyncTime();
        dispatch(actions.handleInputChange( label, option ));

        if ( option[0] !== "0") {
        let currentLpn = await lpns.find( l => l.id === option[0]);;
        let currentCompany = await companies.find( c => c.id === currentLpn.company );
        if(currentCompany) { 
            dispatch(actions.handleInputChange( 'selectedCompany', [ currentCompany.id ] ));
        };
        let currentDriver = await people.find( p => p.id ===  currentLpn.person );
        if(currentDriver) {
            dispatch(actions.handleInputChange( 'selectedDriver', [ currentDriver.id ] ));
        };
        };
        // scroll to top
        // scrollToY( 0, this.scrollView );
    };

    const handleAddCompany = ( company ) => {
        props.resetSyncTime();
        // if we have a new lpn selected, we should probably at least temporarily associate thge new company with it - right now if you go off of the new plate and then back to it it will inherit whatever company was selected prior
        dispatch(actions.addNewCompany( company ));
        // scroll to top
        // scrollToY( 0, this.scrollView );
    };

    const handleCompanyChange = (label, option) => {
        props.resetSyncTime();
        // if we have a new lpn selected, we should probably at least temporarily associate thge new company with it - right now if you go off of the new plate and then back to it it will inherit whatever company was selected prior
        dispatch(actions.handleInputChange( label, option ));
        // scroll to top
        // scrollToY( 0, this.scrollView );
    };

    const handleAddDriver = ( driver ) => {
        props.resetSyncTime();
        // if we have a new lpn selected, we should probably at least temporarily associate thge new driver with it - right now if you go off of the new plate and then back to it it will inherit whatever driver was selected prior
        dispatch(actions.addNewDriver( driver ));
        // scroll to top
        // scrollToY( 0, this.scrollView );
    };

    const handleDriverChange = (label, option) => {
        props.resetSyncTime();
        // if we have a new lpn selected, we should probably at least temporarily associate thge new driver with it - right now if you go off of the new plate and then back to it it will inherit whatever driver was selected prior
        dispatch(actions.handleInputChange( label, option ));
        // scroll to top
        // scrollToY( 0, this.scrollView );
    };

    // CHECK FORM DATA BEFORE SUBMIT / SAVE
    const validateFormData = async () => {
        props.resetSyncTime();

        if(!saving){
            setSaving(true);
            if( selectedEventType.length > 0 && 
                selectedLpn.length > 0 && 
                selectedCompany.length > 0 && 
                selectedDriver.length > 0  ) {
            if(fRequirePhotos){
                if( lpnPhotoUri.length < 1 || loadPhotoUri.length < 1 ){
                alert('A minimum of 2 photos are required to submit an event. (lpn and load) Please review the form.');
                return;
                };
            };
            // scroll to top
            // scrollToY( 0, this.scrollView );
            setEventInState();
            } else {
            dispatch(actions.submitFormError());
            };
        };
    };

    const setEventInState = () => {
        props.resetSyncTime();
        let lpnObj = {};
        let companyObj = {};
        let driverObj = {}; 

        // if selected value === ['0'] then it is a new entry, else obj has been entered previously
        selectedCompany[0] === '0' ? 
        companyObj = { id: ( 'l-' + makeId(6) ), name: companyText !== '' ? companyText : companies.filter( c => c.id === selectedCompany[0])[0].name } : 
        companyObj = companies.filter( c => c.id === selectedCompany[0]) [0];

        selectedDriver[0] === '0' ? 
        driverObj = { id: ( 'l-' + makeId(6) ), name: driverText !== '' ? driverText : people.filter( p => p.id === selectedDriver[0])[0].name, company: companyObj.id } : 
        driverObj = people.filter( d => d.id === selectedDriver[0]) [0];
        
        selectedLpn[0] === '0' ? 
        lpnObj = { id: ( 'l-' + makeId(6) ), name: lpnText, company: companyObj.id, person: driverObj.id } : 
        lpnObj = lpns.filter( l => l.id === selectedLpn[0]) [0]; 

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
            comment: comment
            };

        validateEventSave(event);
    };

    // Make sure we have the minimum event properties we need to allow saving the event
    const validateEventSave = (event) => {
        props.resetSyncTime();
        const e = event;
        if (  e.timestamp && e.timestamp.length > 0 && 
            e.type && e.type.toString().length > 0 && 
            e.lpnObj && e.lpnObj.id && e.lpnObj.name && e.lpnObj.name.length > 0 && 
            e.companyObj && e.companyObj.id && e.companyObj.name && e.companyObj.name.length > 0 && 
            e.driverObj && e.driverObj.id && e.driverObj.name && e.driverObj.name.length > 0 ) { 

            if(fRequirePhotos){
                if(!e.lpnPhoto || e.lpnPhoto.length < 1 || !e.loadPhoto || e.loadPhoto.length < 1){
                alert('You are required to take both an lpn and a load shot for this gate.');
                return;
                };
            }

            dispatch(actions.saveEvent( event )); 

        } else {
            alert('Missing data. Please verify all fields are filled out and try again');
            setSaving(false);
        };
    };

    const handleTypeChange = (option) => {
        props.resetSyncTime();
        dispatch(actions.handleInputChange( 'selectedEventType', option ));
    };


    return(
        <View style={{ flex: 1 }} 
            onStartShouldSetResponderCapture={() => setEnableScrollViewScroll(true)}
            onStartShouldSetResponder={() => props.resetSyncTime() }>

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
            //   ref={scrollView => (this.scrollView = scrollView) }
                contentContainerStyle={{ flexGrow: 1, paddingBottom: verticalScale(120), position: 'relative', top: 0, paddingRight: 10, paddingLeft: 10 }}
                keyboardShouldPersistTaps={'handled'}
                showsVerticalScrollIndicator={false} >

            {/* Select Event Type */}
                <View style={ styles.form }>
                <View onStartShouldSetResponderCapture={ () => {
                                            setEnableScrollViewScroll(false)
                                            // this.scrollView.contentOffset === 0 && this.state.enableScrollViewScroll === false ?
                                            //   this.setState({ enableScrollViewScroll: true }) :
                                            //   this.setState({ enableScrollViewScroll: false })
                                            }} >
                    <SingleSelect
                        canAddItems={ false }
                        label="Type:"
                        items={ [ { id: 1, name: "IN" }, { id:2, name: "OUT" }, { id: 3, name: "DENIED" }, { id: 4, name: "ACCIDENT" } ] }
                        onSelectedItemsChange={ option => handleTypeChange( option )}
                        selectedItems={ selectedEventType }
                        selectText="select type"
                        searchInputPlaceholderText="Search Items..."
                        onPressElement = { props.resetSyncTime }
                        reset={reset} /> 
  
                </View>

                {/* Select License Plate */}
                {/* View container is needed for scrolling of the flatlist inside the parent ScrollView */}
                {/* throwing a warning will need to move to another FlatList or similar in future */}
                <View onStartShouldSetResponderCapture={ () => {
                                                setEnableScrollViewScroll(false)
                                            //   this.scrollView.contentOffset === 0 && this.state.enableScrollViewScroll === false ?
                                            //     this.setState({ enableScrollViewScroll: true }) :
                                            //     this.setState({ enableScrollViewScroll: false })
                                            }} >
                    <SingleSelect
                        canAddItems={ true }
                        label="LPN:"
                        items={ lpns } 
                        // when we add a new lpn we assign it an id of 0 - this allows us to check it in selectedLpn later
                        onAddItem={ () => handleAddLpn( lpnText ) }
                        onSelectedItemsChange={ option => handleLpnChange( 'selectedLpn', option ) }
                        selectedItems={ selectedLpn }
                        onChangeInput={ (text)=> { dispatch(actions.handleInputChange( 'lpnText', text )); 
                                                   props.resetSyncTime() } }
                        selectText="select license plate"
                        searchInputPlaceholderText="Search Items..."
                        autoCapitalize={ 'characters' }                               
                        // move up to top of window so we can display more data with keyboard open
                        onPressElement = {() => props.resetSyncTime() }
                        reset={reset} />
                </View>

                {/* Select Company */}
                <View onStartShouldSetResponderCapture={ () => {
                                                setEnableScrollViewScroll(false)
                                            //   this.scrollView.contentOffset === 0 && this.state.enableScrollViewScroll === false ?
                                            //     this.setState({ enableScrollViewScroll: true }) :
                                            //     this.setState({ enableScrollViewScroll: false })
                                            }} >
                    <SingleSelect
                        canAddItems={ true }
                        label="Company:"
                        items = { companies } 
                        // when we add a new company we assign it an id of 0 - this allows us to check it in selectedLpn later
                        onAddItem = { () => handleAddCompany( companyText ) } 
                        onSelectedItemsChange = { option => handleCompanyChange( 'selectedCompany', option ) }
                        selectedItems = { selectedCompany }
                        onChangeInput = { (text) => { dispatch(actions.handleInputChange( 'companyText', text )); 
                                                      props.resetSyncTime() } }
                        selectText = "select company"
                        searchInputPlaceholderText = "Search Items..."
                        autoCapitalize = { 'words' }
                        //move up to top of window so we can display more data with keyboard open
                        onPressElement = {() => props.resetSyncTime() }
                        reset={reset} />
                </View>

                {/* Select Driver */} 
                <View onStartShouldSetResponderCapture={ () => {
                                                setEnableScrollViewScroll(false)
                                                // this.scrollView.contentOffset === 0 && this.state.enableScrollViewScroll === false ?
                                                //   this.setState({ enableScrollViewScroll: true }) :
                                                //   this.setState({ enableScrollViewScroll: false })
                                                }} >
                    <SingleSelect
                        canAddItems={ true }
                        label="Driver:"
                        items={ people } 
                        // when we add a new person we assign them an id of 0 - this allows us to check it in selectedLpn later
                        onAddItem={ () => handleAddDriver( driverText ) }
                        onSelectedItemsChange={ option => handleDriverChange( 'selectedDriver', option ) }
                        selectedItems={ selectedDriver }
                        onChangeInput={ (text)=> { dispatch(actions.handleInputChange( 'driverText', text )); 
                                                   props.resetSyncTime() } }
                        selectText="select driver"
                        searchInputPlaceholderText="Search Items..."
                        autoCapitalize={ 'words' }
                        // move up to top  of window so we can display more data with keyboard open
                        onPressElement = {() => props.resetSyncTime() }
                        reset={reset} />
                    </View>

                {/* Add Passenger and Comments */}
                <View style={ [ styles.multiButtonContainer, { marginTop: 5, position: 'relative' } ] }>
                    { parseInt(passengerCount) > 0  ?
                    <Badge
                        style={{ position: 'absolute', top: verticalScale(-6), left: moderateScale(120,.5) }}
                        size={ moderateScale(32,.2) }
                        borderColor="green"
                        textColor="green"
                        text={ passengerCount ? parseInt(passengerCount).toString() : '' } /> :
                    null 
                    } 
                    <Button
                        onPress={ () => { dispatch(actions.showAddPassengerModal()); props.resetSyncTime() }  }
                        text={ "Passengers" }
                        icon={ parseInt(passengerCount) > 0 ? "check" : "plus-circle" }
                        color={ parseInt(passengerCount) > 0 ? "green" : "grey" }
                        width={ moderateScale(140,.3) } />
                    <Button
                        onPress={ () => { dispatch(actions.showAddCommentModal()); props.resetSyncTime() } }
                        text="Comments"
                        icon={  comment && comment.length > 0  ? "check" : "plus-circle" }
                        color={ comment && comment.length > 0  ? "green" : "grey" }
                        width={ moderateScale(140,.3) } />
                </View>

                {/* Image Capture Buttons */}
                { fRequirePhotos &&
                    <View style={ styles.multiButtonContainer }>
                        <PhotoButton 
                            onPress={ () => { dispatch(actions.showCamera('lpn', null));  props.clearSyncTime() } }
                            title="Lpn Photo" 
                            image={ lpnPhotoUri } 
                            imutable />
                        <PhotoButton 
                            onPress={ () => {dispatch(actions.showCamera('load', null)); props.clearSyncTime() }  }
                            title="Load Photo" 
                            image={ loadPhotoUri } 
                            imutable />
                    </View> 
                }

                {/* Additional Images Container */}
                { fRequirePhotos && 
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                    { additionalPhotos && additionalPhotos.length > 0 ? 
                        [ ...additionalPhotos ].map( p => {
                        return( 
                            <PhotoButton 
                            key={ p.id }
                            onPress={ () => { dispatch(actions.showCamera( p.label, p.id )); props.clearSyncTime() } }
                            onDelete={ () => dispatch(actions.removePhotoInstance( p.id )) }
                            image={ p.path } 
                            />
                        )
                        }) :
                        null
                    }
                    </View>
                }

                {/* Toggle Adding New Photo */}
                { !maxPhotosReached && fRequirePhotos ? 
                    <Button
                    onPress={ () => { dispatch(actions.showCamera( makeId(4), null )); props.clearSyncTime() }  }
                    text="Photo"
                    icon={ "plus-circle" }
                    color={ "grey" }
                    fontSize={ moderateScale(14,.2) }
                    width={ moderateScale(120,.2) } /> :
                    null 
                }

                {/* Submit Error Message */}
                { formIncompleteError ? 
                    <ErrorMessage errorText="Data missing. Please review." /> :
                    null
                }

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
                    icon="check"
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
    top: -80,
    margin: 'auto',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }
};
