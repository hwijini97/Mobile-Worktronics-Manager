// App.js

import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'
import Login from './Components/Login'
import MainScreen from './Components/MainScreen'

const navigator = createStackNavigator({
  Login: {
    screen : Login,
    navigationOptions: {
      title: 'Login',
    }
  },
  Main: {
    screen : MainScreen,
    navigationOptions: {
      title: 'Worktronics Manager',
    }
  },
  initialRouteName: 'Login'
});

const app = createAppContainer(navigator);

export default app;