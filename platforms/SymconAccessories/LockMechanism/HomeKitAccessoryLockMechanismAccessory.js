var async = require("async");
var symconGenericLockMechanism = require('./SymconGenericLockMechanismAccessory.js');

function HomeKitAccessoryLockMechanismAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeKitAccessoryLockMechanismAccessory...');
	symconGenericLockMechanism.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeKitAccessoryLockMechanismAccessory.prototype = Object.create(symconGenericLockMechanism.prototype, {

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

HomeKitAccessoryLockMechanismAccessory.prototype.constructor = HomeKitAccessoryLockMechanismAccessory;

module.exports = HomeKitAccessoryLockMechanismAccessory;