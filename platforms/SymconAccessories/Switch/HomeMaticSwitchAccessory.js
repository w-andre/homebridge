var async = require("async");
var symconGenericSwitch = require('./SymconGenericSwitchAccessory.js');

function HomeMaticSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeMaticSwitchAccessory...');
	symconGenericSwitch.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeMaticSwitchAccessory.prototype = Object.create(symconGenericSwitch.prototype, {

	getPowerState : {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	},

	setPowerState : {
		value: function(value) {
			var method = 'HM_WriteValueBoolean';
			var params = [this.instanceId, 'STATE', value];
			this.callRpcMethod(method, params);
		}
	}

});

HomeMaticSwitchAccessory.prototype.constructor = HomeMaticSwitchAccessory;

module.exports = HomeMaticSwitchAccessory;