import { Servient } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";
import { MqttBrokerServer } from "@node-wot/binding-mqtt";

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8081 }));
const brokerUri = "mqtt://localhost:1883";
servient.addServer(new MqttBrokerServer({ uri: brokerUri }));

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
