/**
 * @format
 */

import { AppRegistry } from 'react-native';
import 'react-native-reanimated';
import App from './App';
import { name as appName } from './app.json';

// Register the app
if (!AppRegistry.getAppKeys().includes(appName)) {
  AppRegistry.registerComponent(appName, () => App);
} else {
  console.log(`App ${appName} already registered`);
}