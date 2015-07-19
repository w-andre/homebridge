var async = require("async");
var symconGenericLightBulb = require('./SymconGenericLightBulbAccessory.js');

function HomeKitAccessoryLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeKitAccessoryLightBulbAccessory...');
	symconGenericLightBulb.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeKitAccessoryLightBulbAccessory.prototype = Object.create(symconGenericLightBulb.prototype, {

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
	},

	getBrightness : {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetBrightness', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['Brightness', that.instanceId], waterfallCallback);
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

	setBrightness : {
		value: function(value) {
			var method = 'HKA_SetBrightness';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	}
});

HomeKitAccessoryLightBulbAccessory.prototype.constructor = HomeKitAccessoryLightBulbAccessory;

module.exports = HomeKitAccessoryLightBulbAccessory;