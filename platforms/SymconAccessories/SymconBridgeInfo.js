var types = require("HAP-NodeJS/accessories/types.js");

function SymconBridgeInfo(log, name) {
	this.log = log;
	this.name = name;
	this.displayName = name + " Bridge";
}

SymconBridgeInfo.prototype = {

	getServices : function () {
		var services =
			[
				{
					sType : types.ACCESSORY_INFORMATION_STYPE,
					characteristics : [
						{
							cType : types.NAME_CTYPE,
							onUpdate : null,
							perms : ["pr"],
							format : "string",
							initialValue : this.displayName,
							supportEvents : false,
							supportBonjour : false,
							manfDescription : "Name of the accessory",
							designedMaxLength : 255
						},
						{
							cType : types.MANUFACTURER_CTYPE,
							onUpdate : null,
							perms : ["pr"],
							format : "string",
							initialValue : "Symcon",
							supportEvents : false,
							supportBonjour : false,
							manfDescription : "Manufacturer",
							designedMaxLength : 255
						},
						{
							cType : types.MODEL_CTYPE,
							onUpdate : null,
							perms : ["pr"],
							format : "string",
							initialValue : this.displayName,
							supportEvents : false,
							supportBonjour : false,
							manfDescription : "Model",
							designedMaxLength : 255
						},
						{
							cType : types.SERIAL_NUMBER_CTYPE,
							onUpdate : null,
							perms : ["pr"],
							format : "string",
							initialValue : "A1S2NASF88EW",
							supportEvents : false,
							supportBonjour : false,
							manfDescription : "SN",
							designedMaxLength : 255
						},
						{
							cType : types.IDENTIFY_CTYPE,
							onUpdate : null,
							perms : ["pw"],
							format : "bool",
							initialValue : false,
							supportEvents : false,
							supportBonjour : false,
							manfDescription : "Identify Accessory",
							designedMaxLength : 1
						}
					]
				}
			];
			this.writeLogEntry("services loaded");
			return services;
		
		return ;
	},

	writeLogEntry: function(message) {
		this.log(this.name + ': ' + message);
	}

};

module.exports = SymconBridgeInfo;