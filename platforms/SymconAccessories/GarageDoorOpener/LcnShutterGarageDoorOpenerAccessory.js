var async = require("async");
var symconGenericGarageDoorOpener = require('./SymconGenericGarageDoorOpenerAccessory.js');

function LcnShutterGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating LcnShutterGarageDoorOpenerAccessory...');
	symconGenericGarageDoorOpener.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

LcnShutterGarageDoorOpenerAccessory.prototype = Object.create(symconGenericGarageDoorOpener.prototype, {

	setTargetDoorState: {
		value: function(value) {
			var method = openDoor ? "LCN_ShutterMoveUp" : "LCN_ShutterMoveDown";
			var params = [this.instanceId];
			this.callRpcMethod(method, params);
		}
	},

	getTargetDoorState: {
		value: function(callback) {
			var that = this;
			this.getCurrentDoorState(callback);
		}
	},

	getCurrentDoorState: {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function (waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['Action', that.instanceId], waterfallCallback);
					},
					function (res, waterfallCallback) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						that.callRpcMethod('GetValueInteger', [res.result], waterfallCallback);
					}
				],
				function(err, res) {
					that.writeLogEntry('Result: ' + JSON.stringify(res));
					callback(res.result === 0 ? 0 : 1);
				}
			);
		}
	}

});

LcnShutterGarageDoorOpenerAccessory.prototype.constructor = LcnShutterGarageDoorOpenerAccessory;

module.exports = LcnShutterGarageDoorOpenerAccessory;