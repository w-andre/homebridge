var async = require("async");
var symconGenericLightBulb = require('./SymconGenericLightBulbAccessory.js');

function LcnUnitLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating LcnUnitLightBulbAccessory...');
	symconGenericLightBulb.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
	this.defaultRamp = 3; // default ramp in seconds
};

LcnUnitLightBulbAccessory.prototype = Object.create(symconGenericLightBulb.prototype, {

	getPowerState : {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function (waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['Status', that.instanceId], waterfallCallback);
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
			var method = 'LCN_SetIntensity';
			var params = [this.instanceId, value ? 100 : 0, 0];
			this.callRpcMethod(method, params);
		}
	},

	getBrightness : {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function (waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['Intensity', that.instanceId], waterfallCallback);
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
			var method = 'LCN_SetIntensity';
			var params = [this.instanceId, value, this.defaultRamp];
			this.callRpcMethod(method, params);
		}
	}
});

LcnUnitLightBulbAccessory.prototype.constructor = LcnUnitLightBulbAccessory;

module.exports = LcnUnitLightBulbAccessory;