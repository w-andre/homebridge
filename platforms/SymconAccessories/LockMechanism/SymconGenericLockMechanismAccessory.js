var types = require("HAP-NodeJS/accessories/types.js");
var symconGeneric = require('../SymconGenericAccessory.js');

function SymconGenericLockMechanismAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	symconGeneric.call(this, log, rpcClientOptions, instanceId, name, instance, instanceConfig);
};

SymconGenericLockMechanismAccessory.prototype = Object.create(symconGeneric.prototype, {

	setTargetLockMechanismState: {
		value: function(value) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getTargetLockMechanismState: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getCurrentLockMechanismState: {
		value: function(callback) {
			this.writeLogEntry('Error: generic method called! Overwrite for specific module!');
		}
	},

	getControlCharacteristics : {
		value: function () {
			var that = this;
			var cTypes = symconGeneric.prototype.getControlCharacteristics.call(this);
			
			this.writeLogEntry('adding control characteristic CURRENT_LOCK_MECHANISM_STATE_CTYPE...');
			this.writeLogEntry('adding control characteristic TARGET_LOCK_MECHANISM_STATE_CTYPE...');
			
			cTypes.push(
				{
					cType: types.CURRENT_LOCK_MECHANISM_STATE_CTYPE,
					onUpdate: function(value) { that.writeLogEntry("onUpdate called for CURRENT_LOCK_MECHANISM_STATE_CTYPE with value: " + value); },
					onRead: function(callback) {
						that.getCurrentLockMechanismState(callback);
					},
					perms: ["pr","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "BlaBla",
					designedMinValue: 0,
					designedMaxValue: 3,
					designedMinStep: 1,
					designedMaxLength: 1
				},
				{
					cType: types.TARGET_LOCK_MECHANISM_STATE_CTYPE,
					onUpdate : function(value) { 
						that.setTargetLockMechanismState(value);
					},
					onRead: function(callback) {
						that.getTargetLockMechanismState(callback);
					},
					perms: ["pr","pw","ev"],
					format: "int",
					initialValue: 0,
					supportEvents: false,
					supportBonjour: false,
					manfDescription: "Target lock mechanism state",
					designedMinValue: 0,
					designedMaxValue: 1,
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
					sType : types.LOCK_MECHANISM_STYPE,
					characteristics : this.getControlCharacteristics()
				}
			];
			this.writeLogEntry("services loaded");
			return services;
		}
	}

});

SymconGenericLockMechanismAccessory.prototype.constructor = SymconGenericLockMechanismAccessory;

module.exports = SymconGenericLockMechanismAccessory;