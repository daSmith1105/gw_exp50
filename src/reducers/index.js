import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import UserReducer from './UserReducer';
import UtilityReducer from './UtilityReducer';
import UpdateReducer from './UpdateReducer';
import SettingsReducer from './SettingsReducer';
import DataReducer from './DataReducer';
import FormReducer from './FormReducer';
import ModalReducer from './ModalReducer';
import CameraReducer from './CameraReducer';
import EventReducer from './EventReducer';

export default combineReducers({
    auth: AuthReducer,
    user: UserReducer,
    utility: UtilityReducer,
    update: UpdateReducer,
    settings: SettingsReducer,
    data: DataReducer,
    form: FormReducer,
    modal: ModalReducer,
    camera: CameraReducer,
    event: EventReducer
});