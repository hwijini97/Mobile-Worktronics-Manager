import React, { Component } from 'react';
import axios from 'axios';

var accessToken = '';
var deviceList = [];
var deviceName = [];

export function setAccessToken(token){
    accessToken = token;
}

export function getAccessToken(){
    return accessToken;
}

export function getDeviceList(){
    return deviceList;
}

export function getDeviceName(){
    return deviceName;
}

export function retrieveDeviceList(){
    axios.get('http://211.253.28.27:8080/device/retrieveDeviceList?pageSize=100&sort=alias', {
        headers: {"Authorization": "Bearer " + accessToken}
    }).then(function (response) {
        let rawDeviceList = response.data.body.list;
        deviceList = [];
        deviceName = [];
        for(let i=0; i<rawDeviceList.length; i++){
            deviceList.push(rawDeviceList[i].deviceId);
            deviceName.push([rawDeviceList[i].deviceId, rawDeviceList[i].alias]);
        }
    }).catch(function (error) {
        console.log("retrieveDeviceList, " + error);
    });
}