ds = deepstream('ws://' + getParameterByName('AZSIM_ComHub_IP') + ':6020');

koTools = new KoTools(ko);

ds.login({ username: 'simulator-instance-' + ds.getUid() }, function () {
    ko.applyBindings(new AppViewModel());
});

var iothubClientSimulatorPresets = {};
$.getJSON('./presets/iothubclientsimulator.json', function (data) {
    iothubClientSimulatorPresets = data;
});


function setupChart() {
    $("#morris-area-chart").empty();

    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            timeStamp: '2012-02-24 15:00:00',
            noNodes: 6,
            noSimulators: 12000,
            noMessages: 23465978
        }, {
            timeStamp: '2012-02-24 15:00:10',
            noNodes: 6,
            noSimulators: 12003,
            noMessages: 23665978
        },
        {
            timeStamp: '2012-02-24 15:00:20',
            noNodes: 7,
            noSimulators: 15503,
            noMessages: 25665978
        }],
        xkey: 'timeStamp',
        ykeys: ['noNodes', 'noSimulators', 'noMessages'],
        labels: ['noNodes', 'noSimulators', 'noMessages'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });
}

$('#listtable').on('click', '.clickable-row', function (event) {
    $(this).addClass('active').siblings().removeClass('active');
});

AppViewModel = function () {

    this.users = koTools.getViewList(UserListEntryViewModel, ds.record.getList('users'));
    this.simulations = koTools.getViewList(SimulationListEntryViewModel, ds.record.getList('simulations'));
    this.simulators = koTools.getViewList(SimulatorListEntryViewModel, ds.record.getList('simulators'));
    this.simulatorHosts = koTools.getViewList(SimulatorHostListEntryViewModel, ds.record.getList('simulatorhosts'));

    this.user = new UserViewModel();
    this.simulation = new SimulationViewModel();
    this.simulator = new SimulatorViewModel();
    this.simulatorHost = new SimulatorHostViewModel();
    this.node = new NodeViewModel();
    this.status = new StatusViewModel();


    this.noSimulations = ko.computed(function () {
        var mlist = ds.record.getList('simulations');
        var entr = mlist.getEntries();

        return entr.length;
    }); 
    
   
};

AppViewModel.prototype.loadPreset = function () {
    var json = JSON.stringify(this.simulation.selectedPreset());
    presetObj = JSON.parse(json);

    var cJSON = JSON.stringify(presetObj.configuration);
    var pJSON = presetObj.payloadTemplate;

    this.simulation.record.set('configuration',cJSON);
};

AppViewModel.prototype.addSimulation = function () {
 
    selectMainDiv('mainDivSimulation');
    var name = 'simulation-' + ds.getUid(),
        record = ds.record.getRecord(name);

    record.set({simulationId:name, configuration: 'testconfig', payload: 'payloadtemplate1',status:'-',startTime:'now', endTime:'later'});
    this.simulations.getList().addEntry(name);

    this.simulation.record.setName(name);

};

AppViewModel.prototype.startSimulator = function () {
    const list = ds.record.getList('simulators');
    var entries = list.getEntries();

    if (entries.length > 0) {
        ds.rpc.make(list.getEntries()[entries.length - 1], { frequency: 4, payloadSize: 10 }, (error, result) => {
            // error = null, result = 11
        });
    }
};

AppViewModel.prototype.startSimulatorHostProcess = function () {
    const list = ds.record.getList('simulatorhosts');
    var entries = list.getEntries();

    if (entries.length > 0) {
        ds.rpc.make(list.getEntries()[entries.length - 1], { command: 'runProcess', commandParams: { path: 'node', processParams: 'index.js' } }, (error, result) => {
            // error = null, result = 11
        });
    }
};

AppViewModel.prototype.addUser = function () {
    var name = 'users/' + ds.getUid(),
        record = ds.record.getRecord(name);

    record.set({ firstname: 'Admin', lastname: 'Admin', role: '-' });
    this.users.getList().addEntry(name);
};

//AppViewModel.prototype.selectUser = function (userAppViewModel) {
//    this.user.record.setName(userAppViewModel.record.name);
//    this.users.callOnEntries('isActive', [false]);
//    userAppViewModel.isActive(true);

//};

AppViewModel.prototype.selectSimulation = function (simulationAppViewModel) {
    this.simulation.record.setName(simulationAppViewModel.record.name);
    this.users.callOnEntries('isActive', [false]);
    simulationAppViewModel.isActive(true);


    selectMainDiv('mainDivSimulation');
    //setupChart();
};

AppViewModel.prototype.selectSimulator = function (simulatorAppViewModel) {
    this.simulator.record.setName(simulatorAppViewModel.record.name);
    this.users.callOnEntries('isActive', [false]);
    simulatorAppViewModel.isActive(true);

};

