var async = require("async");
var symconGenericThermostat = require('./SymconGenericThermostatAccessory.js');

function HomeKitAccessoryThermostatAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeKitAccessoryThermostatAccessory...');
	symconGenericThermostat.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeKitAccessoryThermostatAccessory.prototype = Object.create(symconGenericThermostat.prototype, {

	getTargetTemperature: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetTargetTemperature', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['TargetTemperature', that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						that.callRpcMethod('GetValueFloat', [res.result], waterfallCallback);
					}
				],
				function(err, res) {
					that.writeLogEntry('Result: ' + JSON.stringify(res));
					callback(res.result);
				}
			);
		}
	},

	setTargetTemperature: {
		value: function(value) {
			var method = 'HKA_SetTargetTemperature';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	},

	getCurrentTemperature: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetCurrentTemperature', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['CurrentTemperature', that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						that.callRpcMethod('GetValueFloat', [res.result], waterfallCallback);
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

HomeKitAccessoryThermostatAccessory.prototype.constructor = HomeKitAccessoryThermostatAccessory;

module.exports = HomeKitAccessoryThermostatAccessory;