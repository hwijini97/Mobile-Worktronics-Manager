import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue.js'

AppRegistry.registerComponent(appName, () => App);
MessageQueue.spy(message => {
  if (message.type === 0) {
    console.log(message)
  }
})