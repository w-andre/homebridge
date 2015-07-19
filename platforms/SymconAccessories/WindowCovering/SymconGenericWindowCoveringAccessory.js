var types = require("HAP-NodeJS/accessories/types.js");
var symconGeneric = require('../SymconGenericAccessory.js');

function SymconGenericWindowCoveringAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	symconGeneric.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

SymconGenericWindowCoveringAccessory.prototype = Object.create(symconGeneric.prototype, {

	setWindowCoveringTargetPosition: {
		value: function(value) {
			this.writeLogEntry('Error: generic method "setWindowCoveringTargetPosition" called! Overwrite for specific module! Value: ' + value);
		}
	},

	getWindowCoveringTargetPosition: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method "getWindowCoveringTargetPosition" called! Overwrite for specific module!');
		}
	},
	
	setWindowCoveringOperationState: {
		value: function(value) {
			this.writeLogEntry('Error: generic method "setWindowCoveringOperationState" called! Overwrite for specific module! Value: ' + value);
		}
	},

	getWindowCoveringOperationState: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method "getWindowCoveringOperationState" called! Overwrite for specific module!');
		}
	},

	getWindowCoveringCurrentPosition: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method "getWindowCoveringCurrentPosition" called! Overwrite for specific module!');
		}
	},

	getControlCharacteristics : {
		value: function () {
			var that = this;
			var cTypes = symconGeneric.prototype.getControlCharacteristics.call(this);
			
			this.writeLogEntry('adding control characteristic WINDOW_COVERING_TARGET_POSITION_CTYPE...');
			this.writeLogEntry('adding control characteristic WINDOW_COVERING_CURRENT_POSITION_CTYPE...');
			this.writeLogEntry('adding control characteristic WINDOW_COVERING_OPERATION_STATE_CTYPE...');
			
			cTypes.push(
				{
					cType: types.WINDOW_COVERING_CURRENT_POSITION_CTYPE,
					onUpdate: function(value) { that.writeLogEntry("onUpdate called for WINDOW_COVERING_CURRENT_POSITION_CTYPE with value: " + value); },
					onRead: function(callback) {
						that.getWindowCoveringCurrentPosition(callback);
					},
					perms: ["pr","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "current window covering position",
					designedMinValue: 0,
					designedMaxValue: 9,
					designedMinStep: 1,
					designedMaxLength: 1
				},
				{
					cType: types.WINDOW_COVERING_TARGET_POSITION_CTYPE,
					onUpdate : function(value) { 
						that.setWindowCoveringTargetPosition(value);
					},
					onRead: function(callback) {
						that.getWindowCoveringTargetPosition(callback);
					},
					perms: ["pr","pw","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "Target window covering position",
					designedMinValue: 0,
					designedMaxValue: 9,
					designedMinStep: 1,
					designedMaxLength: 1
				},
				{
					cType: types.WINDOW_COVERING_OPERATION_STATE_CTYPE,
					onUpdate : function(value) { 
						that.setWindowCoveringOperationState(value);
					},
					onRead: function(callback) {
						that.getWindowCoveringOperationState(callback);
					},
					perms: ["pr","pw","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "window covering operation state",
					designedMinValue: 0,
					designedMaxValue: 9,
					designedMinStep: 1,
					designedMaxLength: 1
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
					sType : types.WINDOW_COVERING_STYPE,
					characteristics : this.getControlCharacteristics()
				}
			];
			this.writeLogEntry("services loaded");
			return services;
		}
	}

});

SymconGenericWindowCoveringAccessory.prototype.constructor = SymconGenericWindowCoveringAccessory;

module.exports = SymconGenericWindowCoveringAccessory;