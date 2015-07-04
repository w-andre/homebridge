var async = require("async");
var symconGenericLightBulb = require('./SymconGenericLightBulbAccessory.js');

function HomeMaticLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating HomeMaticLightBulbAccessory...');
	symconGenericLightBulb.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

HomeMaticLightBulbAccessory.prototype = Object.create(symconGenericLightBulb.prototype, {

	getPowerState : {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	},

	setPowerState : {
		value: function(value) {
			var method = 'HM_WriteValueFloat';
			var params = [this.instanceId, value ? 100 : 0, 0];
			this.callRpcMethod(method, params);
		}
	},

	getBrightness : {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	},

	setBrightness : {
		value: function(value) {
			var method = 'HM_WriteValueFloat';
			var params = [this.instanceId, 'LEVEL', value / 100.0];
			this.callRpcMethod(method, params);
		}
	}
});

HomeMaticLightBulbAccessory.prototype.constructor = HomeMaticLightBulbAccessory;

module.exports = HomeMaticLightBulbAccessory;