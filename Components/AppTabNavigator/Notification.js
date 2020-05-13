import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container, Content, Icon } from 'native-base';
import NotificationComponent from '../CardComponents/NotificationComponent';

export default class Notification extends Component {
    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name='alarm' style={{ color: tintColor }} />
        )
    }
    render() {
        return (
            <Container style={style.container}>
                <Content>
                    <NotificationComponent />
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