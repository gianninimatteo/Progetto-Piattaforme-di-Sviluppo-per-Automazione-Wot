"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@node-wot/core");
const binding_http_1 = require("@node-wot/binding-http");
const binding_mqtt_1 = require("@node-wot/binding-mqtt");
const servient = new core_1.Servient();
servient.addClientFactory(new binding_http_1.HttpClientFactory());
servient.addClientFactory(new binding_mqtt_1.MqttClientFactory());
servient.start().then(async (WoT) => {
    const sensorThing = await WoT.requestThingDescription("http://localhost:8081/temperaturesensor");
    const heaterThing = await WoT.requestThingDescription("http://localhost:8080/heatingsystem");
    const sensor = await WoT.consume(sensorThing);
    const heater = await WoT.consume(heaterThing);
    console.log("Orchestratore avviato");
    setInterval(async () => {
        const temperatureOutput = await sensor.readProperty("temperature");
        const targetTemperatureOutput = await heater.readProperty("targetTemperature");
        const tempValue = await temperatureOutput.value();
        const targetValue = await targetTemperatureOutput.value();
        const temp = Number(tempValue);
        const target = Number(targetValue);
        console.log(`Temperatura attuale: ${temp}°C, Target: ${target}°C`);
        if (temp < target) {
            await heater.invokeAction("turnOn");
        }
        else if (temp >= target) {
            await heater.invokeAction("turnOff");
        }
    }, 5000);
});
//# sourceMappingURL=heating-logic.js.map