import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container, Content, Icon } from 'native-base';
import ScriptComponent from '../CardComponents/ScriptComponent';

export default class Script extends Component {
    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name='bookmarks' style={{ color: tintColor }} />
        )
    }
    render() {
        return (
            <Container style={style.container}>
                <Content>
                    <ScriptComponent />
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