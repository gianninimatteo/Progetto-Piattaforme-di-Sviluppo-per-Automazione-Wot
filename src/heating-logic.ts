import { Servient } from "@node-wot/core";
import { HttpClientFactory } from "@node-wot/binding-http";
import { MqttClientFactory } from "@node-wot/binding-mqtt";

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory());
servient.addClientFactory(new MqttClientFactory());

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
        } else if (temp >= target) {
            await heater.invokeAction("turnOff");
        }
    }, 5000);
});
