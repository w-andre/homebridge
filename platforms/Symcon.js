// IP-Symcon JSON-RPC API
// remove not paired accessories from persist dir with: grep -l ':false' * | xargs rm
var types = require("HAP-NodeJS/accessories/types.js");
var rpc = require("node-json-rpc");
var async = require("async");
var symconAccessories = require('./SymconAccessories');

function SymconPlatform(log, options) {
	this.log = log;
	this.options = options;
	this.client = new rpc.Client(this.options.rpcClientOptions);
};

SymconPlatform.prototype = {

	callRpcMethod : function(method, params, callback) {
		var that = this;
		//this.log("calling method '" + method + "' with params " + JSON.stringify(params) + "...");
		this.client.call(
			{"jsonrpc" : "2.0", "method" : method, "params" : params, "id" : 0},
			function (err, res) {
				if (err) {
					that.log("[method: " + method + ", params: " + JSON.stringify(params) + "] Error: " + JSON.stringify(err));
					if (callback) callback(res);
					return;
				} else if (res.error) {
					that.log("[method: " + method + ", params: " + JSON.stringify(params) + "] Error: " + JSON.stringify(res.error));
					if (callback) callback(res);
					return;
				} else {
					//that.log("Result: " + JSON.stringify(res));
				}
				if (callback) callback(err, res);
			}
		);
	},
	
	accessories : function (callback) {
		this.log("Fetching Symcon instances...");

		var that = this;
		var foundAccessories = [];
		
		// add bridge info accessory
		foundAccessories.push(new symconAccessories.SymconBridgeInfo(this.log, this.options.name));

		async.waterfall(
			[
				function (waterfallCallback) {
					that.callRpcMethod("IPS_GetInstanceList", [], waterfallCallback);
				},
				function (res, waterfallCallback) {
					async.eachSeries(
						res.result,
						function (instanceId, eachCallback) {
							async.series(
								[
									function (parallelCallback) {
										that.callRpcMethod("IPS_GetName", [instanceId], parallelCallback);
									},
									function (parallelCallback) {
										that.callRpcMethod("IPS_GetInstance", [instanceId], parallelCallback);
									},
									function (parallelCallback) {
										that.callRpcMethod("IPS_GetConfiguration", [instanceId], parallelCallback);
									}
								],
								function (err, results) {
									var name = results[0].result;
									var instance = typeof results[1].result === 'object' ? results[1].result : JSON.parse(results[1].result);
									var instanceConfig;
									
									if (results[2] === undefined || results[2].result === undefined)
										instanceConfig = [];
									else if (typeof results[2].result === 'object')
										instanceConfig = results[2].result;
									else
										instanceConfig = JSON.parse(results[2].result);
									
									var instance = that.createSpecificAccessory(that.log, that.options.rpcClientOptions, instanceId, name, instance, instanceConfig);
									
									if (instance !== undefined) {
										foundAccessories.push(instance);
										that.log("new instance found: " + name);
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
	},

	createSpecificAccessory : function(log, rpcClientOptions, instanceId, name, instance, instanceConfig) {
		switch (instance.ModuleInfo.ModuleID) {
			case '{E75002FE-58B7-4711-9DE6-BE1D3F089A32}': // HomeKit Accessory
				switch (instanceConfig.DeviceType) {
					case 0: // switch
						return new symconAccessories.Switch.HomeKitAccessorySwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
					case 1: // light bulb
						return new symconAccessories.LightBulb.HomeKitAccessoryLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
					case 2: // garage door opener
						return new symconAccessories.GarageDoorOpener.HomeKitAccessoryGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
					case 3: // thermostat
						return new symconAccessories.Thermostat.HomeKitAccessoryThermostatAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
					case 4: // lock mechanism
						return new symconAccessories.LockMechanism.HomeKitAccessoryLockMechanismAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
					case 5: // window covering
						return new symconAccessories.WindowCovering.HomeKitAccessoryWindowCoveringAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
				}
				break;
			case '{2D871359-14D8-493F-9B01-26432E3A710F}': // LCN Unit
				switch (instanceConfig.Unit) {
					case 0: // output
						return new symconAccessories.LightBulb.LcnUnitLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
					case 2: // relay
						return new symconAccessories.Switch.LcnUnitSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
				}
				break;
			case '{C81E019F-6341-4748-8644-1C29D99B813E}': // LCN Shutter
				return new symconAccessories.GarageDoorOpener.LcnShutterGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
			case '{D62B95D3-0C5E-406E-B1D9-8D102E50F64B}': // EIB Group
				switch(instanceConfig.GroupFunction) {
					case 'Switch':
						return new symconAccessories.Switch.EibSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
				}
				break;
			case '{24A9D68D-7B98-4D74-9BAE-3645D435A9EF}': // EIB Shutter
				return new symconAccessories.GarageDoorOpener.EibShutterGarageDoorOpenerAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
			case '{101352E1-88C7-4F16-998B-E20D50779AF6}': // Z-Wave Module
				if (instanceConfig.NodeClasses.indexOf(67) != -1) { // THERMOSTAT_SETPOINT
					return new symconAccessories.Thermostat.ZWaveThermostatAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
				} else if (instanceConfig.NodeClasses.indexOf(38) != -1) { // SWITCH_MULTILEVEL
					return new symconAccessories.LightBulb.ZWaveLightBulbAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
				} else if (instanceConfig.NodeClasses.indexOf(37) != -1) { // SWITCH_BINARY
					return new symconAccessories.Switch.ZWaveSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
				}
				break;
			case '{EE4A81C6-5C90-4DB7-AD2F-F6BBD521412E}': // HomeMatic Device
				// todo: return correct type (switch, light bulb, ...) depending on configuration
				return new symconAccessories.Switch.HomeMaticSwitchAccessory(log, rpcClientOptions, instanceId, name, instance, instanceConfig);
			default:
				break;
		}
	}

};

module.exports.accessory = symconAccessories.SymconGenericAccessory;
module.exports.platform = SymconPlatform;