| Sensor | ESP32 pin | Notes |
|---|---|---|
| DHT22 (temp + humidity) | GPIO 4 | 3.3V, GND, 10k pull-up on data |
| Capacitive soil moisture | GPIO 34 (ADC) | Calibrate SOIL_DRY / SOIL_WET in the sketch |
| LDR light sensor (divider) | GPIO 35 (ADC) | LDR + 10k resistor to GND |
| Optional pH / leaf wetness | GPIO 32 / 33 | Add fields to `SensorData` and the payload |

Test without hardware:
`curl -X POST localhost:5000/api/iot/sensor-data -H "Content-Type: application/json" -H "X-Device-Key: esp32-secret-key" -d '{"plant_id":1,"temperature":27.5,"humidity":68,"soil_moisture":42,"light_intensity":70}'`
