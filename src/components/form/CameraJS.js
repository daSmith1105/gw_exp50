import React, {useState, useEffect} from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import toTitleCase from '../../utility/toTitleCase';
import { FontAwesome } from '@expo/vector-icons';
import { Spinner } from '../common';
import { Camera } from 'expo-camera/legacy';
import * as Linking from 'expo-linking'
import * as actions from '../../actions'

// is camera ref being handled correctly?

const CameraJS = (props) => {
    // component state
    const [takingPhoto, setTakingPhoto] = useState(false);
    const [zoom, setZoom] = useState(0);
    const [showPermissionModal, setShowPermissionModal] = useState('');
    // app state
    const flash = useSelector(state => state.camera.flash);
    const ratio = useSelector(state => state.camera.ratio);
    const type = useSelector(state => state.camera.type);
    const imageType = useSelector(state => state.form.imageType);
    const currentPhoto = useSelector(state => state.form.currentPhoto);

    const dispatch = useDispatch();

    // run this once on load and cleanup on unmount
    useEffect(() => {
        setTakingPhoto(false);
        setShowPermissionModal('');
        getCameraPermissions();
        // cleanup on component unmount
        return () => {
            dispatch(actions.hideCamera());
        }
    } ,[]);

    const navigateToSettings = () => {
        setShowPermissionModal('');
        // open app settings so user can allow camera permissions
        Linking.openSettings();
    };

    const closeSettings = async (type) => {
        setShowPermissionModal('');
        if(type === 'camera'){
            console.log('bammmmmm')
            dispatch(actions.hideCamera());
        };
    };

    const closeCamera = () => {
        dispatch(actions.hideCamera());
    };

    const getCameraPermissions = async() => {
        // we should already have this, but if we dont we need to prompt the user again before using the camera
        const photoStatus  = await Camera.getCameraPermissionsAsync();
        // returns an object with the status,canAskAgain,expires,granted of the permission
        if(!photoStatus || photoStatus.status !== 'granted') {
            // request the camera permission
            const requestStatus = await Camera.requestCameraPermissionsAsync();
            // returns an object with the status,canAskAgain,expires,granted of the permission
            if(!requestStatus || requestStatus.status !== 'granted') {
                // we don't have the necessary permissions to take a photo
                // show a modal to send user to settings to enable camera permissions
                setShowPermissionModal('camera');
            };
        };
    };

    const getMediaPermissions = async() => {
        const mediaStatus = await MediaLibrary.getPermissionsAsync();
        // returns an object with the status,accessPrivilages,canAskAgain,expires,granted of the permission;
        if(!mediaStatus || mediaStatus.status !== 'granted') {
            // request the media permission
            const requestStatus = await MediaLibrary.requestPermissionsAsync();
            // returns an object with the status,accessPrivilages,canAskAgain,expires,granted of the permission
            if(!requestStatus || requestStatus.status !== 'granted') {
                // we don't have the necessary permissions to select from device image library, bail out
                // show a modal to send user to settings to enable camera permissions
                setShowPermissionModal('photos');
            };
            return false;
        };

        return true;
    };

    const takePicture = async() => {
        setTakingPhoto(true);
        // is this using ref or what?
        const photo = await camera.takePictureAsync();
        Promise.all([photo])
        .then( async() => {
            try {
                const imgResize = await ImageManipulator.manipulateAsync(   photo.uri,
                                                                            [{resize: { width: 600 } }],
                                                                            { compress: .5 }
                                                                        );
                Promise.all([imgResize])
                .then ( () => {
                    if ( currentPhoto && currentPhoto.length > 0 ) {
                        dispatch(actions.modifyExistingPhoto( currentPhoto, currentPhoto, imgResize.uri ));
                    } else if( imageType !== 'lpn' && imageType !== 'load' && currentPhoto.length < 1 ) {
                        dispatch(actions.setPhotoData( imageType, imageType , imgResize.uri ));
                    } else {
                       dispatch(actions.setPhotoData( null, imageType , imgResize.uri ));
                    };
                    setTakingPhoto(false);
                    dispatch(actions.hideCamera());
                })
            } catch (error) {
                if ( currentPhoto && currentPhoto.length > 0 ) {
                    dispatch(actions.modifyExistingPhoto( currentPhoto, currentPhoto, data.uri ));
                } else if( imageType !== 'lpn' && imageType !== 'load' && currentPhoto.length < 1 ) {
                    dispatch(actions.setPhotoData( imageType, imageType , data.uri ));
                } else {
                    dispatch(actions.setPhotoData( null, imageType , data.uri ));
                };
                dispatch(actions.hideCamera());
            }
        })
        .catch( error => {
            console.log(error)
        })
    };

    const loadImageFromLibrary = async() => {
        // make sure we have the necessary permissions to access the device image library
        let canLoad = await getMediaPermissions();
        // if we don't have the permissions, bail out
        if( !canLoad ) {
            return;
        };

        // open the image picker
        const result = await ImagePicker.launchImageLibraryAsync({  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                                                    quality: .2,
                                                                });
        // if image picker is canceled, just return
        if (result.cancelled) {
            return;
        };

        // this is a new pattern for expo image picker
        // prior it was just result.uri
        //need to check if this works the same on deveices or if it is an annomolly when using simulator
        let imgURI = result.assets[0].uri;

        // image needs to be resized and compressed to save space and be in the proper aspect ratio for upload to server
        const imgResize = await ImageManipulator.manipulateAsync(   imgURI,
                                                                    [{resize: { width: 600 } }],
                                                                    { compress: .5 }
                                                                );
        // const imgResize = await ImageManipulator.manipulateAsync(   result.uri,
        //     [{resize: { width: 600 } }],
        //     { compress: .5 }
        // );

        // determine what photo 'type was opened and set the photo data to the redux store
        // we may be assigning a new photo or modifying an existing one
        if ( currentPhoto && currentPhoto.length > 0 ) {
            dispatch(actions.modifyExistingPhoto( currentPhoto, currentPhoto, imgResize.uri ));
        } else if( imageType !== 'lpn' && imageType !== 'load' && currentPhoto.length < 1 ) {
            dispatch(actions.setPhotoData( imageType, imageType , imgResize.uri ));
        } else {
            dispatch(actions.setPhotoData( null, imageType , imgResize.uri ));
        };

        // all done, hide the camera and show intake form
        setTakingPhoto(false);
        dispatch(actions.hideCamera());
    };

    // pinch to zoom functionality
    const changeZoom = (event) => {
        // hit minimum zoom threshold - snap back to full image
        if(event.nativeEvent.scale < 0.7){
            setZoom(0);
            return;
        };
        // compare the current zoom level to the previous zoom level - zoom in
        if (event.nativeEvent.scale > 1 && zoom < 1) {
            setZoom(zoom + 0.001);
            return;
        };
        // compare the current zoom level to the previous zoom level - zoom out
        if (event.nativeEvent.scale < 1 && zoom > 0) {
            setZoom(zoom <= 0 ? 0 : zoom - 0.001);
            return;
        };
    };

    const handleToggleFlash = () => {
        dispatch(actions.toggleFlash());
    };

    return (
        <PinchGestureHandler onGestureEvent={(event) => changeZoom(event)}>
            {/* this is expo camera object  */}
            {/* useCamera2Api is an android option */}
            <Camera style={styles.cameraStyle}
                    ref={ ref => camera = ref }
                    zoom={ zoom }
                    autoFocus={ true }
                    focusDepth={ zoom }
                    ratio={ ratio }
                    type={ type }
                    flashMode={ flash }
                    useCamera2Api={true} >

                <View style={styles.containerStyle}>

                    {/* flash selection button */}
                    <TouchableOpacity onPress={ handleToggleFlash }
                                      style={ styles.flashStyle } >
                        <View style={styles.flashContainerStyle}>
                            <FontAwesome name="flash"
                                         size={ moderateScale(30, .3) }
                                         color={ flash === 'auto' ? 'goldenrod' : 'white' } />
                            <Text style={{ color: flash === 'auto' ? 'goldenrod' : 'white', marginLeft: scale(4) }}>
                                { flash }
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* image type heading label  */}
                    { imageType === 'lpn' || imageType === 'load' ?
                        <View style={ styles.labelStyle }>
                            <Text style={ styles.imageTypeText }>{ toTitleCase( imageType + ' photo' ) }</Text>
                        </View> :
                        <View style={ styles.labelStyle }>
                            <Text style={ styles.imageTypeText }>Photo</Text>
                        </View>
                    }
                </View>

                {/* spinner when taking photo */}
                { takingPhoto &&
                    <View style={styles.spinnerContainerStyle}>
                        <Spinner color="goldenrod" />
                    </View>
                }

                {/* LPN target window for LPN imageType */}
                { imageType === 'lpn' &&
                    <View style={ styles.lpnWindow }></View>
                }

                <View style={ styles.bottomRow }>

                    {/* Back Button  */}
                    <TouchableOpacity style={ styles.backContainerStyle }
                                    onPress={ closeCamera } >
                        <Text style={ styles.backTextStyle }>
                            Back
                        </Text>
                    </TouchableOpacity>

                    {/* take picture button */}
                    { !takingPhoto ?
                        <TouchableOpacity onPress={ () => takePicture() }
                                          style={{ padding: scale(5) }} >
                            <FontAwesome name="camera"
                                         size={moderateScale(60, .3)}
                                         color= "white" />
                        </TouchableOpacity> :
                        <TouchableOpacity onPress={ () => console.log('taking photo. action unavailable.') }
                                          style={{ padding: scale(5) }} >
                            <Text style={{ color: 'goldenrod', fontSize: scale(12) }}>Taking Photo ... </Text>
                        </TouchableOpacity>
                    }

                    {/* Image selection Button  */}
                    <TouchableOpacity style={ styles.bottomRowButton }
                                      onPress={ loadImageFromLibrary } >
                        <FontAwesome name="image"
                                     size={moderateScale(30, .3)}
                                     color="white" />
                    </TouchableOpacity>

                </View>

                {/* show permission modal if we don't have the necessary permissions */}
                { showPermissionModal && showPermissionModal.length > 0 &&
                    <View style={ styles.modalContainerStyle }>
                        <View style={ styles.modalInnerContainerStyle}>
                        <Text style={ styles.modalTextStyle }>
                            {showPermissionModal === 'camera' ?
                            `GateWatcher needs permission to take photos on this device.` :
                            `GateWatcher needs permission to select photos from this device.`
                            }
                        </Text>
                        <TouchableOpacity onPress={ navigateToSettings }
                                          style={ styles.settingsOpenStyle }>
                            <Text style={ styles.settingsOpenTextStyle }>Open Settings</Text>
                        </TouchableOpacity>
                        {/* close this modal */}
                        <TouchableOpacity onPress={ () => closeSettings(showPermissionModal) }
                                          style={ styles.closeModalStyle }>
                            <FontAwesome name="times-circle"
                                         size={moderateScale(30, .2)}
                                         color="black" />
                        </TouchableOpacity>
                        </View>
                    </View>
                }

            </Camera>

        </PinchGestureHandler>
    )
}

