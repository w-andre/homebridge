var types = require("../../../lib/HAP-NodeJS/accessories/types.js");
var symconGeneric = require('../SymconGenericAccessory.js');

function SymconGenericGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	symconGeneric.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

SymconGenericGarageDoorOpenerAccessory.prototype = Object.create(symconGeneric.prototype, {

	setTargetDoorState: {
		value: function(value) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getTargetDoorState: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getCurrentDoorState: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getControlCharacteristics : {
		value: function () {
			var that = this;
			var cTypes = symconGeneric.prototype.getControlCharacteristics.call(this);
			
			this.writeLogEntry('adding control characteristic TARGET_DOORSTATE_CTYPE...');
			this.writeLogEntry('adding control characteristic CURRENT_DOOR_STATE_CTYPE...');
			this.writeLogEntry('adding control characteristic OBSTRUCTION_DETECTED_CTYPE...');
			
			cTypes.push(
				{
					cType : types.TARGET_DOORSTATE_CTYPE,
					onUpdate : function(value) { 
						that.setTargetDoorState(value);
					},
					onRead: function(callback) {
						that.getTargetDoorState(callback);
					},
					perms: ["pr","pw","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "Target door state",
					designedMinValue: 0,
					designedMaxValue: 1,
					designedMinStep: 1,
					designedMaxLength: 1
				},
				{
					cType: types.CURRENT_DOOR_STATE_CTYPE,
					onUpdate: function(value) { that.writeLogEntry("onUpdate called for CURRENT_DOOR_STATE_CTYPE with value: " + value); },
					onRead : function(callback) { that.getCurrentDoorState(callback); },
					perms: ["pr","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "Current door state",
					designedMinValue: 0,
					designedMaxValue: 4,
					designedMinStep: 1,
					designedMaxLength: 1    
				},
				{
					cType: types.OBSTRUCTION_DETECTED_CTYPE,
					onUpdate: function(value) { that.writeLogEntry("onUpdate called for OBSTRUCTION_DETECTED_CTYPE with value: " + value); },
					onRead : function(callback) { that.writeLogEntry("onRead called for OBSTRUCTION_DETECTED_CTYPE"); },
					perms: ["pr","ev"],
					format: "bool",
					initialValue: false,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "obstruction detected",
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
					sType : types.GARAGE_DOOR_OPENER_STYPE,
					characteristics : this.getControlCharacteristics()
				}
			];
			this.writeLogEntry("services loaded");
			return services;
		}
	}

});

SymconGenericGarageDoorOpenerAccessory.prototype.constructor = SymconGenericGarageDoorOpenerAccessory;

module.exports = SymconGenericGarageDoorOpenerAccessory;