var async = require("async");
var symconGenericSwitch = require('./SymconGenericSwitchAccessory.js');

function ZWaveSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating ZWaveSwitchAccessory...');
	symconGenericSwitch.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

ZWaveSwitchAccessory.prototype = Object.create(symconGenericSwitch.prototype, {

	getPowerState : {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	},

	setPowerState : {
		value: function(value) {
			var method = 'ZW_SwitchMode';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	}

});

ZWaveSwitchAccessory.prototype.constructor = ZWaveSwitchAccessory;

module.exports = ZWaveSwitchAccessory;