'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var colors = require('colors');
var figlet = require('figlet');
var si = require('systeminformation');
var Message = require('azure-iot-device').Message;

var measurementValue = 0;
var logOutputEnabled = false;

var client;
var refreshIntervalId;
var simulator;
const deepstream = require('deepstream.io-client-js');
const dsClient = deepstream('ws://40.118.108.105:6020').login();

const simulatorId = dsClient.getUid();

figlet('Device Simulator', function (err, data) {
    console.log(data);
    console.log('Identified as simulator ' + simulatorId.yellow);
});

setInterval(function () {

    si.currentLoad()
        .then(data => measurementValue = data.currentload)
        .catch(error => console.error(error));

}, 1000);


dsClient.record.getRecord(simulatorId).set({
    runtime: 'console',
    status: 'waiting',
    simulatorId: simulatorId,
    frequency: 10,
    payload: '{"sensorA": 0, "sensorB": 0}',
    connectionString: ''
});

const list = dsClient.record.getList('simulators');
list.addEntry(simulatorId);

dsClient.rpc.provide(simulatorId, (data, response) => {

    simulator = dsClient.record.getRecord(simulatorId);

    appendLog('Received request for action: ' + data.action);

    if (data.action === 'test') {

        test();
    }
    else if (data.action === 'start') {
        startSimulation();
    }
    else if (data.action === 'stop') {
        clearInterval(refreshIntervalId);
        console.log('Stopped simulation.'.red);
    }
    else if (data.action === 'delete') {
        process.exit();
    }

    appendLog('Executed action: ' + data.action);
});

function test() {

    if (simulator.get('connectionString').length > 0) {
        console.log('Testing simulator message send...');
        client = clientFromConnectionString(simulator.get('connectionString'));
        client.open(connectCallback);

        var message = new Message(simulator.get('payload'));

        message.

        client.sendEvent(message, callBack('send'));
        console.log('Sent message: '.cyan + message.getData().cyan);
        appendLog('Message send ' + message.getData());
    }
}

function appendLog(output)
{
    if (logOutputEnabled) {
        simulator['log'] = simulator['log'] + '\n\r' + output;
    }
};


function startSimulation() {

    console.log('Starting simulation with a '.green + simulator.get('frequency') + ' second interval'.green);

    var connectionString = 'HostName=' + simulator.get('iotHubNamespace') + '.azure-devices.net;DeviceId=' + simulatorId + ';SharedAccessKey=' + simulator.get('primaryKey');
    console.log('conn:' + connectionString);
    client = clientFromConnectionString(connectionString);
    
    client.open(connectCallback);
    clearInterval(refreshIntervalId);

    refreshIntervalId = setInterval(function () {

        
        var payload = JSON.parse(simulator.get('payload'));

        payload.sensorA = measurementValue;

        var message = new Message(JSON.stringify(payload));

        console.log("Sending message: ".cyan + message.getData().cyan);
        if (simulator.get('outputLog') === true) {
            logOutputEnabled = true;
        }

        client.sendEvent(message, callBack('send'));

    }, simulator.get('frequency') * 1000);
}

function callBack(operation) {
    return function printResult(err, res) {
  
        if (err) {
            console.log(operation + ': ' + err.toString());
            appendLog(operation + ': ' + err.toString());
        }

        if (res) {
            console.log(operation + ': ' + res.constructor.name);
            appendLog(operation + ': ' + res.constructor.name);
        }
    };
}

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
        appendLog('Could not connect: ' + err);
    } else {
        var msg = 'Simulator connected. Awaiting instructions...';
        console.log(msg);
        appendLog(msg);
        client.onDeviceMethod('reboot', onReboot);
    }
};


var onReboot = function (request, response) {
    appendLog('Reboot requested');
    // Respond the cloud app for the direct method
    response.send(200, 'Reboot started', function (err) {
        if (!err) {
            console.error('An error occured when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });

    // Report the reboot before the physical restart
    var date = new Date();
    var patch = {
        iothubDM: {
            reboot: {
                lastReboot: date.toISOString()
            }
        }
    };

    // Get device Twin
    client.getTwin(function (err, twin) {
        if (err) {
            console.error('could not get twin'.red);
        } else {
            console.log('twin acquired');
            twin.properties.reported.update(patch, function (err) {
                if (err) throw err;
                console.log('Device reboot twin state reported'.yellow);
            });
        }
    });

    // Add your device's reboot API for physical restart.
    console.log('Rebooting!'.red);
    appendLog('Reboot initiated...');
};