AppViewModel.prototype.selectSimulatorHost = function (simulatorHostAppViewModel) {
    this.simulatorHost.record.setName(simulatorHostAppViewModel.record.name);
    this.users.callOnEntries('isActive', [false]);
    simulatorHostAppViewModel.isActive(true);

};


StatusViewModel = function () {
    this.message = ko.observable("Ready");
    

};
UserListEntryViewModel = function (userRecordName, viewList) {
    this.record = ds.record.getRecord(userRecordName);
    this.viewList = viewList;
    this.firstname = koTools.getObservable(this.record, 'firstname');
    this.lastname = koTools.getObservable(this.record, 'lastname');
    this.role = koTools.getObservable(this.record, 'role');
    this.isActive = ko.observable(false);
};

SimulationListEntryViewModel = function (simulationRecordId, viewList) {
    this.record = ds.record.getRecord(simulationRecordId);
    this.viewList = viewList;
    this.name = koTools.getObservable(this.record, 'name');
    this.simulationId = koTools.getObservable(this.record, 'simulationId');
    this.startTime = koTools.getObservable(this.record, 'startTimeStamp');
    this.endTime = koTools.getObservable(this.record, 'endTimeStamp');
    this.status = koTools.getObservable(this.record, 'status');
    this.selectedPreset = ko.observable();

    this.isActive = ko.observable(false);
};

SimulatorListEntryViewModel = function (simulatorRecordId, viewList) {
    this.record = ds.record.getRecord(simulatorRecordId);
    this.viewList = viewList;
    this.simulatorId = koTools.getObservable(this.record, 'simulatorId');
    this.runtime = koTools.getObservable(this.record, 'runtime');
    this.status = koTools.getObservable(this.record, 'status');
    this.frequency = koTools.getObservable(this.record, 'frequency');
    this.payload = koTools.getObservable(this.record, 'payload');
    this.primaryKey = koTools.getObservable(this.record, 'primaryKey');
    this.iotHubNamespace = koTools.getObservable(this.record, 'iotHubNamespace');
    this.deviceTwin = koTools.getObservable(this.record, 'deviceTwin');

    this.isActive = ko.observable(false);
};

SimulatorHostListEntryViewModel = function (simulatorHostRecordId, viewList) {
    this.record = ds.record.getRecord(simulatorHostRecordId);
    this.viewList = viewList;
    this.simulatorHostId = koTools.getObservable(this.record, 'simulatorHostId');
    this.runtime = koTools.getObservable(this.record, 'runtime');
    this.status = koTools.getObservable(this.record, 'status');

    this.isActive = ko.observable(false);
};

UserListEntryViewModel.prototype.deleteUser = function (viewModel, event) {
    event.stopPropagation();
    this.viewList.getList().removeEntry(this.record.name);
    this.record.delete();
};

SimulationListEntryViewModel.prototype.deleteSimulation = function (viewModel, event) {
    event.stopPropagation();
    this.viewList.getList().removeEntry(this.record.name);
    this.record.delete();
};

SimulatorListEntryViewModel.prototype.testSimulator = function (viewModel, event) {
    event.stopPropagation();
    console.log('Test: ' + this.record.name);

    ds.rpc.make(this.record.name, { action: 'test' }, (error, result) => { });
};

SimulatorListEntryViewModel.prototype.startSimulator = function (viewModel, event) {
    event.stopPropagation();
    console.log('Start: ' + this.record.name);
    ds.rpc.make(this.record.name, { action: 'start' }, (error, result) => { });
};

SimulatorListEntryViewModel.prototype.updateTwin = function (viewModel, event) {
    event.stopPropagation();
    console.log('Update twin: ' + this.record.name);
    ds.rpc.make('devicemanager', { action: 'updateTwin', deviceId: this.record.name, deviceTwin: this.record.get('deviceTwin') }, (error, result) => { });
};

SimulatorListEntryViewModel.prototype.stopSimulator = function (viewModel, event) {
    event.stopPropagation();
    console.log('Stop: ' + this.record.name);
    ds.rpc.make(this.record.name, { action: 'stop' }, (error, result) => { });
};

SimulatorListEntryViewModel.prototype.deleteSimulator = function (viewModel, event) {
    event.stopPropagation();
    console.log('Delete: ' + this.record.name);
    this.viewList.getList().removeEntry(this.record.name);
    this.record.delete();

    ds.rpc.make(this.record.name, { action: 'delete' }, (error, result) => {
        if (result) {
            console.log('Delete finalized.'.red);

        }
        if (error) {
            console.log('Delete failed: ' + error);
        }
    });
};

SimulationListEntryViewModel.prototype.deleteSimulation = function (viewModel, event) {
    event.stopPropagation();
    console.log('Delete: ' + this.record.name);
    this.viewList.getList().removeEntry(this.record.name);
    this.record.delete();
};

