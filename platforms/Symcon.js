// IP-Symcon JSON-RPC API
var types = require("../lib/HAP-NodeJS/accessories/types.js");
var rpc = require("node-json-rpc");
var async = require("async");

function SymconPlatform(log, options) {
	this.log = log;
	this.options = options;
	this.client = new rpc.Client(this.options.rpcClientOptions);
}

SymconPlatform.prototype = {
	accessories : function (callback) {
		this.log("Fetching Symcon instances...");

		var that = this;
		var foundAccessories = [];

		async.waterfall(
			[
				function (waterfallCallback) {
					that.client.call(
						{"jsonrpc" : "2.0", "method" : "IPS_GetInstanceList", "params" : [], "id" : 0},
						function (err, res) {
							waterfallCallback(null, err, res);
						}
					);
				},
				function (err, res, waterfallCallback) {
					if (err) {
						that.log("Error: " + JSON.stringify(err));
						return;
					}
					
					async.each(
						res.result,
						function (instanceId, eachCallback) {
							async.parallel(
								[
									function (parallelCallback) {
										that.client.call(
											{"jsonrpc" : "2.0", "method" : "IPS_GetName", "params" : [instanceId], "id" : 0},
											function (err, res) {
												parallelCallback(null, res.result);
											}
										);
									},
									function (parallelCallback) {
										that.client.call(
											{"jsonrpc" : "2.0", "method" : "IPS_GetInstance", "params" : [instanceId], "id" : 0},
											function (err, res) {
												parallelCallback(null, res.result);
											}
										);
									},
									function (parallelCallback) {
										that.client.call(
											{"jsonrpc" : "2.0", "method" : "IPS_GetConfiguration", "params" : [instanceId], "id" : 0},
											function (err, res) {
												parallelCallback(null, res.result);
											}
										);
									}
								],
								function (err, results) {
									var name = results[0];
									var instance = typeof results[1] === 'object' ? results[1] : JSON.parse(results[1]);
									var instanceConfig;
									
									if (results[2] === undefined)
										instanceConfig = [];
									else if (typeof results[2] === 'object')
										instanceConfig = results[2];
									else
										instanceConfig = JSON.parse(results[2]);
									
									var instance = new SymconAccessory(that.log, that.options.rpcClientOptions, instanceId, name, instance, instanceConfig);
									
									if (instance.commands.length > 0 && instance.sType !== undefined) {
										foundAccessories.push(instance);
										that.log("new instance found: " + results[0]);
									}
									
									eachCallback();
								}
							);
						},
						function (err) {
							waterfallCallback(null);
						}
					);
				}
			],
			function (err, result) {
				that.log(foundAccessories.length + " instances found");
				callback(foundAccessories);
			}
		);
	}
}

function SymconAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
	this.log = log;
	this.rpcClientOptions = rpcClientOptions;
	this.instanceId = instanceId;
	this.name = instanceId.toString();
	this.displayName = name + " [" + instanceId + "]";
	this.instance = instance;
	this.instanceConfig = instanceConfig;
	this.defaultRamp = 3; // default ramp in seconds
	this.commands = [];
	
	switch (this.instance.ModuleInfo.ModuleID) {
		case '{2D871359-14D8-493F-9B01-26432E3A710F}': // LCN Unit
			this.writeLogEntry('adding commands for LCN Unit (Type: ' + this.instanceConfig.Unit + ')...');
			switch (this.instanceConfig.Unit) {
				case 0: // output
					this.sType = types.LIGHTBULB_STYPE;
					this.commands.push('SetBrightness');
					this.commands.push('SetPowerState');
					break;
				case 2: // relay
					this.sType = types.SWITCH_STYPE;
					this.commands.push('SetPowerState');
					break;
			}
			break;
		case '{C81E019F-6341-4748-8644-1C29D99B813E}': // LCN Shutter
			this.writeLogEntry('adding commands for LCN Shutter...');
			this.sType = types.GARAGE_DOOR_OPENER_STYPE;
			this.commands.push('SetTargetDoorState');
			this.commands.push('GetCurrentDoorState');
			this.commands.push('GetObstructionDetected');
			break;
		case '{D62B95D3-0C5E-406E-B1D9-8D102E50F64B}': // EIB Group
			switch(this.instanceConfig.GroupFunction) {
				case 'Switch':
					this.sType = types.SWITCH_STYPE;
					this.commands.push('SetPowerState');
					break;
			}
			break;
		case '{24A9D68D-7B98-4D74-9BAE-3645D435A9EF}': // EIB Shutter
			this.writeLogEntry('adding commands for EIB Shutter...');
			this.sType = types.GARAGE_DOOR_OPENER_STYPE;
			this.commands.push('SetTargetDoorState');
			this.commands.push('GetCurrentDoorState');
			this.commands.push('GetObstructionDetected');
			break;
		case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
			if (this.instanceConfig.NodeClasses.indexOf(67) != -1) { // THERMOSTAT_SETPOINT
				this.writeLogEntry('adding commands for Z-Wave Thermostat...');
				this.sType = types.THERMOSTAT_STYPE;
				this.commands.push('SetTargetTemperature');
				this.commands.push('GetCurrentTemperature');
				this.commands.push('GetCurrentHeatingCoolingType');
				this.commands.push('SetTargetHeatingCoolingType');
			} else if (this.instanceConfig.NodeClasses.indexOf(38) != -1) { // SWITCH_MULTILEVEL
				this.writeLogEntry('adding commands for Z-Wave multi-level switch...');
				this.sType = types.LIGHTBULB_STYPE;
				this.commands.push('SetBrightness');
				this.commands.push('SetPowerState');
			} else if (this.instanceConfig.NodeClasses.indexOf(37) != -1) { // SWITCH_BINARY
				this.writeLogEntry('adding commands for Z-Wave binary switch...');
				this.sType = types.SWITCH_STYPE;
				this.commands.push('SetPowerState');
			}
			break;
	}
}

