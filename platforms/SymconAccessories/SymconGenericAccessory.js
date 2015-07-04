var types = require("HAP-NodeJS/accessories/types.js");
var rpc = require("node-json-rpc");

function SymconGenericAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	this.log = log;
	this.rpcClientOptions = rpcClientOptions;
	this.instanceId = instanceId;
	this.name = instanceId.toString();
	this.displayName = name + " [" + instanceId + "]";
	this.instance = instance;
	this.instanceConfig = instanceConfig;
}

SymconGenericAccessory.prototype = {

	callRpcMethod : function(method, params, callback) {
		this.writeLogEntry("Calling JSON-RPC method " + method + " with params " + JSON.stringify(params));

		var that = this;
		var client = new rpc.Client(this.rpcClientOptions);
		client.call(
			{"jsonrpc" : "2.0", "method" : method, "params" : params, "id" : 0},
			function (err, res) {
				if (err) {
					that.writeLogEntry("[" + method + "] Error: " + JSON.stringify(err));
					if (callback) callback(res);
					return;
				} else if (res.error) {
					that.writeLogEntry("[" + method + "] Error: " + JSON.stringify(res.error));
					if (callback) callback(res);
					return;
				}
				
				that.writeLogEntry("Called JSON-RPC method '" + method + "' with response: " + JSON.stringify(res.result));
				if (callback) {
					that.writeLogEntry('callback...');
					callback(err, res);
				}
			}
		);
	},

	getInformationCharacteristics : function () {
		var that = this;
		
		return [{
				cType : types.NAME_CTYPE,
				onUpdate : function(value) { that.writeLogEntry("onUpdate called with value: " + value); },
				perms : ["pr"],
				format : "string",
				initialValue : this.displayName,
				supportEvents : false,
				supportBonjour : false,
				manfDescription : "Name of the accessory",
				designedMaxLength : 255
			}, {
				cType : types.MANUFACTURER_CTYPE,
				onUpdate : function(value) { that.writeLogEntry("onUpdate called with value: " + value); },
				perms : ["pr"],
				format : "string",
				initialValue : "Symcon",
				supportEvents : false,
				supportBonjour : false,
				manfDescription : "Manufacturer",
				designedMaxLength : 255
			}, {
				cType : types.MODEL_CTYPE,
				onUpdate : function(value) { that.writeLogEntry("onUpdate called with value: " + value); },
				perms : ["pr"],
				format : "string",
				initialValue : this.instance.ModuleInfo.ModuleName,
				supportEvents : false,
				supportBonjour : false,
				manfDescription : "Model",
				designedMaxLength : 255
			}, {
				cType : types.SERIAL_NUMBER_CTYPE,
				onUpdate : function(value) { that.writeLogEntry("onUpdate called with value: " + value); },
				perms : ["pr"],
				format : "string",
				initialValue : "A1S2NASF88EW",
				supportEvents : false,
				supportBonjour : false,
				manfDescription : "SN",
				designedMaxLength : 255
			}, {
				cType : types.IDENTIFY_CTYPE,
				onUpdate : function (value) {
					that.writeLogEntry("informationCharacteristics IDENTIFY_CTYPE onUpdate called with value " + value);
				},
				perms : ["pw"],
				format : "bool",
				initialValue : false,
				supportEvents : false,
				supportBonjour : false,
				manfDescription : "Identify Accessory",
				designedMaxLength : 1
			}
		]
	},

	getControlCharacteristics : function () {
		var that = this;
		
		var cTypes = [{
				cType : types.NAME_CTYPE,
				onUpdate : function(value) { that.writeLogEntry("onUpdate called with value: " + value); },
				perms : ["pr"],
				format : "string",
				initialValue : this.displayName,
				supportEvents : false,
				supportBonjour : false,
				manfDescription : "Name of service",
				designedMaxLength : 255
			}
		];
		
		return cTypes;
	},

	writeLogEntry: function(message) {
		this.log(this.name + ': ' + message);
	}

};

module.exports = SymconGenericAccessory;