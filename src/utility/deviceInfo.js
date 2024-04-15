import * as Device from 'expo-device';
import packageJson from '../../package.json';

const deviceInfo = () => {
  let data = Device.deviceName;
  let d = data.slice(1, -1);
  let device = d + ' App Ver. ' + packageJson.version;
  return device;
};

export default deviceInfo;