var async = require("async");
var symconGenericSwitch = require('./SymconGenericSwitchAccessory.js');

function EibSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating EibSwitchAccessory...');
	symconGenericSwitch.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

EibSwitchAccessory.prototype = Object.create(symconGenericSwitch.prototype, {

	getPowerState : {
		value: function(callback) {
			var that = this;
			async.waterfall(
				[
					function (waterfallCallback) {
						that.callRpcMethod('IPS_GetObjectIDByIdent', ['Value', that.instanceId], waterfallCallback);
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
			var method = 'EIB_Switch';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	}

});

EibSwitchAccessory.prototype.constructor = EibSwitchAccessory;

module.exports = EibSwitchAccessory;