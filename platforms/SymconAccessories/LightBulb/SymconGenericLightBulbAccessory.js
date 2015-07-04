var types = require("../../../lib/HAP-NodeJS/accessories/types.js");
var symconGeneric = require('../SymconGenericAccessory.js');

function SymconGenericLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	symconGeneric.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

SymconGenericLightBulbAccessory.prototype = Object.create(symconGeneric.prototype, {

	getPowerState : {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	setPowerState : {
		value: function(value) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getBrightness : {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	setBrightness : {
		value: function(value) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getControlCharacteristics : {
		value: function () {
			var that = this;
			var cTypes = symconGeneric.prototype.getControlCharacteristics.call(this);
			
			this.writeLogEntry('adding control characteristic POWER_STATE_CTYPE...');
			this.writeLogEntry('adding control characteristic BRIGHTNESS_CTYPE...');
			cTypes.push(
				{
					cType : types.POWER_STATE_CTYPE,
					onUpdate : function (value) {
						that.setPowerState(value);
					},
					onRead : function (callback) {
						that.getPowerState(callback);
					},
					perms : ["pw", "pr", "ev"],
					format : "bool",
					initialValue : 0,
					supportEvents : false,
					supportBonjour : false,
					manfDescription : "Change the power state",
					designedMaxLength : 1
				},
				{
					cType : types.BRIGHTNESS_CTYPE,
					onUpdate : function (value) {
						that.setBrightness(value);
					},
					onRead : function (callback) {
						that.getBrightness(callback);
					},
					perms : ["pw", "pr", "ev"],
					format : "int",
					initialValue : 0,
					supportEvents : false,
					supportBonjour : false,
					manfDescription : "Adjust Brightness of Light",
					designedMinValue : 0,
					designedMaxValue : 100,
					designedMinStep : 1,
					unit : "%"
				}
			);

			return cTypes;
		}
	},

	getServices : {
		value: function () {
			var services = [{
					sType : types.ACCESSORY_INFORMATION_STYPE,
					characteristics : this.getInformationCharacteristics(),
				}, {
					sType : types.LIGHTBULB_STYPE,
					characteristics : this.getControlCharacteristics()
				}
			];
			this.writeLogEntry("services loaded");
			return services;
		}
	}

});

SymconGenericLightBulbAccessory.prototype.constructor = SymconGenericLightBulbAccessory;

module.exports = SymconGenericLightBulbAccessory;