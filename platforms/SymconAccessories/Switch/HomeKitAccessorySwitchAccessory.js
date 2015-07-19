var async = require("async");
var symconGenericSwitch = require('./SymconGenericSwitchAccessory.js');

function HomeKitAccessorySwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeKitAccessorySwitchAccessory...');
	symconGenericSwitch.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeKitAccessorySwitchAccessory.prototype = Object.create(symconGenericSwitch.prototype, {

	getPowerState : {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetPowerState', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['PowerState', that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						that.callRpcMethod('GetValueBoolean', [res.result], waterfallCallback);
					}
				],
				function(err, res) {
					that.writeLogEntry('Result: ' + JSON.stringify(res));
					callback(res.result);
				}
			);
		}
	},

	setPowerState : {
		value: function(value) {
			var method = 'HKA_SetPowerState';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	}

});

HomeKitAccessorySwitchAccessory.prototype.constructor = HomeKitAccessorySwitchAccessory;

module.exports = HomeKitAccessorySwitchAccessory;