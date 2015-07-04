var async = require("async");
var symconGenericLightBulb = require('./SymconGenericLightBulbAccessory.js');

function ZWaveLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	log('creating ZWaveLightBulbAccessory...');
	symconGenericLightBulb.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

ZWaveLightBulbAccessory.prototype = Object.create(symconGenericLightBulb.prototype, {

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
	},

	getBrightness : {
		value: function(callback) {
			var that = this;
			this.writeLogEntry('Error: not implemented!');
		}
	},

	setBrightness : {
		value: function(value) {
			var method = 'ZW_DimSet';
			var params = [this.instanceId, value];
			this.callRpcMethod(method, params);
		}
	}

});

ZWaveLightBulbAccessory.prototype.constructor = ZWaveLightBulbAccessory;

module.exports = ZWaveLightBulbAccessory;