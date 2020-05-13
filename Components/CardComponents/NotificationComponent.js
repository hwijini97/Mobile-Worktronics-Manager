import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Vibration, ToastAndroid, AppState, Platform, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import { getAccessToken, getDeviceList } from '../Data';
import Modal from 'react-native-modal';

let initIntervalId = '';
let num = 0;

export default class NotificationComponent extends Component{
    constructor(props){
        super(props);
        this.state={
            accessToken: '', // Request Header의 Authorization 필드에 넣으면 됨
            notificationList: [], // notification 리스트
            isModalVisible: false, // 모달 창 활성화 여부
            currentDeviceAlias: '', // 선택한 Notification에 해당하는 봇의 이름
            currentDeviceId: '', // 선택한 Notification에 해당하는 봇의 ID
            notificationDetail: [], // 선택한 Notification의 세부 정보
            notificationLogFile: '' // 선택한 Notification의 로그 파일 내용
        }

        initIntervalId = setInterval(() => (
            this.init()
        ), 500);
    }

    init(){
        if(getDeviceList().length != 0){
            this.state.accessToken = getAccessToken();
            this.retrieveNotification();
            clearInterval(initIntervalId);
        }
    }

    retrieveNotification(){ // Notification 리스트를 불러옴
        let self = this;
        let header = {
            "Authorization": "Bearer " + this.state.accessToken,
            "Content-Type": "application/json"
        }
        let body = {}
        axios.post('http://211.253.28.27:8080/peon/retrieveNotificationList', body, {
            headers: header
        }).then(function (response) {
            self.setState({notificationList: response.data.body.list});
        }).catch(function (error) {
            console.log("retrieveNotification, " + error);
        });
    }

    // Notification에 관한 정보를 보내면 해당 Notification의 상세 정보를 볼 수 있음
    // 여기서는 상세 정보를 불러와서 로그 파일 이름을 가져오고, 로그 파일 정보를 가져오는 데 사용함
    retrieveNotificationDetail(deviceId, uuid){ // Notification 상세 정보를 불러옴
        let self = this;
        let header = {
            "Authorization": "Bearer " + this.state.accessToken,
            "Content-Type": "application/json"
        }
        let body = {
            "command": "sendLogFile",
            "deviceId": deviceId,
            "uuid": uuid
        }
        axios.post('http://211.253.28.27:8080/peon/command', body, {
            headers: header
        }).then(function (response) {
            let logFileName = response.data.body.logFile;
            self.setState({notificationDetail: response.data.body})
            self.retrieveLogFile(deviceId, logFileName);
        }).catch(function (error) {
            console.log("retrieveLogFile, " + error);
        });
    }

    retrieveLogFile(deviceId, logFileName){ // Notification 의 로그파일을 불러옴
        let self = this;
        axios.get('http://211.253.28.27:8080/peon/retrieveLogFile?deviceId='+deviceId+"&logFile="+logFileName, {
            headers: {"Authorization": "Bearer " + this.state.accessToken}
        }).then(function (response) {
            self.setState({notificationLogFile: response.data});
        }).catch(function (error) {
            console.log("retrieveLogFile, " + error);
        });
    }

    toggleModal(alias, deviceId, uuid){
        if(!this.state.isModalVisible){
            this.setState({currentDeviceAlias: alias});
            this.setState({currentDeviceId: deviceId});
            this.retrieveNotificationDetail(deviceId, uuid);
        }
        this.setState({isModalVisible: !this.state.isModalVisible});
    };

    render(){
        return (
            <View style={{paddingLeft: '3%', paddingRight: '3%'}}>
                <Text key="notificationListText" style={style.titleText}>
                    Notification List
                </Text>
                <View style={style.container}>
                    <FlatList
                        keyExtractor={item => item.timestamp}
                        data={this.state.notificationList}
                        renderItem={( obj )=>
                        <TouchableOpacity onPress={() => this.toggleModal(obj.item.alias, obj.item.deviceId, obj.item.uuid)}>
                            <View style={style.itemContainer}>
                                <Text style={style.itemTitleText}>({obj.item.level}) {obj.item.alias}: {obj.item.timestamp}</Text>
                                <Text style={style.itemMessageText}>{obj.item.message}</Text>
                            </View>
                        </TouchableOpacity>
                        }>
                    </FlatList>
                </View>
                <Modal transparent={true} isVisible={this.state.isModalVisible}>
                    <View style={style.modal}>
                        <View style={{width: '100%', height: '20%', paddingLeft: '3%', backgroundColor: 'powderblue', justifyContent: 'center'}}>
                            <Text style={style.modalTitle}>{this.state.currentDeviceAlias} ({this.state.currentDeviceId})</Text>
                            <Text />
                            <Text>
                            {this.state.notificationDetail.process} : {this.state.notificationDetail.version} ({this.state.notificationDetail.script}) {this.state.notificationDetail.action} {this.state.notificationDetail.startedTime} ~ {this.state.notificationDetail.finishedTime}
                            </Text>
                        </View>
                        <View style={{width: '100%', height: '70%', paddingLeft: '3%'}}>
                            <ScrollView>
                                <Text style={style.modalText}>{this.state.notificationLogFile}</Text>
                            </ScrollView>
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