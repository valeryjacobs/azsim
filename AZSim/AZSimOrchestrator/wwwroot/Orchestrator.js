
const deepstream = require('deepstream.io-client-js')
const client = deepstream('ws://vjiotprofiler.westeurope.cloudapp.azure.com:6020').login()

var record = client.record.getRecord('some-name')
client.event.subscribe('device/connect', eventCallback)

record.subscribe('firstname', function (value) {
    console.log(value);
})

function eventCallback(data) {
    console.log('Device connected:' + data);
}





