var types = require("HAP-NodeJS/accessories/types.js");
var symconGeneric = require('../SymconGenericAccessory.js');

function SymconGenericThermostatAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	symconGeneric.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

SymconGenericThermostatAccessory.prototype = Object.create(symconGeneric.prototype, {

	getTargetTemperature: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	setTargetTemperature: {
		value: function(value) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getCurrentTemperature: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getControlCharacteristics : {
		value: function () {
			var that = this;
			var cTypes = symconGeneric.prototype.getControlCharacteristics.call(this);
			
			this.writeLogEntry('adding control characteristic CURRENTHEATINGCOOLING_CTYPE...');
			this.writeLogEntry('adding control characteristic TARGETHEATINGCOOLING_CTYPE...');
			this.writeLogEntry('adding control characteristic TARGET_TEMPERATURE_CTYPE...');
			this.writeLogEntry('adding control characteristic CURRENT_TEMPERATURE_CTYPE...');
			this.writeLogEntry('adding control characteristic TEMPERATURE_UNITS_CTYPE...');
			
			cTypes.push(
				{
					cType : types.CURRENTHEATINGCOOLING_CTYPE,
					onUpdate : function(value) { that.writeLogEntry("update current heating/cooling type to: " + value); },
					onRead : function(callback) { that.writeLogEntry("onRead called for CURRENTHEATINGCOOLING_CTYPE"); },
					perms : ["pr","ev"],
					format : "int",
					initialValue : 1, // Unit is set to heating.
					supportEvents : false,
					supportBonjour : false,
					manfDescription : "Current Mode",
					designedMaxLength : 1,
					designedMinValue : 0,
					designedMaxValue : 2,
					designedMinStep : 1,    
				},
				{
					cType : types.TARGETHEATINGCOOLING_CTYPE,
					onUpdate : function(value) { that.writeLogEntry("update target heating/cooling type to: " + value); },
					onRead : function(callback) { that.writeLogEntry("onRead called for TARGETHEATINGCOOLING_CTYPE"); },
					perms : ["pw","pr","ev"],
					format : "int",
					initialValue : 1, // Unit is set to heating.
					supportEvents : false,
					supportBonjour : false,
					manfDescription : "Target Mode",
					designedMinValue : 0,
					designedMaxValue : 3,
					designedMinStep : 1,
				},
				{
					cType : types.TARGET_TEMPERATURE_CTYPE,
					onUpdate : function(value) {
						that.setTargetTemperature(value);
					},
					onRead : function(callback) {
						that.getTargetTemperature(callback);
					},
					perms : ["pw","pr","ev"],
					format : "int",
					initialValue : 0,
					supportEvents : false,
					supportBonjour : false,
					manfDescription : "Target Temperature",
					designedMinValue : 0,
					designedMaxValue : 38,
					designedMinStep : 1,
					unit : "celsius"
				},
				{
					cType: types.CURRENT_TEMPERATURE_CTYPE,
					onUpdate: function(value) { that.writeLogEntry("update current temperature to: " + value); },
					onRead : function(callback) {
						that.getCurrentTemperature(callback);
					},
					perms: ["pr","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "Current Temperature",
					unit: "celsius"
				},
				{
					cType: types.TEMPERATURE_UNITS_CTYPE,
					onUpdate: function(value) { that.writeLogEntry("update temperature unit to: " + value); },
					onRead : function(callback) { that.writeLogEntry("onRead called for TEMPERATURE_UNITS_CTYPE"); },
					perms: ["pr","ev"],
					format: "int",
					initialValue: 0, // 0: celsius
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "Unit",
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
					sType : types.THERMOSTAT_STYPE,
					characteristics : this.getControlCharacteristics()
				}
			];
			this.writeLogEntry("services loaded");
			return services;
		}
	}

});

SymconGenericThermostatAccessory.prototype.constructor = SymconGenericThermostatAccessory;

module.exports = SymconGenericThermostatAccessory;