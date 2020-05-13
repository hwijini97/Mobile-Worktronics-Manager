import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Content, Icon } from 'native-base';
import DashboardComponent from '../CardComponents/DashboardComponent';

export default class Dashboard extends Component {
    constructor(props){
        super(props);
    }

    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name='bulb' style={{ color: tintColor }} />
        )
    }

    render() {
        return (
            <Container style={style.container}>
                <Content>
                    <DashboardComponent />
                </Content>
            </Container>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});