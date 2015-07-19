var async = require("async");
var symconGenericWindowCovering = require('./SymconGenericWindowCoveringAccessory.js');

function HomeKitAccessoryWindowCoveringAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeKitAccessoryWindowCoveringAccessory...');
	symconGenericWindowCovering.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeKitAccessoryWindowCoveringAccessory.prototype = Object.create(symconGenericWindowCovering.prototype, {

	setTargetLockMechanismState: {
		value: function(value) {
			var method = 'HKA_SetTargetLockMechanismState';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	},

	getTargetLockMechanismState: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetTargetLockMechanismState', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['TargetLockMechanismState', that.instanceId], waterfallCallback);
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

	getCurrentLockMechanismState: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function(waterfallCallback) {
						that.callRpcMethod('HKA_GetCurrentLockMechanismState', [that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['CurrentLockMechanismState', that.instanceId], waterfallCallback);
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

HomeKitAccessoryWindowCoveringAccessory.prototype.constructor = HomeKitAccessoryWindowCoveringAccessory;

module.exports = HomeKitAccessoryWindowCoveringAccessory;