export default CameraJS;

const styles = {
    cameraStyle: {
        position: 'absolute',
        top: 30,
        bottom: 0,
        alignItems: 'center',
        zIndex: 30,
        height: '100%',
    },
    containerStyle: {
        flexDirection: 'row'
    },
    flashContainerStyle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    labelStyle: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginTop: 0,
        height: scale(90),
        paddingTop: verticalScale(30),
        width: '100%',
    },
    imageTypeText: {
        color: 'white',
        fontSize: moderateScale(24, .2),
        textAlign: 'center',
        width: '100%',
    },
    spinnerContainerStyle: {
        position: 'absolute',
        top: '43%',
        left: 0,
        right: 0,
        margin: 'auto',
        zIndex: 32
    },
    lpnWindow: {
        position: 'absolute',
        top: '30%',
        margin: 'auto',
        borderWidth: 3,
        borderColor: 'goldenrod',
        height: moderateScale(200, .5),
        width: moderateScale(300.5),
    },
    bottomRow: {
        flexDirection: 'row',
        height: verticalScale(80) ,
        width: '90%',
        maxWidth: 600,
        position: 'absolute',
        bottom: scale(40),
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 27
    },
    backContainerStyle: {
        marginTop: verticalScale(8)
    },
    backTextStyle: {
        fontWeight: 'bold',
        fontSize: moderateScale(18, .2),
        marginBottom: 10,
        color: 'white'
    },
    flashStyle:{
        flex: .2,
        flexDirection :'row',
        position: 'absolute',
        top: scale(25),
        left: scale(30),
        padding: scale(4),
        paddingRight: scale(8),
        paddingLeft: scale(8),
        zIndex: 20
    },
    modalContainerStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(52, 52, 52, 0.9)',
        zIndex: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalInnerContainerStyle: {
        position: 'absolute',
        top: '25%',
        left: '10%',
        width: '80%',
        height: '30%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: scale(10),
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalTextStyle: {
        fontSize: moderateScale(18, .2),
        textAlign: 'center',
        marginBottom: scale(20)
    },
    settingsOpenStyle: {
        padding: scale(10),
        backgroundColor: 'goldenrod',
        borderRadius: 10
    },
    settingsOpenTextStyle: {
        color: 'white',
        fontSize: moderateScale(16, .2)
    },
    closeModalStyle: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: scale(10)
    }
};
