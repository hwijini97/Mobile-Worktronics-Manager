import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Vibration, ToastAndroid, AppState, Platform, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import { getAccessToken, getDeviceList } from '../Data';
import Modal from 'react-native-modal';

let initIntervalId = '';
let num = 0;

export default class ScriptComponent extends Component{
    constructor(props){
        super(props);
        this.state={
            accessToken: '', // Request Header의 Authorization 필드에 넣으면 됨
            scriptList: [], // script 리스트
            isModalVisible: false, // 모달 창 활성화 여부
            currentScriptDetail: [], // 현재 script의 세부 정보
            processName: '', // 선택한 스크립트의 프로세스 이름
            version: '' // 선택한 스크립트의 버전
        }

        initIntervalId = setInterval(() => (
            this.init()
        ), 500);
    }

    init(){
        if(getDeviceList().length != 0){
            this.state.accessToken = getAccessToken();
            this.retrieveScriptList();
            clearInterval(initIntervalId);
        }
    }

    retrieveScriptList(){ // Script 리스트를 불러옴
        let self = this;
        let header = {
            "Authorization": "Bearer " + this.state.accessToken
        }
        axios.get('http://211.253.28.27:8080/peon/retrieveScriptList', {
            headers: header
        }).then(function (response) {
            self.setState({scriptList: response.data.body.list});
        }).catch(function (error) {
            console.log("retrieveScriptList, " + error);
        });
    }

    toggleModal(item){
        if(!this.state.isModalVisible){
            this.setState({processName: item.processName});
            this.setState({version: item.version});
            this.retrieveScriptRetention(item.processName, item.version);
        }
        this.setState({isModalVisible: !this.state.isModalVisible});
    };

    retrieveScriptRetention(processName, version){ // Script 상세 정보를 불러옴
        let self = this;
        let header = {
            "Authorization": "Bearer " + this.state.accessToken
        }
        axios.get('http://211.253.28.27:8080/peon/retrieveScriptRetention?processName='+processName+'&version='+version, {
            headers: header
        }).then(function (response) {
            self.setState({currentScriptDetail: response.data.body.list})
        }).catch(function (error) {
            console.log("retrieveScriptRetention, " + error);
        });
    }

    render(){
        return (
            <View style={{paddingLeft: '3%', paddingRight: '3%'}}>
                <Text key="ScriptListText" style={style.titleText}>
                    Script List
                </Text>
                <View style={style.container}>
                    <FlatList
                        keyExtractor={item => item.timestamp}
                        data={this.state.scriptList}
                        renderItem={( obj )=>
                        <TouchableOpacity onPress={() => this.toggleModal(obj.item)}>
                            <View style={style.itemContainer}>
                                <Text style={style.itemTitleText}>{obj.item.processName} ({obj.item.version})</Text>
                                <Text style={style.itemMessageText}>* {obj.item.files[0].path}{obj.item.files[0].file}</Text>
                            </View>
                        </TouchableOpacity>
                        }>
                    </FlatList>
                </View>
                <Modal transparent={true} isVisible={this.state.isModalVisible}>
                    <View style={style.modal}>
                        <View style={{width: '100%', height: '10%', paddingLeft: '3%', backgroundColor: 'powderblue', justifyContent: 'center'}}>
                            <Text style={style.modalTitle}>{this.state.processName} ({this.state.version})</Text>
                        </View>
                        <View style={{width: '100%', height: '80%', paddingLeft: '3%'}}>
                            <FlatList
                                keyExtractor={item => item.deviceId}
                                data={this.state.currentScriptDetail}
                                renderItem={( obj )=>
                                <TouchableOpacity>
                                    <View style={style.itemContainer}>
                                        <Text style={style.itemTitleText}>{obj.item.deviceId} ({obj.item.alias})</Text>
                                    </View>
                                </TouchableOpacity>
                                }>
                            </FlatList>
                        </View>
                        <View style={{width: '100%', height: '10%'}}>
                            <TouchableOpacity style={style.closeButton} onPress={() => this.toggleModal(this.state.currentDevice)}>
                                <Text style={style.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F5FCFF"
    },
    itemContainer: {
        borderBottomWidth: 1,
        paddingVertical: 5
    },
    titleText: {
        fontSize: 17,
        marginVertical: 15,
        marginLeft: 5
    },
    itemTitleText: {
        fontSize: 15
    },
    itemMessageText: {
        fontSize: 14
    },
    modal: {
        width: '100%',
        height: '80%',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#EEEEEE',
        alignItems: 'center'
    },
    closeButton: {
      flex: 1,
      width: 80,
      alignItems: 'center',
      alignSelf: 'flex-end',
      justifyContent: 'center',
      backgroundColor: '#DDDDDD'
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    modalText: {
        fontSize: 12
    },
    closeText: {
        fontSize: 18
    }
});