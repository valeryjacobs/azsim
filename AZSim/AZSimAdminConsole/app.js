'use strict';

var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;
var iotHub = require('azure-iothub');
var secrets = require('./secrets.js');
var figlet = require('figlet');
var colors = require('colors');
var uuid = require('uuid');

const deepstream = require('deepstream.io-client-js')
const dsClient = deepstream('ws://40.118.108.105:6020').login()

figlet('Device Manager', function (err, data) { console.log(data); console.log('Running...') });

var connectionString = secrets.iotHubConnectionString;
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);

var provisionDevice = function (deviceId) {
    //var device = new iotHub.Device(null);
    //device.deviceId = deviceId;
 
    var device = {
        deviceId: deviceId,
        status: 'enabled',
        authentication: {
            symmetricKey: {
                primaryKey: new Buffer(uuid.v4()).toString('base64'),
                secondaryKey: new Buffer(uuid.v4()).toString('base64')
            }
        }
    };

    registry.create(device, function (err, deviceInfo, res) {

        if (err) {
            console.log('err' + err);
            registry.get(device.deviceId, printDeviceInfo);
        }
        if (deviceInfo) {
            console.log('Device created.' + deviceInfo.authentication.symmetricKey.primaryKey);
            var simulator = dsClient.record.getRecord(device.deviceId);
            simulator.set('iotHubNamespace', secrets.iotHubNamespace);
            simulator.set('primaryKey', deviceInfo.authentication.symmetricKey.primaryKey);

            registry.getTwin(device.deviceId, function (err, twin) {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log(JSON.stringify(twin, null, 2));

                    simulator.set('deviceTwin', JSON.stringify(twin, null, 2));

                    var twinPatch = {
                        tags: {
                            city: "Amsterdam",
                            building: "A1",
                            floor: "1"
                        },
                        properties: {
                            desired: {
                                telemetryInterval: 1
                            }
                        }
                    };

                    twin.update(twinPatch, function (err, twin) {
                        if (err) {
                            console.error(err.message);
                        } 
                    });

                    printDeviceInfo(err, deviceInfo, res);
                }
            });
        }
    })
}

function printDeviceInfo(err, deviceInfo, res) {
    if (deviceInfo) {
        console.log('Device ID: ' + deviceInfo.deviceId);
        console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
    }
}

var updateDeviceTwin = function (deviceId, deviceTwin) {
    console.log('updating twin' + deviceId);
    registry.getTwin(deviceId, function (err, twin) {
        twin.update(deviceTwin, function (err, twin) { });
    })
};

var startRebootDevice = function (deviceId) {
    console.log(deviceId)
    var methodName = "reboot";

    var methodParams = {
        methodName: methodName,
        payload: null,
        timeoutInSeconds: 30
    };

    client.invokeDeviceMethod(deviceId, methodParams, function (err, result) {
        if (err) {
            console.error("Direct method error: " + err.message);
        } else {
            console.log(result);
            //console.log("Successfully invoked the device to reboot.");
        }
    });
};

var queryTwinLastReboot = function () {
    registry.getTwin(deviceToReboot, function (err, twin) {

        if (twin.properties.reported.iothubDM !== null) {
            if (err) {
                console.error('Could not query twins: ' + err.constructor.name + ': ' + err.message);
            } else {
                var lastRebootTime = twin.properties.reported.iothubDM.reboot.lastReboot;
                console.log('Last reboot time: ' + JSON.stringify(lastRebootTime, null, 2));
            }
        } else
            console.log('Waiting for device to report last reboot time.');
    });
};

dsClient.rpc.provide('devicemanager', (data, response) => {
    console.log('device manager :' + data.deviceId);
    console.log(data.action);
    switch (data.action) {
        case 'reboot':
            startRebootDevice(data.deviceId);
            break;
        case 'provision':
            provisionDevice(data.deviceId);
            break;
        case 'updateTwin':
            updateDeviceTwin(data.deviceId, data.deviceTwin);
            break;

    }
});



//setInterval(queryTwinLastReboot, 2000);