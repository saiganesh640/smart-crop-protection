// ESP32 -> REST. Libraries: "DHT sensor library" (Adafruit). Board: ESP32 Dev Module.
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASSWORD";
const char* API_URL   = "http://YOUR_SERVER_IP:5000/api/iot/sensor-data";
const char* DEVICE_KEY = "esp32-secret-key";   // must match DEVICE_KEY in backend .env
const int PLANT_ID = 1;                         // id shown in the app for this plant
#define DHT_PIN 4
#define SOIL_PIN 34
#define LDR_PIN 35
const int SOIL_DRY = 3200, SOIL_WET = 1300;     // calibrate: raw reading in air / in water
DHT dht(DHT_PIN, DHT22);
void setup() {
  Serial.begin(115200); dht.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
}
void loop() {
  float t = dht.readTemperature(), h = dht.readHumidity();
  int soilPct = constrain(map(analogRead(SOIL_PIN), SOIL_DRY, SOIL_WET, 0, 100), 0, 100);
  int light = map(analogRead(LDR_PIN), 0, 4095, 0, 100);
  if (!isnan(t) && !isnan(h) && WiFi.status() == WL_CONNECTED) {
    HTTPClient http; http.begin(API_URL);
    http.addHeader("Content-Type", "application/json"); http.addHeader("X-Device-Key", DEVICE_KEY);
    String body = "{\"plant_id\":" + String(PLANT_ID) + ",\"temperature\":" + String(t, 1) + ",\"humidity\":" + String(h, 1) +
                  ",\"soil_moisture\":" + String(soilPct) + ",\"light_intensity\":" + String(light) + "}";
    Serial.println(http.POST(body)); http.end();
  }
  delay(60000);   // one reading per minute
}
