var async = require("async");
var symconGenericGarageDoorOpener = require('./SymconGenericGarageDoorOpenerAccessory.js');

function EibShutterGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating EibShutterGarageDoorOpenerAccessory...');
	symconGenericGarageDoorOpener.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

EibShutterGarageDoorOpenerAccessory.prototype = Object.create(symconGenericGarageDoorOpener.prototype, {

	setTargetDoorState: {
		value: function(value) {
			var openDoor = value === 0; // value '0' --> open, value '1' --> close
			var method = "EIB_DriveMove";
			var params = [this.instanceId, !openDoor];
			this.callRpcMethod(method, params);
		}
	},

	getTargetDoorState: {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	},

	getCurrentDoorState: {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	}

});

EibShutterGarageDoorOpenerAccessory.prototype.constructor = EibShutterGarageDoorOpenerAccessory;

module.exports = EibShutterGarageDoorOpenerAccessory;