var async = require("async");
var symconGenericSwitch = require('./SymconGenericSwitchAccessory.js');

function LcnUnitSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating LcnUnitSwitchAccessory...');
	symconGenericSwitch.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

LcnUnitSwitchAccessory.prototype = Object.create(symconGenericSwitch.prototype, {

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
			var method = 'LCN_SwitchRelay';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	}

});

LcnUnitSwitchAccessory.prototype.constructor = LcnUnitSwitchAccessory;

module.exports = LcnUnitSwitchAccessory;