SimulatorListEntryViewModel.prototype.rebootSimulator = function (viewModel, event) {
    event.stopPropagation();
    console.log('Reboot: ' + this.record.name);


    ds.rpc.make('devicemanager', { action: 'reboot', deviceId: this.record.name }, (error, result) => {
        if (result) {
            console.log('Delete finalized.'.red);

        }
        if (error) {
            console.log('Delete failed: ' + error);
        }
    });
};

SimulatorListEntryViewModel.prototype.provisionDevice = function (viewModel, event) {
    event.stopPropagation();
    console.log('Provision: ' + this.record.name);

    ds.rpc.make('devicemanager', { action: 'provision', deviceId: this.record.name }, (error, result) => {
        if (result) {
            console.log('Provisioning finalized.'.red);

        }
        if (error) {
            console.log('Provisioning failed: ' + error);
        }
    });
};

SimulatorHostListEntryViewModel.prototype.runProcess = function (viewModel, event) {
    event.stopPropagation();
    console.log('Start process on sim host: ' + this.record.name);

    ds.rpc.make(this.record.name, { command: "runNodeApp", commandParams: "C:\\Code\\azsim\\AZSim\\AZSimAgentJS\\app.js" }, (error, result) => {
        if (result) {
            console.log('Process run.'.red);

        }
        if (error) {
            console.log('Provisioning failed: ' + error);
        }
    });
};

SimulatorHostListEntryViewModel.prototype.deleteSimulatorHost = function (viewModel, event) {
    event.stopPropagation();
    console.log('Delete sim host: ' + this.record.name);

    this.viewList.getList().removeEntry(this.record.name);
    this.record.delete();
};

/**
 * Class UserViewModel
 */
SimulationViewModel = function () {
    this.record = ds.record.getAnonymousRecord();
    this.simulationId = koTools.getObservable(this.record, 'simulationId');
    this.name = koTools.getObservable(this.record, 'name');
    this.startTimeStamp = koTools.getObservable(this.record, 'startTimeStamp');
    this.endTimeStamp = koTools.getObservable(this.record, 'endTimeStamp');
    this.noSimulators = koTools.getObservable(this.record, 'noSimulators');
    this.payload = koTools.getObservable(this.record, 'payload');
    this.configuration = koTools.getObservable(this.record, 'configuration');
    this.presets = iothubClientSimulatorPresets.presets;
    this.selectedPreset = ko.observable();

 
    //this.configuration = ko.computed({
    //    read: function () {
    //        $('#presetInputWarning').hide();

    //        if (this.configuration() === undefined) {
    //            return "error";
    //        }
    //        else {
    //            var json = JSON.stringify(this.simulation.selectedPreset());//.replace(/\\/g, "");

    //            configobj = JSON.parse(json).configuration;
    //            return JSON.stringify(configobj);

    //        }
    //    },
    //    write: function (value) {
    //        var json = JSON.stringify(this.simulation.selectedPreset());
    //        presetobj = JSON.parse(json);
    //        try {
    //            presetobj.configuration = JSON.parse(value);
    //        }
    //        catch (ex) {
    //            $('#presetInputWarning').show();
    //            return;
    //        }

    //        $('#presetInputWarning').hide();

    //        this.simulation.selectedPreset(presetobj);
    //    },
    //    owner: this
    //});
};


SimulatorViewModel = function () {
    this.record = ds.record.getAnonymousRecord();
    this.simulatorId = koTools.getObservable(this.record, 'simulatorId');
    this.type = koTools.getObservable(this.record, 'type');
    this.status = koTools.getObservable(this.record, 'status');
    this.frequency = koTools.getObservable(this.record, 'frequency');
    this.primaryKey = koTools.getObservable(this.record, 'primaryKey');
    this.iotHubNamespace = koTools.getObservable(this.record, 'iotHubNamespace');
    this.payload = koTools.getObservable(this.record, 'payload');
    this.deviceTwin = koTools.getObservable(this.record, 'deviceTwin');
};

SimulatorHostViewModel = function () {
    this.record = ds.record.getAnonymousRecord();
    this.simulatorHostId = koTools.getObservable(this.record, 'simulatorHostId');
    this.status = koTools.getObservable(this.record, 'status');
    this.runtime = koTools.getObservable(this.record, 'runtime');
};

UserViewModel = function () {
    this.record = ds.record.getAnonymousRecord();
    this.firstname = koTools.getObservable(this.record, 'firstname');
    this.lastname = koTools.getObservable(this.record, 'lastname');
    this.role = koTools.getObservable(this.record, 'role');
};

NodeViewModel = function () {
    this.record = ds.record.getAnonymousRecord();
    this.id = koTools.getObservable(this.record, 'id');
    this.memUsed = koTools.getObservable(this.record, 'memUsed');
    this.memLeft = koTools.getObservable(this.record, 'memLeft');
    this.noSimulators = koTools.getObservable(this.record, 'noSimulators');
};

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}