var async = require("async");
var symconGenericGarageDoorOpener = require('./SymconGenericGarageDoorOpenerAccessory.js');

function HomeKitAccessoryGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeKitAccessoryGarageDoorOpenerAccessory...');
	symconGenericGarageDoorOpener.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeKitAccessoryGarageDoorOpenerAccessory.prototype = Object.create(symconGenericGarageDoorOpener.prototype, {

	setTargetDoorState: {
		value: function(value) {
			var method = 'HKA_SetTargetDoorState';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	},

	getTargetDoorState: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetTargetDoorState', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['TargetDoorState', that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						that.callRpcMethod('GetValueInteger', [res.result], waterfallCallback);
					}
				],
				function(err, res) {
					that.writeLogEntry('Result: ' + JSON.stringify(res));
					callback(res.result);
				}
			);
		}
	},

	getCurrentDoorState: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetCurrentDoorState', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['CurrentDoorState', that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						that.callRpcMethod('GetValueInteger', [res.result], waterfallCallback);
					}
				],
				function(err, res) {
					that.writeLogEntry('Result: ' + JSON.stringify(res));
					callback(res.result);
				}
			);
		}
	}

});

HomeKitAccessoryGarageDoorOpenerAccessory.prototype.constructor = HomeKitAccessoryGarageDoorOpenerAccessory;

module.exports = HomeKitAccessoryGarageDoorOpenerAccessory;