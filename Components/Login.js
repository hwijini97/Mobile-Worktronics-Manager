import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Switch } from 'react-native';
import { setAccessToken, retrieveDeviceList } from './Data';
import axios from 'axios';

export default class Login extends Component {
    constructor(props){
        super(props);
        this.state={
            id: "",
            password: ""
        }
    }

    login(navigation){
        if(this.state.id == ""){
            alert("ID를 입력해주세요.")
            return;
        } else if(this.state.password == ""){
            alert("Password를 입력해주세요.")
            return;
        }

        axios.post('http://211.253.28.27:8080/auth/signIn', {
            "id": this.state.id,
            "password": this.state.password
        }).then(function (response) {
            setAccessToken(response.data.accessToken);
            retrieveDeviceList();
            navigation.navigate('Main');
        }).catch(function (error) {
            console.log("login, " + error);
            alert("ID 또는 Password가 올바르지 않습니다.");
        });
    }

    render() {
        return (
            <View style={styles.container}>
                 <View style={{height: '10%'}}/>

                 <TextInput style={styles.inputBox}
                 onChangeText={(id) => this.setState({id})}
                 placeholder="ID"
                 placeholderTextColor = "#002f6c"
                 selectionColor="#fff"
                 keyboardType="email-address"
                 onSubmitEditing={()=> this.password.focus()}
                 value={this.state.Id}
                 />

                 <TextInput style={styles.inputBox}
                 onChangeText={(password) => this.setState({password})}
                 placeholder="Password"
                 secureTextEntry={true}
                 placeholderTextColor = "#002f6c"
                 ref={(input) => this.password = input}
                 />

                 <TouchableOpacity style={styles.button}
                 onPress={() => this.login(this.props.navigation)}>
                     <Text style={styles.buttonText}>Login</Text>
                 </TouchableOpacity>
           </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        width: 300,
        backgroundColor: '#eeeeee',
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#002f6c',
        marginVertical: 10
    },
    button: {
        width: 300,
        backgroundColor: '#4f83cc',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    }
});