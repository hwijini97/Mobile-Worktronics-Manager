import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Vibration, ToastAndroid, AppState, Platform, FlatList } from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon } from 'native-base';
import axios from 'axios';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { getAccessToken, getDeviceList, getDeviceName } from '../Data';
import Modal from 'react-native-modal';

let initIntervalId = '';
let latestDataIntervalId = '';
let num = 0;

export default class DashboardComponent extends Component{
    constructor(props){
        super(props);
        this.state={
            appState: AppState.currentState, // 현재 앱 상태 -> active, background 등
            accessToken: '', // Request Header의 Authorization 필드에 넣으면 됨
            deviceList: [], // 봇 리스트
            deviceName: [], // 봇의 id와 이름이 저장된 리스트
            latestData: [], // 실시간으로 받아오는 봇의 상태
            deviceData: [[]], // 위의 각 데이터들을 render()에서 보여주기 위해 2차원 배열로 만듦, 열 크기 = 3
            onlineBotCount: 0, // 현재 상태가 offline이 아닌 봇의 개수
            isModalVisible: false, // 모달 창 활성화 여부
            currentDevice: [], // 모달 창에 보여지는 봇의 데이터
            processList: [] // 모달 창에서 선택한 device의 process List
        }

        initIntervalId = setInterval(() => (
            this.init()
        ), 500);
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange(nextAppState){
        this.setState({appState: nextAppState});
    }

    init(){
        if(getDeviceName().length != 0){
            this.state.accessToken = getAccessToken();
            this.state.deviceList = getDeviceList();
            this.state.deviceName = getDeviceName();
            this.retrieveLatestData(this.state.accessToken, this.state.deviceList);
            latestDataIntervalId = setInterval(() => (
                this.retrieveLatestData(this.state.accessToken, this.state.deviceList) // 5초에 한 번씩 각 device의 상태 불러옴
            ), 5000);
            clearInterval(initIntervalId);
        }
    }

    getOnlineBotCount(latestData){
        var disconnectedCount = 0;
        for(var i=0; i<this.state.latestData.length; i++){
            if(this.state.latestData[i].status == "Disconnected"){
                disconnectedCount = disconnectedCount + 1;
            }
        }
        return this.state.latestData.length - disconnectedCount;
    }

    getBotData(){ // 각 device의 필요한 정보만 모아둠
        let data = []; // 모든 device의 data
        let unitData = []; // 단위 device data -> device 3개 씩 묶음
        for(var i=0; i<this.state.deviceList.length; i++){
            var deviceId = this.state.deviceList[i];
            var deviceName = '';
            for(var j=0; j<this.state.deviceName.length; j++){
                if(this.state.deviceList[i] == this.state.deviceName[j][0]){
                    deviceName = this.state.deviceName[j][1];
                    break;
                }
            }
            var status = 'Offline';
            var version = '';
            for(var j=0; j<this.state.latestData.length; j++){
                if(this.state.deviceList[i] == this.state.latestData[j].deviceId){
                    status = this.state.latestData[j].status;
                    version = this.state.latestData[j].version;
                    break;
                }
            }
            unitData.push({'deviceId': deviceId, 'version': version, 'deviceName': deviceName, 'status': status});
            if(unitData.length == 3){
                data.push(unitData);
                unitData = [];
            } else if(i == this.state.deviceList.length-1){
                for(var j=0; j < 3 - this.state.deviceList.length % 3; j++){
                    unitData.push({'deviceId': j, 'version': version, 'deviceName':'', 'status': ''});
                }
                data.push(unitData);
            }
        }
        this.setState({deviceData: data});
    }

    retrieveLatestData(accessToken, deviceList){
        if(this.state.appState != "active"){
            clearInterval(latestDataIntervalId); // 앱을 끄면 주기적으로 데이터를 불러오는 함수를 비활성화해야 함
            return;
        }
        let self = this;
        let header = {
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json"
        }
        let body = {
            "deviceIds": deviceList
        }
        axios.post('http://211.253.28.27:8080/peon/retrieveLatestData', body, {
            headers: header
        }).then(function (response) {
            if(self.state.latestData != []){
                for(var i=0; i<self.state.latestData.length; i++){
                    if(self.state.latestData[i].status != response.data.body.list[i].status){ // 어떤 bot의 status가 바뀌면 알림(Toast) + 진동
                        if(Platform.OS === 'android'){ // 안드로이드 운영체제인 경우
                            ToastAndroid.show("The state of " + self.getDeviceName(self.state.latestData[i].deviceId) + " has been changed!\n"
                             + self.state.latestData[i].status + " -> " +  response.data.body.list[i].status, ToastAndroid.SHORT); // 토스트 메시지
                            Vibration.vibrate(500); // 0.5초 동안 진동
                        } else{ // IOS, Windows 폰 등 다른 운영체제인 경우
                            // 아직 구현하지 않음
                        }
                    }
                }
            }
            self.setState({latestData: response.data.body.list});
            self.setState({onlineBotCount: self.getOnlineBotCount(self.latestData)});
            self.getBotData();
        }).catch(function (error) {
            console.log("retrieveLatestData, " + error);
        });
    }

    getDeviceName = function(deviceId){
        for(var i=0; i<this.state.deviceName.length; i++){
            if(this.state.deviceName[i][0] == deviceId){
                return this.state.deviceName[i][1];
            }
        }
        return deviceId;
    }

    retrieveProcessList(deviceId){
        let self = this;
        let header = {
            "Authorization": "Bearer " + this.state.accessToken
        }
        axios.get('http://211.253.28.27:8080/peon/retrieveProcessList?deviceId='+deviceId, {
            headers: header
        }).then(function (response) {
            self.setState({processList: response.data.body.list});
        }).catch(function (error) {
            console.log("retrieveProcessList, " + error);
        });
    }

    toggleModal(device){
        if(!this.state.isModalVisible){ // 모달이 켜질 때
            this.setState({currentDevice: device}); // 선택한 device를 currentDevice stete에 저장
            this.retrieveProcessList(device.deviceId); // 선택한 device에 등록된 프로세스 리스트 불러옴
        }
        this.setState({isModalVisible: !this.state.isModalVisible});
    };

    buttonStyle = function(status) {
        switch(status){
            case 'Ready':
                return {
                    flex: 1,
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#CCEEBB'
                }
            case 'Running':
                return {
                    flex: 1,
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFBBBB'
                }
            case 'Offline':
            case 'Disconnected':
                return {
                    flex: 1,
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#DDDDDD'
                }
            default:
                return {
                    flex: 1,
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#EEEEEE'
                }
        }
    }

    render(){
        return (
            <View>
                <Card>
                    <CardItem>
                        <Left>
                            <Body>
                                <Text key="botListText" style={style.botCountText}>
                                    Bot List ({this.state.onlineBotCount} / {this.state.deviceList.length})
                                </Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem>
                        <View style={style.deviceList}>
                            <Grid>
                                {this.state.deviceData.map(unitDevice => ( // 현재 device의 list를 화면에 출력
                                    <Row key={"deviceRow_" + num++} style={style.deviceRow}>
                                        {unitDevice.map(device => (
                                            <Col key={"deviceCol_" + device.deviceId} style={style.deviceCol}>
                                                {(() => {
                                                    if(device.deviceName != ''){
                                                        return(
                                                            <TouchableOpacity key={device.deviceId}
                                                            style={this.buttonStyle(device.status)}
                                                            onPress={() => this.toggleModal(device)}>
                                                                <Text style={style.buttonText}>{device.deviceName}</Text>
                                                                <Text></Text>
                                                                <Text style={style.buttonText}>{device.status}</Text>
                                                            </TouchableOpacity>
                                                        )
                                                    }
                                                })()}
                                            </Col>
                                        ))}
                                    </Row>
                                ))}
                            </Grid>
                        </View>
                    </CardItem>
                </Card>
                <Modal transparent={true} isVisible={this.state.isModalVisible}>
                    <View style={style.modal}>
                        <View style={{width: '100%', height: '10%', paddingLeft: '3%', backgroundColor: 'powderblue', justifyContent: 'center'}}>
                            <Text style={style.modalTitle}>{this.state.currentDevice.deviceName}</Text>
                        </View>
                        <View style={{width: '100%', height: '30%', paddingLeft: '3%'}}>
                            <Text></Text>
                            <Text style={style.modalText}>Bot ID : {this.state.currentDevice.deviceId}</Text>
                            <Text style={style.modalText}>Bot Name : {this.state.currentDevice.deviceName}</Text>
                            <Text style={style.modalText}>Bot Status : {this.state.currentDevice.status}</Text>
                        </View>
                        <View style={{width: '100%', height: '10%', paddingLeft: '3%', backgroundColor: 'powderblue', justifyContent: 'center'}}>
                            <Text style={style.modalTitle}>Process List</Text>
                        </View>
                        <View style={{width: '100%', height: '40%', paddingLeft: '3%'}}>
                            <FlatList
                                keyExtractor={item => item.processName}
                                data={this.state.processList}
                                renderItem={( obj )=>
                                <TouchableOpacity>
                                    <View style={style.itemContainer}>
                                        <Text style={style.itemTitleText}>{obj.item.processName} ({obj.item.version})</Text>
                                    </View>
                                </TouchableOpacity>
                                }>
                            </FlatList>
                        </View>
                        <View style={{width: '100%', height: '10%'}}>
                            <TouchableOpacity style={style.closeButton} onPress={() => this.toggleModal(this.state.currentDevice)}>
                                <Text style={style.modalText}>Close</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceList: {
        width: '100%',
        alignItems: 'center',
        flexDirection:'row',
    },
    botCountText: {
        fontSize: 17
    },
    buttonText: {
        fontSize: 12
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    modalText: {
        fontSize: 18
    },
    deviceCol: {
        marginLeft: 7,
        marginRight: 7
    },
    deviceRow: {
        marginBottom: 14
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
});