var async = require("async");
var symconGenericThermostat = require('./SymconGenericThermostatAccessory.js');

function ZWaveThermostatAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating ZWaveThermostatAccessory...');
	symconGenericThermostat.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

ZWaveThermostatAccessory.prototype = Object.create(symconGenericThermostat.prototype, {

	getTargetTemperature: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function (waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['ThermostatSetPoint1', that.instanceId], waterfallCallback);
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
			var method = 'ZW_ThermostatSetPointSet';
			var params = [this.instanceId, 1 /* Heating */, value];
			this.callRpcMethod(method, params);
		}
	},

	getCurrentTemperature: {
		value: function(callback) {
			var that = this;
			this.getTargetTemperature(callback);
		}
	}

});

ZWaveThermostatAccessory.prototype.constructor = ZWaveThermostatAccessory;

module.exports = ZWaveThermostatAccessory;