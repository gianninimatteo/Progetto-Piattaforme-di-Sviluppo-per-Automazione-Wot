const SENSOR_URL = 'http://localhost:8081/temperaturesensor';
const HEATER_URL = 'http://localhost:8080/heatingsystem';

let currentTemp = 0;

function updateTemperature(temp) {
    currentTemp = temp;
    document.getElementById('currentTemp').textContent = temp.toFixed(1);
}

function addEvent(message, type = 'normal') {
    const eventsDiv = document.getElementById('events');
    const noEvents = eventsDiv.querySelector('.no-events');

    if (noEvents) {
        noEvents.remove();
    }

    const eventItem = document.createElement('div');
    eventItem.className = `event-item ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    eventItem.textContent = `[${timestamp}] ${message}`;

    eventsDiv.insertBefore(eventItem, eventsDiv.firstChild);

    if (eventsDiv.children.length > 10) {
        eventsDiv.removeChild(eventsDiv.lastChild);
    }
}

async function readTemperature() {
    try {
        const response = await fetch(`${SENSOR_URL}/properties/temperature`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Errore lettura temperatura:', error);
        return null;
    }
}

async function setTargetTemperature() {
    const targetInput = document.getElementById('targetTemp');
    const targetTemp = parseFloat(targetInput.value);

    try {
        const response = await fetch(`${HEATER_URL}/actions/setTargetTemperature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ setTargetTemperature: targetTemp })
        });

        if (response.ok) {
            addEvent(`Temperatura target impostata a ${targetTemp}°C`);
        }
    } catch (error) {
        console.error('Errore impostazione temperatura:', error);
        addEvent('Errore durante l\'impostazione della temperatura', 'high');
    }
}

async function pollTemperature() {
    const temp = await readTemperature();
    if (temp !== null) {
        updateTemperature(temp);
    }

    const targetTemp = parseFloat(document.getElementById('targetTemp').value);
    const statusSpan = document.getElementById('heaterStatus');

    if (temp !== null && temp < targetTemp) {
        statusSpan.textContent = 'Acceso';
        statusSpan.className = 'on';
    } else {
        statusSpan.textContent = 'Spento';
        statusSpan.className = '';
    }
}

document.getElementById('setTarget').addEventListener('click', setTargetTemperature);

setInterval(pollTemperature, 2000);
pollTemperature();

addEvent('Dashboard avviata');