SymconAccessory.prototype = {

	getPowerState : function(callback) {
		var that = this;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{2D871359-14D8-493F-9B01-26432E3A710F}': // LCN Unit
				switch (this.instanceConfig.Unit) {
					case 0: // output
					case 2: // relay
						async.waterfall(
							[
								function (waterfallCallback) {
									that.callRpcMethod('IPS_GetObjectIDByIdent', ['Status', that.instanceId], waterfallCallback);
								},
								function (res, waterfallCallback) {
									that.writeLogEntry('Result: ' + JSON.stringify(res));
									that.callRpcMethod('GetValueBoolean', [res.result], waterfallCallback);
								}
							],
							function(err, res) {
								that.writeLogEntry('Result: ' + JSON.stringify(res));
								callback(res.result);
							}
						);
						break;
					default:
						return;
				}
				break;
			case '{D62B95D3-0C5E-406E-B1D9-8D102E50F64B}': // EIB Group
				switch(this.instanceConfig.GroupFunction) {
					case 'Switch':
						async.waterfall(
							[
								function (waterfallCallback) {
									that.callRpcMethod('IPS_GetObjectIDByIdent', ['Value', that.instanceId], waterfallCallback);
								},
								function (res, waterfallCallback) {
									that.writeLogEntry('Result: ' + JSON.stringify(res));
									that.callRpcMethod('GetValueBoolean', [res.result], waterfallCallback);
								}
							],
							function(err, res) {
								that.writeLogEntry('Result: ' + JSON.stringify(res));
								callback(res.result);
							}
						);
						break;
				}
				break;
			default:
				return;
		}
	},

	setPowerState : function(value) {
		
		var method;
		var params;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{2D871359-14D8-493F-9B01-26432E3A710F}': // LCN Unit
				switch (this.instanceConfig.Unit) {
					case 0: // output
						method = 'LCN_SetIntensity';
						params = [this.instanceId, value ? 100 : 0, 0];
						break;
					case 2: // relay
						method = 'LCN_SwitchRelay';
						params = [this.instanceId, value];
						break;
					default:
						return;
				}
				break;
			case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
				method = 'ZW_SwitchMode';
				params = [this.instanceId, value];
				break;
			case '{D62B95D3-0C5E-406E-B1D9-8D102E50F64B}': // EIB Group
				switch(this.instanceConfig.GroupFunction) {
					case 'Switch':
						method = 'EIB_Switch';
                        params = [this.instanceId, value];
						break;
				}
				break;
			default:
				return;
		}
		
		this.callRpcMethod(method, params);
	},

	getBrightness : function(callback) {
		var that = this;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{2D871359-14D8-493F-9B01-26432E3A710F}': // LCN Unit
				switch (this.instanceConfig.Unit) {
					case 0: // output
						async.waterfall(
							[
								function (waterfallCallback) {
									that.callRpcMethod('IPS_GetObjectIDByIdent', ['Intensity', that.instanceId], waterfallCallback);
								},
								function (res, waterfallCallback) {
									that.writeLogEntry('Result: ' + JSON.stringify(res));
									that.callRpcMethod('GetValueInteger', [res.result], waterfallCallback);
								}
							],
							function(err, res) {
								that.writeLogEntry('Result: ' + JSON.stringify(res));
								callback(res.result);
							}
						);
						break;
					default:
						return;
				}
				break;
			default:
				return;
		}
	},
	
	setBrightness : function(value) {
		
		var method;
		var params;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{2D871359-14D8-493F-9B01-26432E3A710F}': // LCN Unit
				switch (this.instanceConfig.Unit) {
					case 0: // output
						method = 'LCN_SetIntensity';
						params = [this.instanceId, value, this.defaultRamp];
						break;
					default:
						return;
				}
				break;
			case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
				method = 'ZW_DimSet';
				params = [this.instanceId, value];
				break;
			default:
				return;
		}
		
		this.callRpcMethod(method, params);
	},
	
	getTargetTemperature: function(callback) {
		var that = this;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
				async.waterfall(
					[
						function (waterfallCallback) {
							that.callRpcMethod('IPS_GetObjectIDByIdent', ['ThermostatSetPoint1', that.instanceId], waterfallCallback);
						},
						function (res, waterfallCallback) {
							that.writeLogEntry('Result: ' + JSON.stringify(res));
							that.callRpcMethod('GetValueFloat', [res.result], waterfallCallback);
						}
					],
					function(err, res) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						callback(res.result);
					}
				);
				break;
			default:
				return;
		}
	},
	
	setTargetTemperature: function(value) {
		
		var method;
		var params;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
				method = 'ZW_ThermostatSetPointSet';
				params = [this.instanceId, 1 /* Heating */, value];
				break;
			default:
				return;
		}
		
		this.callRpcMethod(method, params);
	},
	
	getCurrentTemperature: function(callback) {
		var that = this;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
				if (this.instanceConfig.NodeClasses.indexOf(67) != -1) { // THERMOSTAT_SETPOINT
					this.getTargetTemperature(callback); // return target temperature for thermostat
				} else if (this.instanceConfig.NodeClasses.indexOf(49) != -1) { // SENSOR_MULTILEVEL
					async.waterfall(
						[
							function (waterfallCallback) {
								that.callRpcMethod('IPS_GetObjectIDByIdent', ['SensorType01', that.instanceId], waterfallCallback);
							},
							function (res, waterfallCallback) {
								that.writeLogEntry('Result: ' + JSON.stringify(res));
								that.callRpcMethod('GetValueFloat', [res.result], waterfallCallback);
							}
						],
						function(err, res) {
							that.writeLogEntry('Result: ' + JSON.stringify(res));
							callback(res.result);
						}
					);
				}
				break;
			default:
				return;
		}
	},
	
	setTargetDoorState: function(value) {
		var method;
		var params;
		var openDoor = value === 0; // value '0' --> open, value '1' --> close
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{C81E019F-6341-4748-8644-1C29D99B813E}': // LCN Shutter
				method = openDoor ? "LCN_ShutterMoveUp" : "LCN_ShutterMoveDown";
				params = [this.instanceId];
				break;
			case '{24A9D68D-7B98-4D74-9BAE-3645D435A9EF}': // EIB Shutter
				method = "EIB_DriveMove";
				params = [this.instanceId, !openDoor];
				break;
			default:
				return;
		}
		
		this.callRpcMethod(method, params);
	},
	
	getTargetDoorState: function(callback) {
		var that = this;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{C81E019F-6341-4748-8644-1C29D99B813E}': // LCN Shutter
				this.getCurrentDoorState(callback);
				break;
			default:
				return;
		}
	},
	
	getCurrentDoorState: function(callback) {
		var that = this;
		
		switch (this.instance.ModuleInfo.ModuleID) {
			case '{C81E019F-6341-4748-8644-1C29D99B813E}': // LCN Shutter
				async.waterfall(
					[
						function (waterfallCallback) {
							that.callRpcMethod('IPS_GetObjectIDByIdent', ['Action', that.instanceId], waterfallCallback);
						},
						function (res, waterfallCallback) {
							that.writeLogEntry('Result: ' + JSON.stringify(res));
							that.callRpcMethod('GetValueInteger', [res.result], waterfallCallback);
						}
					],
					function(err, res) {
						that.writeLogEntry('Result: ' + JSON.stringify(res));
						callback(res.result === 0 ? 0 : 1);
					}
				);
				break;
			default:
				return;
		}
	},
	
	callRpcMethod : function(method, params, callback) {
		this.writeLogEntry("Calling JSON-RPC method " + method + " with params " + JSON.stringify(params));

		var that = this;
		var client = new rpc.Client(this.rpcClientOptions);
		client.call({
			"jsonrpc" : "2.0",
			"method" : method,
			"params" : params,
			"id" : 0
		},
		function (err, res) {
			if (err) {
				that.writeLogEntry("There was a problem calling method " + method);
				if (callback) callback(res);
				return;
			}
			that.writeLogEntry("Called JSON-RPC method " + method + " with response: " + JSON.stringify(res));
			if (callback) {
				that.writeLogEntry('callback...');
				callback(err, res);
			}
		});
		
	},

	informationCharacteristics : function () {
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

	controlCharacteristics : function () {
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

		if (this.commands.indexOf('SetPowerState') != -1) {
			this.writeLogEntry('adding control characteristic POWER_STATE_CTYPE...');
			cTypes.push({
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
			});
		}

		if (this.commands.indexOf('SetBrightness') != -1) {
			this.writeLogEntry('adding control characteristic BRIGHTNESS_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('GetCurrentHeatingCoolingType') != -1) {
			this.writeLogEntry('adding control characteristic CURRENTHEATINGCOOLING_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('SetTargetHeatingCoolingType') != -1) {
			this.writeLogEntry('adding control characteristic TARGETHEATINGCOOLING_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('SetTargetTemperature') != -1) {
			this.writeLogEntry('adding control characteristic TARGET_TEMPERATURE_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('GetCurrentTemperature') != -1) {
			this.writeLogEntry('adding control characteristic CURRENT_TEMPERATURE_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('GetCurrentTemperature') != -1 
				|| this.commands.indexOf('SetTargetTemperature') != -1) {
			this.writeLogEntry('adding control characteristic TEMPERATURE_UNITS_CTYPE...');
			cTypes.push({
				cType: types.TEMPERATURE_UNITS_CTYPE,
				onUpdate: function(value) { that.writeLogEntry("update temperature unit to: " + value); },
				onRead : function(callback) { that.writeLogEntry("onRead called for TEMPERATURE_UNITS_CTYPE"); },
				perms: ["pr","ev"],
				format: "int",
				initialValue: 0, // 0: celsius
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "Unit",
			});
		}
		
		if (this.commands.indexOf('SetTargetDoorState') != -1) {
			this.writeLogEntry('adding control characteristic TARGET_DOORSTATE_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('GetCurrentDoorState') != -1) {
			this.writeLogEntry('adding control characteristic CURRENT_DOOR_STATE_CTYPE...');
			cTypes.push({
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
			});
		}
		
		if (this.commands.indexOf('GetObstructionDetected') != -1) {
			this.writeLogEntry('adding control characteristic OBSTRUCTION_DETECTED_CTYPE...');
			cTypes.push({
				cType: types.OBSTRUCTION_DETECTED_CTYPE,
				onUpdate: function(value) { that.writeLogEntry("onUpdate called for OBSTRUCTION_DETECTED_CTYPE with value: " + value); },
				onRead : function(callback) { that.writeLogEntry("onRead called for OBSTRUCTION_DETECTED_CTYPE"); },
				perms: ["pr","ev"],
				format: "bool",
				initialValue: false,
				supportEvents: false,
				supportBonjour: false,
				manfDescription: "obstruction detected",
			});
		}

		return cTypes;
	},

	getServices : function () {
		var services = [{
				sType : types.ACCESSORY_INFORMATION_STYPE,
				characteristics : this.informationCharacteristics(),
			}, {
				sType : this.sType,
				characteristics : this.controlCharacteristics()
			}
		];
		this.writeLogEntry("services loaded");
		return services;
	},
	
	writeLogEntry: function(message) {
		this.log(this.name + ': ' + message);
	}
};

module.exports.accessory = SymconAccessory;
module.exports.platform = SymconPlatform;
