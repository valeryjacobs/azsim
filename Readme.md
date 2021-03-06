
# AZ Sim

This tool can be used to run load tests, demo's and other experiments on several Azure services (IoT Hub, CosmosDB, Web APIs and more to follow). The concept is to run a simulation host (daemon/console/container) in the a runtime environment of choice (local machine, Kubernetes on ACS, Azure Container Instances) and then spin-up simulators in, or under managegement by, that host.

The dashboard lets you configure and spinup simulations that are configuration of potentially large numbers of simulators that combined run a test and afterward are terminated.

For example:
Running AZSim locally on your machine is very easy. You run the *AZSimHostAgent* console app (in the repo). Then you open the *AZSim dashboard* web app. From there you can add simulator instances and configure simulations to run on them.
![alt text](https://github.com/valeryjacobs/azsim/blob/master/docs/images/Dashboard.PNG "AZSim dashboard")

For a local run you will see console apps pop up that represent simulators. 
![alt text](https://github.com/valeryjacobs/azsim/blob/master/docs/images/DeviceSimulator.PNG "AZSim dashboard")

Depending on the type of simulator it is capable of testing a specific Azure service. In the case of Azure IoT Hub it can send static or random values as a JSON payload and emulate firmware updates, reboots etc. When using the CosmosDB simulator you can create large amounts of test data and run automated queries to stress-test the service.

To use the IoT Hub simulator the *DeviceManger* needs to be running (euther as a console app or daemon) to manage the device registry.
![alt text](https://github.com/valeryjacobs/azsim/blob/master/docs/images/DeviceManager.PNG "AZSim dashboard")

## Security
Connecting to the messaging hub (deepstream.io) the server must be configured to either use credentials for client to login or configure a path to a custom API that handles credentials validation and hands out a token for the client to connect to the messaging hub. Simulators don't need to be configured with secrets as they are provisioned through the messaging hun provisioning steps (handing out connection strings etc.)

# Kubernetes hosting
The repo includes yaml scripts for setting up simulators in a Kubernetes cluster. Memory sizes needed vary on the type of simulator and its configuration.

# Azure Container Instances
Using the script in the repo you can also use Azure Container Instances to spin up both a DeviceManager as well as the simulators (.NET of Node based).



