import React, { Component } from 'react';
import { StyleSheet, Text, View, YellowBox } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { login } from './Data';

// 하단 탭들
import DashboardTab from './AppTabNavigator/Dashboard'
import NotificationTab from './AppTabNavigator/Notification'
import ScriptTab from './AppTabNavigator/Script'
import StatisticsTab from './AppTabNavigator/Statistics'

YellowBox.ignoreWarnings([ // 자꾸 Yellow 박스로 Warning 메시지가 뜨길래 일단 없앰, 중요한 것은 아님
  'VirtualizedLists should never be nested'
])

const AppTabNavigator = createMaterialTopTabNavigator({ // 탭 관련
    Dashboard: { screen: DashboardTab },
    Notification: { screen: NotificationTab },
    Script: { screen: ScriptTab },
    Statistics: { screen: StatisticsTab }
}, {
    animationEnabled: true,
    swipeEnabled: true,
    tabBarPosition: "bottom",
    tabBarOptions: {
        style: {
            ...Platform.select({
                android:{
                    backgroundColor:'white',
                }
            })
        },
        activeTintColor: '#000',
        inactiveTintColor: '#d1cece',
        upperCaseLabel: false,
        showIcon: true,
    }
});

const AppTabContainer = createAppContainer(AppTabNavigator);

export default class MainScreen extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return <AppTabContainer/>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});