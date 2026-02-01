"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@node-wot/core");
const binding_http_1 = require("@node-wot/binding-http");
const binding_mqtt_1 = require("@node-wot/binding-mqtt");
const servient = new core_1.Servient();
servient.addServer(new binding_http_1.HttpServer({ port: 8081 }));
const brokerUri = "mqtt://localhost:1883";
servient.addServer(new binding_mqtt_1.MqttBrokerServer({ uri: brokerUri }));
servient.start().then(async (WoT) => {
    const thing = await WoT.produce({
        title: "TemperatureSensor",
        description: "Sensore di temperatura per una stanza",
        properties: {
            temperature: {
                type: "number",
                description: "Temperatura attuale della stanza",
                readOnly: true,
                observable: true
            }
        },
        events: {
            temperatureHigh: {
                description: "Temperatura supera soglia massima",
                data: { type: "number" }
            },
            temperatureLow: {
                description: "Temperatura scende sotto soglia minima",
                data: { type: "number" }
            }
        }
    });
    let currentTemp = 20;
    const maxThreshold = 25;
    const minThreshold = 18;
    thing.setPropertyReadHandler("temperature", async () => currentTemp);
    setInterval(() => {
        const oldTemp = currentTemp;
        currentTemp = currentTemp + (Math.random() - 0.5) * 2;
        if (oldTemp < maxThreshold && currentTemp >= maxThreshold) {
            thing.emitEvent("temperatureHigh", currentTemp);
        }
        if (oldTemp > minThreshold && currentTemp <= minThreshold) {
            thing.emitEvent("temperatureLow", currentTemp);
        }
    }, 3000);
    await thing.expose();
    console.log("Sensore temperatura esposto su HTTP (8081) e MQTT");
});
//# sourceMappingURL=sensor.js.map